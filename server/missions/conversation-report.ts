import { join } from "node:path";
import { z } from "zod";
import type { MissionView } from "../../shared/mission.ts";
import { ATTACHMENTS_DIR } from "../attachments.ts";
import { commandReceipt } from "../commands.ts";
import { readMessage } from "../message-db.ts";
import type { Store } from "../store.ts";
import { conflict, type MissionControl } from "./control.ts";

export type MissionProjectStore = Pick<Store, "project" | "taskByThread" | "appendMessage">;
export const postReportRequest = z.strictObject({ revision: z.number().int().positive() });

export function projectConversation(store: MissionProjectStore, botId: string, projectId?: string, threadId?: string) {
  if (!threadId || !projectId || !store.project(botId, projectId)) return undefined;
  const task = store.taskByThread(botId, threadId);
  return task?.projectId === projectId && task.archivedAt === undefined ? threadId : undefined;
}

function deliveryCommand(mission: MissionView) {
  return { kind: "mission.post-report", key: mission.id + ":" + mission.version };
}

function deliveryState(mission: MissionView, threadId: string) {
  const command = deliveryCommand(mission);
  const receipt = commandReceipt<string>(command.kind, command.key);
  if (!receipt) return "ready";
  const posted = readMessage(threadId, receipt.result);
  return posted?.attachments?.some(file => file.kind === "file" && file.name === mission.artifact?.name) ? "posted" : "removed";
}

export function withConversationReport(store: MissionProjectStore, mission: MissionView): MissionView {
  if (mission.state !== "completed" || !mission.artifact) return mission;
  const threadId = projectConversation(store, mission.botId, mission.projectId, mission.conversationId);
  return threadId ? { ...mission, conversationReport: deliveryState(mission, threadId) } : mission;
}

export async function postConversationReport(store: MissionProjectStore, service: MissionControl,
  botId: string, id: string, revision: number, stillAllowed: () => boolean): Promise<MissionView> {
  const mission = service.get(botId, id);
  if (mission.revision !== revision || mission.state !== "completed" || !mission.artifact)
    throw conflict("Review the completed mission before adding its report.");
  const threadId = projectConversation(store, botId, mission.projectId, mission.conversationId);
  if (!threadId) throw conflict("The linked conversation is unavailable in this project.");
  const { attachmentId, text } = await service.verifiedReport(botId, id);
  // Authorization and folder membership can change while the verified attachment is being read.
  if (!stillAllowed()) throw Object.assign(new Error("Access to this mission ended."), { status: 403 });
  if (!projectConversation(store, botId, mission.projectId, threadId))
    throw conflict("The linked conversation is unavailable in this project.");
  const state = deliveryState(mission, threadId);
  if (state === "removed") throw conflict("The posted report was removed from this conversation.");
  if (state === "ready") {
    store.appendMessage(threadId, { role: "bot", kind: "text", text, attachments: [
      { kind: "file", name: mission.artifact.name, mime: "text/markdown", path: join(ATTACHMENTS_DIR, attachmentId + ".md") },
    ] }, { ...deliveryCommand(mission), receipt: "message-id" });
  }
  return { ...mission, conversationReport: "posted" };
}
