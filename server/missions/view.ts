import type { MissionState, MissionStepView, MissionView, PackageObservation } from "../../shared/mission.ts";
import type { Assignment, AssignmentEvent } from "../runtime/types.ts";
import { planSteps, type MissionRecord } from "./plan.ts";

export type MissionRoot = Assignment & { mission: MissionRecord };
export const hasMission = (row: Assignment | undefined): row is MissionRoot => !!row?.mission;
export const countTools = (children: Assignment[]) => children.reduce((sum, row) => sum + (row.missionCalls ?? 0), 0);

export function missionState(root: MissionRoot, children: Assignment[]): MissionState {
  if (root.status === "cancelled" || root.status === "failed" || root.status === "completed") return root.status;
  switch (root.mission.phase) {
    case "draft": return "planning";
    case "review": return "review";
    case "paused": return "paused";
    case "blocked": return children.some(child => child.status === "completed") ? "partial" : "failed";
    case "active": return children.some(c => c.missionStep === "verify:" + root.mission.version && c.status === "running") ? "verifying" : "running";
  }
}

export function missionView(root: MissionRoot, children: Assignment[], events: AssignmentEvent[]): MissionView {
  const record = root.mission;
  const state = missionState(root, children);
  const steps: MissionStepView[] = [];
  const usage = { toolCalls: countTools(children), modelCalls: record.modelCalls, ...record.usage };
  const retryKeys: string[] = [];
  const parked = root.status === "needs_input";
  const terminal = !!root.finishedAt;
  let artifact: MissionView["artifact"];
  for (const step of record.plan ? planSteps(record.plan, record.version) : []) {
    const history = children.filter(row => row.missionStep === step.key);
    const row = history.at(-1);
    const botId = step.kind === "source" ? record.researcherId : root.assignee.botId;
    const ready = step.dependsOn.every(key => steps.some(s => s.key === key && (s.status === "executed" || s.status === "verified")));
    const view: MissionStepView = { ...step, botId, status: ready ? "planned" : "blocked", toolCalls: countTools(history), attempts: history.reduce((sum, a) => sum + a.executions, 0) };
    if (row) {
      view.assignmentId = row.id;
      view.startedAt = row.startedAt;
      view.finishedAt = row.finishedAt;
      if (row.status === "completed") {
        view.status = step.kind === "report" ? "executed" : "verified";
        if (step.kind === "source") view.observation = JSON.parse(row.result) as PackageObservation;
        if (step.kind === "verify") {
          const report = steps.find(s => s.kind === "report");
          if (report?.assignmentId) {
            report.status = "verified";
            const receipt = JSON.parse(row.result) as { bytes: number; sha256: string };
            artifact = { name: "report.md", ...receipt, assignmentId: report.assignmentId, verifiedAt: row.finishedAt! };
          }
        }
      } else if (row.status === "failed" || row.status === "cancelled") {
        view.status = row.status;
        view.error = row.outcomeDetail || row.result;
        if (parked && record.phase === "blocked" && row.status === "failed" && history.length <= record.limits.retries
          && usage.toolCalls < record.limits.toolCalls) retryKeys.push(step.key);
      } else view.status = row.status === "queued" ? "queued" : "running";
    }
    steps.push(view);
  }
  const actions: MissionView["actions"] = [];
  if (!terminal) {
    if (parked && record.phase === "review") actions.push("start", "decline");
    if (record.phase === "active") actions.push("pause");
    if (record.phase === "paused") actions.push("resume");
    if (retryKeys.length) actions.push("retry");
    if (parked && record.version < 5 && ["review", "blocked", "paused"].includes(record.phase)) actions.push("revise");
    actions.push("cancel");
  }
  return { id: root.id, botId: root.assignee.botId, owner: record.owner, researcherId: record.researcherId, name: record.name,
    objective: record.objective ?? root.brief, memoryTopic: record.memoryTopic, originalObjective: root.brief, history: (record.history ?? []).map(({ artifactId: _artifact, ...plan }) => plan), projectId: record.projectId, conversationId: record.conversationId, state, version: record.version, revision: record.revision, plan: record.plan,
    limits: record.limits, steps, actions, retryKeys, createdAt: root.createdAt, updatedAt: root.lastActivityAt,
    finishedAt: root.finishedAt, issue: record.issue ?? (root.status === "failed" ? root.result : undefined), usage, artifact,
    activity: events.filter(e => e.kind === "progress" || e.kind === "restart_reconciled" || e.kind === "settled" || e.kind === "cancelled")
      .slice(-12).map(e => ({ at: e.at, text: e.detail ?? e.kind })) };
}
