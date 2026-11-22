import { useState, type FormEvent } from "react";
import { Select } from "../Select";
import { t } from "@/lib/i18n";
import type { Bot } from "@/state/store";
import type { MissionLimits, MissionView, ResearchPlan } from "../../../shared/mission";

const field = "mt-1 w-full rounded-lg border border-hairline bg-inset px-3 py-2 text-[14px] text-ink";
export interface FormData {
  id: string;
  name: string;
  objective: string;
  researcherId: string;
  projectId?: string;
  conversationId?: string;
  memoryTopic?: string;
  plan?: ResearchPlan;
  limits: Partial<MissionLimits>;
}

export function MissionForm({ bot, bots, previous, fixedProjectId, busy, onSave, onBack }: {
  bot: Bot; bots: Bot[]; previous?: MissionView; fixedProjectId?: string; busy: boolean; onSave: (data: FormData) => Promise<void>; onBack: () => void;
}) {
  const [id] = useState(() => crypto.randomUUID());
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState(previous?.objective ?? "");
  const [names, setNames] = useState(previous?.plan?.packages.join(", ") ?? "");
  const [metric, setMetric] = useState<ResearchPlan["metric"]>(previous?.plan?.metric ?? "dependencies");
  const [researcherId, setResearcher] = useState(previous?.researcherId ?? bot.id);
  const [projectId, setProject] = useState(fixedProjectId ?? previous?.projectId ?? "");
  const [conversationId, setConversation] = useState("");
  const conversations = projectId ? bot.tasks?.filter(task => task.projectId === projectId && task.archivedAt === undefined) ?? [] : [];
  const [concurrency, setConcurrency] = useState(previous?.limits.concurrency ?? 3);
  const [toolCalls, setToolCalls] = useState(previous?.limits.toolCalls ?? 12);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const packages = names.trim().split(/[\s,]+/).filter(Boolean);
    await onSave({ id, name: name.trim() || (objective.trim().length <= 70 ? objective.trim() : t("mission.defaultName")), objective: objective.trim(), researcherId, projectId: projectId || undefined, conversationId: conversationId || undefined, memoryTopic: !packages.length && topic.trim() || undefined,
      plan: packages.length ? { packages, metric } : undefined, limits: { concurrency, toolCalls } });
  }
  return <form className="mx-auto flex w-full max-w-xl flex-col gap-5" onSubmit={submit}>
    <h2 className="text-xl font-semibold text-ink">{t(previous ? "mission.reviseTitle" : "mission.createTitle")}</h2>
    {!previous && <label className="text-[13px] font-medium">{t("mission.name")}
      <input className={field} maxLength={100} disabled={busy} value={name} onChange={e => setName(e.target.value)} placeholder={t("mission.defaultName")} /></label>}
    <label className="text-[13px] font-medium">{t("mission.objective")}
      <textarea dir="auto" className={field} rows={3} required maxLength={1600} value={objective} disabled={busy}
        placeholder={t("mission.example")} onChange={e => setObjective(e.target.value)} /></label>
    <label className="text-[13px] font-medium">{t("mission.packages")}
      <input dir="auto" className={field} maxLength={1100} value={names} onChange={e => setNames(e.target.value)} required={!!previous} disabled={busy}
        placeholder={t("mission.packageExample")} />
      <span className="mt-1 block font-normal text-ink-secondary">{t(previous ? "mission.reviseHint" : "mission.planHint")}</span>
    </label>
    {names.trim() && <label className="text-[13px] font-medium">{t("mission.criterion")}
      <Select className="mt-1 w-full" value={metric} onChange={e => setMetric(e.target.value as ResearchPlan["metric"])}>
        <option value="dependencies">{t("mission.metric.dependencies")}</option><option value="size">{t("mission.metric.size")}</option>
      </Select></label>}
    {!previous && bots.length > 1 && <label className="text-[13px] font-medium">{t("mission.researcher")}
      <Select className="mt-1 w-full" value={researcherId} onChange={e => setResearcher(e.target.value)}>
        {bots.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></label>}
    {!previous && !fixedProjectId && !!bot.projects?.length && <label className="text-[13px] font-medium">{t("mission.project")}
      <Select className="mt-1 w-full" value={projectId} onChange={e => { setProject(e.target.value); setConversation(""); }}>
        <option value="">{t("mission.noProject")}</option>{bot.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></label>}
    {!previous && conversations.length > 0 && <label className="text-[13px] font-medium">{t("mission.conversation")}
      <Select className="mt-1 w-full" value={conversationId} disabled={busy} onChange={e => setConversation(e.target.value)}>
        <option value="">{t("mission.noConversation")}</option>
        {conversations.map(task => <option key={task.threadId} value={task.threadId}>{task.title || t("task.newShort")}</option>)}
      </Select></label>}
    <details><summary className="cursor-pointer text-[13px] font-medium text-ink-secondary">{t("mission.limits")}</summary>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
        <label>{t("mission.concurrency")}<input className={field} type="number" min={1} max={4} required value={concurrency} onChange={e => setConcurrency(e.target.valueAsNumber || 0)} /></label>
        <label>{t("mission.toolBudget")}<input className={field} type="number" min={1} max={50} required value={toolCalls} onChange={e => setToolCalls(e.target.valueAsNumber || 0)} /></label>
      </div>{!previous && !names.trim() && <label className="mt-3 block text-[13px]">{t("mission.contextTopic")}
        <input className={field} maxLength={205} value={topic} onChange={e => setTopic(e.target.value)} placeholder="architecture.md" />
        <span className="mt-1 block text-ink-secondary">{t("mission.contextHint")}</span></label>}</details>
    <div className="flex flex-wrap gap-2"><button type="submit" className="ui-button ui-button-md ui-button-primary" disabled={busy || !objective.trim()}>
      {t(previous ? "mission.savePlan" : "mission.makePlan")}</button>
      <button type="button" className="ui-button ui-button-md" onClick={onBack} disabled={busy}>{t("common.cancel")}</button></div>
  </form>;
}
