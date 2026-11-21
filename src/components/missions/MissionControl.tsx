import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ListChecks, Plus, X } from "lucide-react";
import { api } from "@/state/api";
import { useStoreSelector } from "@/state/store-select";
import type { Bot } from "@/state/store";
import { t } from "@/lib/i18n";
import { listenLiveFrames } from "@/lib/live-events";
import { useOwnerOrAdmin } from "@/lib/use-owner-or-admin";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import type { MissionAction, MissionView } from "../../../shared/mission";
import { NavRow } from "../bot-panel/rows";
import { MissionDetail } from "./MissionDetail";
import { MissionForm, type FormData } from "./MissionForm";

type Summary = Pick<MissionView, "id" | "name" | "state">;

export function MissionControlRow({ bot }: { bot: Bot }) {
  const available = useStoreSelector(s => s.config?.missionsEnabled === true);
  const owner = useOwnerOrAdmin();
  const [open, setOpen] = useState(false);
  if (!available || !owner) return null;
  return <><NavRow icon={ListChecks} title={t("mission.title")} onClick={() => setOpen(true)} />
    {open && createPortal(<MissionControl key={bot.id} bot={bot} onClose={() => setOpen(false)} />, document.body)}</>;
}

export function MissionControl({ bot, onClose }: { bot: Bot; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  useModalDialog(dialog, onClose);
  const bots = useStoreSelector(s => s.bots);
  const base = "/api/bots/" + encodeURIComponent(bot.id) + "/missions";
  const [list, setList] = useState<Summary[]>([]);
  const [selected, select] = useState<string | null>(null), [detail, setDetail] = useState<MissionView | null>(null);
  const [form, setForm] = useState<"new" | "revise" | null>(null);
  const [error, setError] = useState(""), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const writing = useRef(false), generation = useRef(0);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload(n => n + 1), []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => { if (!timer) timer = setTimeout(() => { timer = undefined; refresh(); }, 70); };
    const forget = listenLiveFrames({ onFrame: frame => {
      if (frame.kind === "mission.changed" && frame.botId === bot.id) schedule();
    }, onMissedFrames: schedule });
    return () => { clearTimeout(timer); forget(); };
  }, [bot.id, refresh]);
  useEffect(() => {
    const abort = new AbortController(), seq = ++generation.current;
    const load = async () => {
      const { missions } = await api<{ missions: Summary[] }>(base, { signal: abort.signal });
      const id = selected ?? missions[0]?.id;
      const view = id ? await api<MissionView>(base + "/" + id, { signal: abort.signal }) : null;
      if (abort.signal.aborted || seq !== generation.current) return;
      setList(missions); setDetail(view); setLoading(false);
      if (view && !selected) select(view.id);
    };
    void load().catch(() => { if (!abort.signal.aborted && seq === generation.current) {
      setError(t("mission.loadError")); setLoading(false);
    } });
    return () => abort.abort();
  }, [base, selected, reload]);
  const current = detail?.id === selected ? detail : null;
  async function write(path: string, body: unknown) {
    if (writing.current) return;
    writing.current = true; setBusy(true); setError("");
    try {
      const updated = await api<MissionView>(path, { method: "POST", body: JSON.stringify(body) });
      generation.current++; select(updated.id); setDetail(updated); setForm(null); refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("mission.actionError")); refresh();
    } finally { writing.current = false; setBusy(false); }
  }
  const action = (value: MissionAction, step?: string) => {
    if (current) void write(base + "/" + current.id, { action: value, step, revision: current.revision });
  };
  const save = async (data: FormData) => {
    if (form === "revise" && current) await write(base + "/" + current.id, { action: "revise", revision: current.revision, objective: data.objective, plan: data.plan, limits: data.limits });
    else await write(base, data);
  };
  return <div className="ui-scrim fixed inset-0 z-[100] grid place-items-center p-2 sm:p-5">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="mission-control-title" tabIndex={-1}
      className="ui-modal flex h-[min(820px,94dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-panel text-ink">
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"><div className="flex min-w-0 items-center gap-2">
        <ListChecks size={18} className="shrink-0 text-accent-text" aria-hidden="true" /><h1 id="mission-control-title" className="truncate text-[17px] font-semibold">{t("mission.title")}</h1>
        <span className="truncate text-[13px] text-ink-secondary">{bot.name}</span></div>
        <button type="button" className="ui-icon-button" onClick={onClose} aria-label={t("common.close")} title={t("common.close")}><X size={16} aria-hidden="true" /></button></header>
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] sm:grid-cols-[225px_minmax(0,1fr)] sm:grid-rows-1">
        <nav aria-label={t("mission.list")} className="flex max-h-36 flex-col gap-2 overflow-y-auto bg-inset p-3 sm:max-h-none">
          <button type="button" className="ui-button ui-button-md shrink-0 self-start" disabled={busy} onClick={() => { setForm("new"); setError(""); }}>
            <Plus size={16} aria-hidden="true" />{t("mission.new")}</button>
          <ul className="flex flex-col gap-1">{list.map(row => <li key={row.id}><button type="button" aria-current={!form && selected === row.id ? "page" : undefined}
            disabled={busy} onClick={() => { select(row.id); setForm(null); setError(""); }}
            className={"w-full rounded-lg px-3 py-2 text-start hover:bg-raised-hover " + (!form && selected === row.id ? "bg-raised" : "")}>
            <span className="block truncate text-[13px] font-medium">{row.name}</span>
            <span className="text-[12px] text-ink-secondary">{t(`mission.state.${row.state}`)}</span></button></li>)}</ul>
        </nav>
        <main className="min-h-0 min-w-0 overflow-y-auto bg-app p-4 sm:p-7">
          {error && <div role="alert" className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-danger">{error}
            <button className="ui-button ui-button-sm" onClick={() => { setError(""); refresh(); }}>{t("chat.retry")}</button></div>}
          {form || (!loading && !list.length && !error)
            ? <MissionForm key={form === "revise" ? current?.id : "new"} bot={bot} bots={bots.filter(b => !b.hidden)} previous={form === "revise" ? current ?? undefined : undefined}
                busy={busy} onSave={save} onBack={() => list.length ? setForm(null) : onClose()} />
            : current ? <MissionDetail key={current.id + ":" + current.version} mission={current} bots={bots} busy={busy}
                path={base + "/" + current.id} onAction={action} onRevise={() => setForm("revise")} />
            : !error && <p role="status" className="text-[13px] text-ink-secondary">{t("mission.loading")}</p>}
        </main>
      </div>
    </div>
  </div>;
}
