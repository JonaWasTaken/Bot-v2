import type { PackageObservation } from "../../shared/mission.ts";
import type { Assignment, RunResult, TurnRunner } from "../runtime/types.ts";
import { terminal } from "../runtime/types.ts";
import { MissionControl } from "./control.ts";
import { parsePlannerReply, plannerPrompt, planSteps, type MissionRecord, type PlannedStep } from "./plan.ts";
import { comparisonReport, sha256, verifyReport } from "./research.ts";
import { countTools, hasMission, type MissionRoot } from "./view.ts";

const park = (question: string): RunResult => ({ kind: "needs_input", question });
const completed = (text: string): RunResult => ({ kind: "completed", text });
const fail = (text: string): RunResult => ({ kind: "failed", outcome: "refused", text });
const REVIEW = "Review the package names, registry reads, limits and report before starting.";
const isMission = (a: Assignment) => !!(a.mission || a.missionStep);

export class MissionAssignments extends MissionControl {
  private step(root: MissionRoot, row: Assignment): PlannedStep | undefined {
    return root.mission.plan ? planSteps(root.mission.plan, root.mission.version).find(s => s.key === row.missionStep) : undefined;
  }

  validate(row: Assignment): string | undefined {
    const root = this.store.get(row.rootId);
    if (!row.parentId && row.mission) return this.host.refusal(row.assignee.botId, "coordinate");
    if (!hasMission(root) || terminal(root.status) || row.parentId !== root.id) return "The mission assignment no longer has its approved parent.";
    const step = this.step(root, row);
    if (!step || !["active", "paused"].includes(root.mission.phase)) return "This operation is outside the approved plan.";
    if (row.assignee.botId !== (step.kind === "source" ? root.mission.researcherId : root.assignee.botId)) return "This specialist does not own the step.";
    return this.host.refusal(root.assignee.botId, "coordinate") ?? this.host.refusal(row.assignee.botId, step.kind);
  }

  held(row: Assignment): boolean {
    return !!row.missionStep && this.store.get(row.rootId)?.mission?.phase === "paused";
  }

  canStart(row: Assignment): boolean {
    if (this.held(row)) return false;
    return !this.host.busy(row.assignee.botId);
  }

  changed(rows: readonly Assignment[]): void {
    const bots = new Set(rows.map(row => this.store.get(row.rootId)?.assignee.botId).filter(Boolean));
    for (const id of bots) if (id) this.host.changed(id);
  }

  private block(root: MissionRoot, issue: string, usage?: MissionRecord["usage"]): RunResult {
    this.update(root, { phase: "blocked", issue, ...(usage ? { usage } : {}) }, issue);
    return park(issue);
  }

  async run(row: Assignment, signal: AbortSignal): Promise<RunResult> {
    const root = this.store.get(row.rootId);
    if (!hasMission(root)) return fail("The mission record is unavailable.");
    const current = AbortSignal.any([signal, AbortSignal.timeout(root.mission.limits.timeoutMs)]);
    if (row.missionStep) return this.execute(root, row, current);
    if (root.mission.phase === "draft") return this.plan(root, current);
    if (root.mission.phase === "review") return park(REVIEW);
    if (root.mission.phase === "paused") return park("Paused before the next step.");
    if (root.mission.phase === "blocked") return park(root.mission.issue ?? "Review the unfinished steps.");
    return this.advance(root);
  }

  private async plan(root: MissionRoot, signal: AbortSignal): Promise<RunResult> {
    if (root.mission.modelCalls > 0 || root.mission.modelCalls >= root.mission.limits.modelCalls)
      return this.block(root, "The planning call was interrupted. Review a manual shortlist to continue.");
    const refusal = this.host.refusal(root.assignee.botId, "plan");
    if (refusal) return this.block(root, refusal);
    let usage: MissionRecord["usage"];
    try {
      const context = root.mission.memoryTopic ? this.host.context(root.assignee.botId, root.mission.memoryTopic) : undefined;
      const prompt = plannerPrompt(root.mission.objective ?? root.brief, root.mission.limits, context);
      this.update(root, { modelCalls: root.mission.modelCalls + 1 }, "Planning call attempted");
      const answer = await this.host.plan(root.assignee.botId, prompt, signal, root.id);
      usage = answer.usage;
      signal.throwIfAborted();
      const plan = parsePlannerReply(answer.text, root.mission.limits);
      const fresh = this.root(root.assignee.botId, root.id);
      if (terminal(fresh.status) || fresh.mission.revision !== root.mission.revision) return fail("The planning request ended.");
      this.update(fresh, { phase: "review", plan, usage }, "Plan ready for review");
      return park(REVIEW);
    } catch {
      const fresh = this.root(root.assignee.botId, root.id);
      if (terminal(fresh.status)) return fail("The planning request ended.");
      return this.block(fresh, "The planner could not produce a supported shortlist. Enter public npm package names to continue.", usage);
    }
  }

  private advance(root: MissionRoot): RunResult {
    const { plan, version, limits, retryOf } = root.mission;
    if (!plan) return this.block(root, "No reviewed plan is available.");
    const steps = planSteps(plan, version), children = this.children(root);
    const latest = new Map(children.map(c => [c.missionStep, c]));
    const done = (key: string) => latest.get(key)?.status === "completed";
    if (steps.every(step => done(step.key))) return completed("The report was verified against the retrieved releases.");
    const retry = (step: PlannedStep) => !!retryOf && latest.get(step.key)?.id === retryOf && latest.get(step.key)?.status === "failed";
    const ready = steps.filter(s => (!latest.has(s.key) || retry(s)) && s.dependsOn.every(done));
    if (!ready.length) return this.block(root, "Review the failed step. Its dependent work has not started.");
    const available = limits.toolCalls - countTools(children);
    let reserved = 0;
    for (const step of ready.slice(0, limits.concurrency)) {
      const calls = step.kind === "source" ? 2 : 1;
      if (reserved + calls > available) break;
      reserved += calls;
      const botId = step.kind === "source" ? root.mission.researcherId : root.assignee.botId;
      const result = this.runtime.enqueue({ parentId: root.id, origin: root.origin, requester: { kind: "bot_turn",
        botId: root.assignee.botId, threadId: root.assignee.destination.threadId }, assignee: { botId,
        destination: { kind: "work_thread", threadId: root.assignee.destination.threadId + "/" + step.key } },
        ownThread: botId === root.assignee.botId, levels: { own: "ask" }, reply: "resume", missionStep: step.key,
        brief: step.key, rework: retry(step), doneWhen: step.kind === "source" ? "Match the latest release to its versioned registry record."
          : step.kind === "report" ? "Store the comparison as a Markdown attachment." : "Read the saved bytes and check every citation and measurement." });
      if (!result.ok) return this.block(this.root(root.assignee.botId, root.id), "The runtime refused to admit the next step. Review the plan or the assigned bot.");
    }
    if (!reserved) return this.block(root, "The next step exceeds the approved tool-call budget. Review the limits to continue.");
    if (retryOf) this.update(this.root(root.assignee.botId, root.id), { retryOf: undefined }, "Retry admitted");
    return completed("Waiting for the assigned work.");
  }

  private async execute(root: MissionRoot, row: Assignment, signal: AbortSignal): Promise<RunResult> {
    const step = this.step(root, row), plan = root.mission.plan;
    if (!step || !plan) return fail("No approved operation matches this assignment.");
    const children = this.children(root);
    const latest = new Map(children.map(c => [c.missionStep, c]));
    if (!step.dependsOn.every(key => latest.get(key)?.status === "completed")) return fail("A required input is missing.");
    let calls = 0;
    const attempted = () => {
      signal.throwIfAborted();
      const current = this.store.get(row.id);
      if (!current || current.status !== "running" || this.validate(current)) throw new Error("The assignment is no longer authorized.");
      if (countTools(this.children(root)) >= root.mission.limits.toolCalls) throw new Error("The tool-call limit was reached.");
      current.missionCalls = (current.missionCalls ?? 0) + 1;
      this.store.update(current, { kind: "progress", detail: step.kind + " operation attempted" });
      calls++;
    };
    try {
      let result: unknown;
      if (step.kind === "source") {
        attempted();
        const first = await this.host.readPackage(step.name, "latest", signal);
        attempted();
        const pinned = await this.host.readPackage(step.name, first.version, signal);
        if (JSON.stringify({ ...first, readAt: 0 }) !== JSON.stringify({ ...pinned, readAt: 0 })) return fail("The versioned source contradicted the latest release.");
        result = pinned;
      } else {
        const observations = plan.packages.map(name => JSON.parse(latest.get("npm:" + name)!.result) as PackageObservation);
        const text = comparisonReport(plan, observations);
        attempted();
        if (step.kind === "report") {
          await this.host.save(root.mission.artifactId, text);
          result = { bytes: Buffer.byteLength(text), sha256: sha256(text) };
        } else {
          const saved = await this.host.read(root.mission.artifactId);
          const digest = verifyReport(saved, text, observations);
          if (JSON.parse(latest.get(step.dependsOn[0]!)!.result).sha256 !== digest) return fail("The saved bytes contradict the write receipt.");
          result = { bytes: saved.byteLength, sha256: digest };
        }
      }
      signal.throwIfAborted();
      return { kind: "completed", text: JSON.stringify(result), evidence: { toolCalls: calls, okToolCalls: calls, summary: step.key } };
    } catch {
      const detail = signal.aborted ? "The step was stopped or timed out."
        : step.kind === "source" ? "Could not confirm the release against its public npm source."
        : step.kind === "report" ? "Could not produce a report with an eligible recommendation or save it."
        : "The stored report failed its citation or content check.";
      return { kind: "failed", outcome: "provider_error", text: detail, evidence: { toolCalls: calls, errors: [detail] } };
    }
  }
}

export function missionRunner(normal: TurnRunner, service: () => MissionAssignments | undefined): TurnRunner {
  return { ...normal,
    validate: (row, parent) => isMission(row) ? (service() ? service()!.validate(row) : "Missions are unavailable.") : normal.validate(row, parent),
    canStart: row => isMission(row) ? service()?.canStart(row) === true : normal.canStart(row),
    run: (row, input, signal) => isMission(row) ? service()!.run(row, signal) : normal.run(row, input, signal),
    away: row => isMission(row) ? !!service()?.held(row) : normal.away?.(row) ?? false,
    park: (row, question, restored) => { if (!isMission(row)) normal.park(row, question, restored); },
    report: (row, parent) => { if (!isMission(row)) normal.report(row, parent); },
    outward: row => isMission(row) ? [] : normal.outward?.(row) ?? [],
    names: (row, parent) => isMission(row) ? { requester: "Mission", assignee: row.assignee.botId } : normal.names(row, parent),
    changed: rows => {
      const missionRows = rows.filter(isMission);
      if (missionRows.length) service()?.changed(missionRows);
      const other = rows.filter(row => !isMission(row));
      if (other.length) normal.changed(other);
    },
  };
}
