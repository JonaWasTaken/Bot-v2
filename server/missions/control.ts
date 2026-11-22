import { randomUUID } from "node:crypto";
import { z } from "zod";
import { redactSecretsInText } from "../../shared/redact.ts";
import type { MissionView } from "../../shared/mission.ts";
import type { Runtime } from "../runtime/runtime.ts";
import type { RuntimeStore } from "../runtime/store.ts";
import { terminal, type Assignment } from "../runtime/types.ts";
import { checkedPlan, defaultLimits, limitsSchema, mayTransition, memoryTopic, researchPlan, type MissionRecord } from "./plan.ts";
import { hasMission, missionState, missionView, type MissionRoot } from "./view.ts";
import { sha256 } from "./research.ts";

const botKey = z.string().min(1).max(120).regex(/^[\w-]+$/);
export const createRequest = z.strictObject({ id: z.uuid(), name: z.string().trim().min(1).max(100), objective: z.string().trim().min(1).max(1600),
  researcherId: botKey.optional(), projectId: botKey.optional(), conversationId: z.string().min(1).max(200).regex(/^[\w-]+$/).optional(), memoryTopic: memoryTopic.optional(), plan: researchPlan.optional(), limits: limitsSchema.partial().optional() });
export const actionRequest = z.strictObject({ action: z.enum(["start", "decline", "pause", "resume", "cancel", "retry", "revise"]),
  revision: z.number().int().positive(), objective: z.string().trim().min(1).max(1600).optional(), step: z.string().max(160).optional(), plan: researchPlan.optional(), limits: limitsSchema.partial().optional() });
export type CreateMission = z.infer<typeof createRequest>;
export type MissionCommand = z.infer<typeof actionRequest>;
export const conflict = (message: string) => Object.assign(new Error(message), { status: 409 });

export interface MissionHost {
  refusal(botId: string, operation: "plan" | "coordinate" | "source" | "report" | "verify"): string | undefined;
  busy(botId: string): boolean;
  context(botId: string, topic: string): string;
  plan(botId: string, objective: string, signal: AbortSignal, missionId: string): Promise<{ text: string; usage?: MissionRecord["usage"] }>;
  changed(botId: string): void;
  readPackage: typeof import("./research.ts").readPackage;
  save(id: string, text: string): Promise<void>;
  read(id: string): Promise<Buffer>;
}

export class MissionControl {
  protected readonly store: RuntimeStore;
  protected readonly runtime: Runtime;
  protected readonly host: MissionHost;
  constructor(store: RuntimeStore, runtime: Runtime, host: MissionHost) {
    this.store = store;
    this.runtime = runtime;
    this.host = host;
  }

  list(botId: string, projectId?: string) {
    return this.store.all({ missions: true, botId, projectId }).filter(hasMission).reverse().map(root => {
      const needsSteps = !terminal(root.status) && (root.mission.phase === "active" || root.mission.phase === "blocked");
      return { id: root.id, name: root.mission.name, state: missionState(root, needsSteps ? this.children(root) : []) };
    });
  }

  keptArtifacts(): string[] {
    return this.store.all({ missions: true }).filter(hasMission).flatMap(({ mission }) =>
      [mission.artifactId, ...(mission.history ?? []).map(plan => plan.artifactId)].map(id => id + ".md"));
  }

  protected root(botId: string, id: string): MissionRoot {
    const row = this.store.get(id);
    if (!hasMission(row) || row.assignee.botId !== botId) throw Object.assign(new Error("Mission not found."), { status: 404 });
    return row;
  }

  get(botId: string, id: string): MissionView {
    const root = this.root(botId, id);
    return missionView(root, this.store.children(id), this.store.events(id));
  }

  protected update(root: MissionRoot, changes: Partial<MissionRecord>, detail: string): void {
    if (terminal(root.status) || changes.phase && !mayTransition(root.mission.phase, changes.phase)) throw conflict("Invalid mission transition.");
    root.mission = { ...root.mission, ...changes, revision: root.mission.revision + 1 };
    root.lastActivityAt = Date.now();
    this.store.update(root, { kind: "progress", at: root.lastActivityAt, detail });
  }

  create(botId: string, input: CreateMission): MissionView {
    const { id, plan, name, objective, researcherId = botId, projectId } = input;
    if (redactSecretsInText(name) !== name || redactSecretsInText(objective) !== objective) throw conflict("Remove credentials from the mission text.");
    const limits = { ...defaultLimits, ...input.limits };
    if (researcherId !== botId && limits.maxSpecialists < 2) throw conflict("The plan needs a second specialist slot.");
    const creationHash = sha256(JSON.stringify([botId, name, objective, researcherId, projectId, limits, plan?.packages, plan?.metric, input.memoryTopic, ...(input.conversationId ? [input.conversationId] : [])]));
    const exists = this.store.get(id);
    if (exists) {
      const existing = this.root(botId, id);
      if (existing.mission.creationHash !== creationHash) throw conflict("This creation request already belongs to another mission.");
      return this.get(botId, id);
    }
    if (plan && input.memoryTopic) throw conflict("A memory topic can only be attached to a planning call.");
    const approvedPlan = plan ? checkedPlan(plan, limits) : null;
    if (!plan && !limits.modelCalls) throw conflict("Provide a shortlist or allow one planning call.");
    for (const [agent, kind] of [[botId, "coordinate"], [researcherId, "source"]] as const) {
      const refused = this.host.refusal(agent, kind);
      if (refused) throw conflict(refused);
    }
    if (this.store.all({ missions: true, nonTerminal: true }).length >= 30) throw conflict("Finish or cancel an open mission before creating another.");
    const result = this.runtime.enqueue({ mission: { id, record: {
      owner: "workspace-owner", creationHash, name, researcherId, projectId, conversationId: input.conversationId, memoryTopic: input.memoryTopic, limits, plan: approvedPlan, phase: plan ? "review" : "draft",
      revision: 1, version: 1, artifactId: randomUUID(), modelCalls: 0,
    } }, origin: { kind: "person", source: "chat" }, requester: { kind: "person" },
      assignee: { botId, destination: { kind: "work_thread", threadId: "mission/" + id } }, brief: objective, levels: { own: "ask" } });
    if (!result.ok) throw conflict("The mission could not be admitted. Check bot availability and try again.");
    return this.get(botId, id);
  }

  command(botId: string, id: string, input: MissionCommand): MissionView {
    const root = this.root(botId, id), view = this.get(botId, id);
    if (input.revision !== view.revision || !view.actions.includes(input.action)) throw conflict("The mission has changed. Review its current state.");
    if (input.action === "cancel" || input.action === "decline") {
      this.runtime.cancel(id, input.action === "decline" ? "Plan declined by the workspace owner" : "Cancelled by the workspace owner");
      return this.get(botId, id);
    }
    const changes: Partial<MissionRecord> = { issue: undefined, retryOf: undefined };
    let detail: string = input.action;
    switch (input.action) {
      case "start":
      case "resume": changes.phase = "active"; break;
      case "pause": changes.phase = "paused"; break;
      case "retry":
        if (!input.step || !view.retryKeys.includes(input.step)) throw conflict("This step cannot be retried.");
        changes.phase = "active"; changes.retryOf = view.steps.find(s => s.key === input.step)?.assignmentId; detail = "Retry approved for " + input.step; break;
      case "revise": {
        const limits = { ...root.mission.limits, ...input.limits };
        if (root.mission.researcherId !== botId && limits.maxSpecialists < 2) throw conflict("The plan needs a second specialist slot.");
        const plan = checkedPlan(input.plan, limits);
        const objective = input.objective ?? view.objective;
        if (redactSecretsInText(objective) !== objective) throw conflict("Remove credentials from the mission text.");
        if (objective === view.objective && JSON.stringify(plan) === JSON.stringify(root.mission.plan) && JSON.stringify(limits) === JSON.stringify(root.mission.limits))
          throw conflict("Change the shortlist, comparison criterion or limits before revising.");
        changes.history = [...(root.mission.history ?? []), { version: view.version, objective: view.objective, plan: view.plan,
          limits: view.limits, artifactId: root.mission.artifactId, replacedAt: Date.now() }];
        Object.assign(changes, { objective, plan, limits, version: view.version + 1, artifactId: randomUUID(), phase: "review" });
        detail = "Plan " + (view.version + 1) + " requires review: " + plan.packages.join(", ") + " (" + plan.metric + ")";
        break;
      }
    }
    this.store.transaction(() => {
      this.update(root, changes, detail);
      if (changes.phase === "active" && root.status === "needs_input" && !this.runtime.answer(id, input.action)) throw conflict("The mission could not resume.");
    });
    this.host.changed(botId);
    return this.get(botId, id);
  }

  async verifiedReport(botId: string, id: string) {
    const view = this.get(botId, id);
    if (!view.artifact) throw conflict("A verified report is not available.");
    const attachmentId = this.root(botId, id).mission.artifactId;
    const bytes = await this.host.read(attachmentId);
    if (bytes.length !== view.artifact.bytes || sha256(bytes) !== view.artifact.sha256)
      throw conflict("The stored report no longer matches its verification receipt.");
    return { attachmentId, text: bytes.toString("utf8") };
  }

  protected children(root: Assignment) { return this.store.children(root.rootId); }
}
