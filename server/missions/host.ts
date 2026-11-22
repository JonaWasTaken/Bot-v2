import { join } from "node:path";
import { Readable } from "node:stream";
import { allowsTool } from "../../shared/tool-scope.ts";
import { ATTACHMENTS_DIR, saveFile } from "../attachments.ts";
import { redactSecretsInText } from "../../shared/redact.ts";
import { readMemoryDoc } from "../memory-store.ts";
import type { MissionRecord } from "./plan.ts";
import { openMessageFile } from "../message-file.ts";
import type { Store } from "../store.ts";
import type { SideJobText } from "../side-jobs.ts";
import type { MissionHost } from "./control.ts";
import { readPackage } from "./research.ts";

interface HostOptions {
  store: Pick<Store, "bot">;
  enabled(): boolean;
  busy(id: string): boolean;
  toolsEnabled(instanceId: string): boolean;
  held(id: string): string | null;
  model(id: string): SideJobText | null;
  changed(id: string): void;
}
const requiredTools = {
  plan: [], coordinate: ["coordinate_bots"], source: ["wait_until"], report: ["attach_file"], verify: ["attach_file"],
} as const;

export function createMissionHost(deps: HostOptions): MissionHost {
  return {
    busy: deps.busy, changed: deps.changed, readPackage,
    refusal(botId, operation) {
      if (!deps.enabled()) return "Missions require a personal workspace.";
      const bot = deps.store.bot(botId);
      if (!bot || bot.hidden || bot.home) return "The assigned bot is unavailable in this workspace.";
      if (!deps.toolsEnabled(bot.modelSelection.instanceId)) return "The assigned engine does not have tools enabled.";
      const held = deps.held(botId);
      if (held) return held;
      if (requiredTools[operation].some(name => !allowsTool(bot.toolScope, { kind: "mcp", server: "agents", name })))
        return "The assigned bot's tool selection does not allow this mission operation.";
      return undefined;
    },
    context(botId, topic) {
      const doc = readMemoryDoc(botId, "memory/" + topic);
      if (!doc.exists) throw new Error("The selected memory topic is unavailable.");
      return redactSecretsInText(doc.text).slice(0, 1200);
    },
    async plan(botId, prompt, signal, missionId) {
      const model = deps.model(botId);
      if (!model) throw new Error("No planning model is available.");
      let usage: MissionRecord["usage"];
      const text = await model.generateText(prompt, { signal, operationId: missionId, measured: ({ input, output, cachedInput, costUsd }) => {
        usage = { input, output, cachedInput, costUsd };
      } });
      return { text, usage };
    },
    async save(id, text) {
      const bytes = Buffer.from(text);
      await saveFile(Readable.from([bytes]), "report.md", "text/markdown", { uploadId: id, expectedBytes: bytes.length });
    },
    async read(id) {
      const file = await openMessageFile(join(ATTACHMENTS_DIR, id + ".md"), [ATTACHMENTS_DIR], 32 * 1024);
      try { return await file.handle.readFile(); } finally { await file.handle.close(); }
    },
  };
}
