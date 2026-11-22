import { useState } from "react";
import { api } from "@/state/api";
import { t } from "@/lib/i18n";
import type { MissionView } from "../../../shared/mission";

export function MissionMemory({ mission }: { mission: MissionView }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  if (!mission.artifact) return null;
  const base = "/api/bots/" + encodeURIComponent(mission.botId) + "/memory/file";
  const path = "memory/mission-" + mission.id + "-v" + mission.version + ".md";
  const propose = () => {
    const lines = [mission.name, "", ...mission.steps.flatMap(s => s.observation
      ? [s.observation.name + " " + s.observation.version + " — " + s.observation.dependencies + " direct runtime dependencies. " + s.observation.source] : []),
      "", "Verified report SHA-256 " + mission.artifact!.sha256];
    setDraft(lines.join("\n"));
  };
  const save = async () => {
    if (!draft?.trim() || state === "saving") return;
    setState("saving");
    try {
      const current = await api<{ exists: boolean; hash: string; text: string }>(base + "?path=" + encodeURIComponent(path));
      if (current.exists && current.text !== draft) { setState("error"); return; }
      if (!current.exists) await api(base, { method: "PUT", body: JSON.stringify({ path, text: draft, expectedHash: current.hash }) });
      setState("saved"); setDraft(null);
    } catch { setState("error"); }
  };
  return <div className="mt-3 text-[13px]">
    {state === "saved" ? <p role="status" className="text-ink-secondary">{t("mission.memorySaved")}</p> :
      draft === null ? <button type="button" className="ui-button ui-button-sm" onClick={propose}>{t("mission.proposeNote")}</button> :
      <div className="space-y-2"><label className="block">{t("mission.noteReview")}
        <textarea className="mt-1 w-full rounded-lg border border-hairline bg-inset p-2" rows={5} maxLength={6000}
          disabled={state === "saving"} value={draft} onChange={e => setDraft(e.target.value)} /></label>
        <div className="flex gap-2"><button type="button" className="ui-button ui-button-sm ui-button-primary"
          disabled={!draft.trim() || state === "saving"} onClick={() => void save()}>{t("mission.saveNote")}</button>
          <button type="button" className="ui-button ui-button-sm" disabled={state === "saving"} onClick={() => { setDraft(null); setState("idle"); }}>{t("common.cancel")}</button></div>
        {state === "error" && <p role="alert" className="text-danger">{t("mission.noteProblem")}</p>}</div>}
  </div>;
}
