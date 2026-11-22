import { useState } from "react";
import { Check, Circle, CircleAlert, Download, FileCheck2, FileText, LoaderCircle, Pause, Play, RotateCcw, Square } from "lucide-react";
import { MissionMemory } from "./MissionMemory";
import { openExternalLink } from "@/lib/app-links";
import { api } from "@/state/api";
import { t } from "@/lib/i18n";
import type { Bot } from "@/state/store";
import { MarkdownFileView } from "../MarkdownFilePreview";
import type { MissionAction, MissionStepView, MissionView } from "../../../shared/mission";

const btn = "ui-button ui-button-sm";
export function MissionDetail({ mission: m, bots, busy, onAction, onRevise, path }: {
  mission: MissionView; bots: Bot[]; busy: boolean; onAction: (action: MissionAction, step?: string) => void; onRevise: () => void; path: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [opening, setOpening] = useState(false), [error, setError] = useState("");
  const done = m.steps.filter(s => s.status === "verified" || s.status === "executed").length;
  const controls = ({
    planning: ["start", "cancel"], review: ["start", "revise", "decline"], running: ["pause", "cancel"],
    verifying: ["pause", "cancel"], paused: ["resume", "revise", "cancel"], partial: ["revise", "cancel"],
    failed: ["revise", "cancel"], completed: [], cancelled: [],
  } satisfies Record<MissionView["state"], MissionAction[]>)[m.state];
  const participants = [...new Set([m.botId, m.researcherId])];
  const agent = (id: string) => bots.find(b => b.id === id)?.name ?? id;
  const title = (s: MissionStepView) => s.kind === "source" ? s.name : t(s.kind === "report" ? "mission.write" : "mission.verify");
  async function showReport() {
    if (preview !== null) { setPreview(null); return; }
    setOpening(true); setError("");
    try { setPreview((await api<{ text: string }>(path + "/artifact")).text); }
    catch { setError(t("mission.artifactError")); }
    finally { setOpening(false); }
  }
  return <article className="mx-auto w-full max-w-3xl space-y-6">
    <header><div className="flex items-center gap-2 text-[12px] text-ink-secondary">
      <span className="ui-chip">{t("mission.state." + m.state as `mission.state.${typeof m.state}`)}</span>
      <span>{t("mission.version", { n: m.version })}</span>
    </div><h2 dir="auto" className="mt-3 break-words text-xl font-semibold text-ink">{m.name}</h2>
    {m.name !== m.objective && <p dir="auto" className="mt-2 whitespace-pre-wrap break-words text-[14px] text-ink-secondary">{m.objective}</p>}
    {m.plan && <p className="mt-2 text-[14px] text-ink-secondary">{t("mission.metric." + m.plan.metric as `mission.metric.${typeof m.plan.metric}`)} · {t("mission.eligible")}</p>}
    </header>
    {m.state === "review" && <section className="rounded-lg bg-inset p-3 text-[13px] text-ink-secondary"><p className="font-medium text-ink">{t("mission.approval")}</p>
      <p className="mt-1">{t("mission.approvalBody", { names: m.plan?.packages.join(", ") ?? "", n: m.limits.toolCalls })}</p></section>}
    {m.issue && <p role="status" className="flex gap-2 text-[13px] text-ink-secondary"><CircleAlert size={16} className="shrink-0" aria-hidden="true" />{m.issue}</p>}
    <div className="flex flex-wrap gap-2 empty:hidden">
      {controls.map(a => {
        const Icon = a === "pause" ? Pause : a === "cancel" || a === "decline" ? Square : a === "revise" ? FileText : Play;
        return <button key={a} type="button" className={btn + (a === "start" || a === "resume" ? " ui-button-primary" : "")}
          disabled={busy || !m.actions.includes(a)} onClick={() => a === "revise" ? onRevise() : onAction(a)}><Icon size={14} aria-hidden="true" />{t(`mission.action.${a}`)}</button>;
      })}
    </div>
    {m.artifact && <section className="rounded-lg border border-hairline p-4"><div className="flex items-center gap-2"><FileCheck2 size={18} aria-hidden="true" />
      <h3 className="text-[15px] font-semibold">{m.artifact.name}</h3></div>
      <p className="my-2 text-[12px] text-ink-secondary">{t("mission.artifactReceipt", { bytes: m.artifact.bytes, date: new Date(m.artifact.verifiedAt).toLocaleString() })}</p>
      <div className="flex flex-wrap gap-2"><button type="button" className={btn} aria-expanded={preview !== null} aria-controls="mission-report" disabled={opening} onClick={() => void showReport()}>{t(preview === null ? "mission.preview" : "mission.hide")}</button>
      <a className={btn} download="report.md" href={path + "/export"}><Download size={14} aria-hidden="true" />{t("mission.download")}</a></div>
      {error && <p role="alert" className="text-danger">{error}</p>}
      <div id="mission-report" hidden={preview === null} className="mt-3">{preview !== null && <MarkdownFileView source={preview} showSource={false} />}</div><MissionMemory mission={m} /></section>}
    {!!m.steps.length && <section><div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-semibold">{t("mission.execution")}</h3>
      <span className="text-[12px] tabular-nums text-ink-secondary">{t("mission.progress", { done, total: m.steps.length })}</span></div>
      <ol className="mt-2 divide-y divide-hairline">{m.steps.map(s => {
        const Icon = s.status === "verified" ? Check : s.status === "failed" ? CircleAlert : s.status === "running" ? LoaderCircle : Circle;
        return <li key={s.key} className="flex items-start gap-3 py-3"><Icon size={16} aria-hidden="true"
          className={"mt-1 shrink-0 " + (s.status === "verified" ? "text-accent-text" : s.status === "running" ? "animate-spin text-accent-text motion-reduce:animate-none" : "text-ink-tertiary")} />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><strong className="break-all text-[14px] font-medium">{title(s)}</strong>
            <span className="text-[12px] text-ink-secondary">{t(`mission.step.${s.status}`)}</span></div>
          <p className="mt-0.5 text-[12px] text-ink-secondary">{agent(s.botId)}{s.observation ? " · " + s.observation.version + " · " + s.observation.license : ""}
            {s.dependsOn.length > 0 && " · " + t("mission.after", { names: s.dependsOn.map(key => title(m.steps.find(dep => dep.key === key)!)).join(", ") })}</p>
          {s.observation && <a href={s.observation.source} className="text-[12px] text-accent-text hover:underline"
            onClick={e => { e.preventDefault(); void openExternalLink(s.observation!.source); }}>{t("mission.source")}</a>}
          {s.error && <p className="mt-1 text-[13px] text-danger">{s.error}</p>}
          {s.status === "failed" && <button className={btn + " mt-2"} disabled={busy || !m.retryKeys.includes(s.key)} onClick={() => onAction("retry", s.key)}><RotateCcw size={14} aria-hidden="true" />{t("mission.retry")}</button>}
          </div></li>;
      })}</ol></section>}
    {!!m.steps.length && <details className="text-[13px]"><summary className="cursor-pointer font-medium">{t("mission.agents")}</summary>
      {participants.map(id => <section className="mt-3" key={id}><h4 className="font-medium">{agent(id)}</h4>
        <ul className="mt-1 space-y-1 text-ink-secondary">{m.steps.filter(s => s.botId === id).map(s =>
          <li key={s.key} className="flex flex-wrap justify-between gap-x-3"><span>{title(s)} ? {t(`mission.step.${s.status}`)}</span>
            <span>{t("mission.attempts", { n: s.attempts, tools: s.toolCalls })}</span></li>)}</ul></section>)}</details>}
    <details className="text-[13px]"><summary className="cursor-pointer font-medium">{t("mission.activity")}</summary>
      <p className="my-2 text-ink-secondary">{t("mission.measured", { tools: m.usage.toolCalls, models: m.usage.modelCalls })}</p>
      {m.usage.input !== undefined && m.usage.output !== undefined && <p className="mb-2 text-ink-secondary">{t("mission.tokens", { input: m.usage.input, output: m.usage.output })}</p>}
      {m.history.map(v => <p key={v.version} className="my-2 text-ink-secondary">{t("mission.version", { n: v.version })} ? {v.plan?.packages.join(", ")} ? {v.objective}</p>)}
      <ul className="space-y-1">{m.activity.map((e, i) => <li key={i} className="flex gap-3"><time className="shrink-0 tabular-nums text-ink-secondary">{new Date(e.at).toLocaleTimeString()}</time><span className="break-words">{e.text}</span></li>)}</ul>
      <a className={btn + " mt-3"} download="mission.md" href={path + "/summary"}>{t("mission.export")}</a>
    </details>
  </article>;
}
