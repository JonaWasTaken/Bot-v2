import { randomUUID } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MissionAction, MissionLimits, PackageObservation } from "../../shared/mission.ts";
import { ATTACHMENTS_DIR } from "../attachments.ts";
import { createMissionHost } from "./host.ts";
import { Runtime } from "../runtime/runtime.ts";
import { openRuntimeStore } from "../runtime/store.ts";
import { FakeRunner } from "../runtime/testing/fake-runner.ts";
import { MissionAssignments, missionRunner } from "./assignments.ts";
import type { MissionHost } from "./control.ts";
import { checkedPlan, defaultLimits, mayTransition, parsePlannerReply, validateDependencies } from "./plan.ts";
import { registrySource } from "./research.ts";

const files = new Map<string, Buffer>();
const dirs: string[] = [];
const stores: ReturnType<typeof openRuntimeStore>[] = [];
const shortlist = { packages: ["alpha", "beta", "gamma"], metric: "dependencies" as const };
const observation = (name: string): PackageObservation => ({ name, version: "1.0.0", readAt: 123456,
  source: registrySource(name, "1.0.0"), license: "MIT", types: true, dependencies: name === "beta" ? 1 : 2, bytes: 120 });
afterEach(() => {
  for (const store of stores.splice(0)) store.close();
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  files.clear();
});

function fixture(overrides: Partial<MissionHost> = {}, path = ":memory:") {
  const store = openRuntimeStore(path);
  stores.push(store);
  const host: MissionHost = {
    refusal: () => undefined, context: vi.fn(() => ""), busy: () => false, changed: vi.fn(), plan: vi.fn(async () => ({ text: JSON.stringify(shortlist) })),
    readPackage: vi.fn(async name => observation(name)),
    save: vi.fn(async (id, text) => { files.set(id, Buffer.from(text)); }),
    read: vi.fn(async id => Buffer.from(files.get(id)!)), ...overrides,
  };
  const runtime: Runtime = new Runtime(store, missionRunner(new FakeRunner(), () => service));
  const service: MissionAssignments = new MissionAssignments(store, runtime, host);
  runtime.open();
  const id = randomUUID(), bot = "lead";
  const input = { id, name: "Study", objective: "Compare TypeScript validators", researcherId: "research" };
  const create = (limits?: Partial<MissionLimits>, auto?: boolean) => service.create(bot, { ...input, plan: auto ? undefined : shortlist, limits });
  const read = (key: string = id) => service.get(bot, key);
  const until = async (condition: () => boolean) => {
    for (let i = 0; i < 50; i++) {
      runtime.tick(); await new Promise(resolve => setTimeout(resolve, 0));
      if (condition()) return;
    }
    throw new Error("Mission did not reach the expected state: " + JSON.stringify(store.all().map(r => [r.status, r.mission?.phase, r.missionStep])));
  };
  const command = (action: MissionAction, step?: string) => service.command(bot, id, { revision: read().revision, action, step });
  const start = async () => { await until(() => read().actions.includes("start")); return command("start"); };
  return { id, input, bot, service, store, runtime, until, create, read, start, command, host };
}

describe("reviewed research missions on the assignment runtime", () => {
  it("reopens only missions owned by the requested folder and preserves creation retry identity", () => {
    const f = fixture();
    f.create();
    const input = { ...f.input, id: randomUUID(), projectId: "work", conversationId: "thread", plan: shortlist };
    f.service.create(f.bot, input);
    expect(f.service.create(f.bot, input)).toMatchObject({ projectId: "work", conversationId: "thread" });
    expect(() => f.service.create(f.bot, { ...input, conversationId: "different" })).toThrow("already belongs");
    f.service.create(f.bot, { ...input, id: randomUUID(), projectId: "other", conversationId: undefined });
    expect(f.service.list(f.bot, "work").map(m => m.id)).toEqual([input.id]);
    expect(f.service.list(f.bot, "empty")).toEqual([]);
    expect(f.service.list("another", "work")).toEqual([]);
    expect(f.service.list(f.bot)).toHaveLength(3);
  });

  it("rejects excess size, depth, repeated nodes, missing dependencies, cycles and model-selected tool arguments", () => {
    expect(() => checkedPlan(shortlist, { ...defaultLimits, maxSteps: 4 })).toThrow();
    expect(() => checkedPlan(shortlist, { ...defaultLimits, maxDepth: 2 })).toThrow();
    for (const packages of [["a", "a"], ["http://localhost"], ["../x"], ["@scope/../x"]])
      expect(() => checkedPlan({ ...shortlist, packages }, defaultLimits)).toThrow();
    for (const dependsOn of [["missing"], ["a"]]) expect(() => validateDependencies([{ key: "a", kind: "source", name: "x", dependsOn }], defaultLimits)).toThrow();
    expect(() => parsePlannerReply('{"packages":["a"],"metric":"size","approved":true}', defaultLimits)).toThrow();
  });

  it("deduplicates creation, refuses other owners and credentials, and keeps draft model context bounded", async () => {
    const f = fixture();
    expect(f.create(undefined, true).state).toBe("planning");
    expect(f.create(undefined, true).id).toBe(f.id);
    expect(() => f.create()).toThrow("already belongs");
    expect(() => f.service.get("unrelated", f.id)).toThrow("not found");
    expect(() => f.service.create("lead", { ...f.input, id: randomUUID(), objective: "password=123456789Secret" })).toThrow("credentials");
    await f.until(() => f.read().actions.includes("start"));
    expect(f.host.plan).toHaveBeenCalledTimes(1);
    expect(vi.mocked(f.host.plan).mock.calls[0]![1]).toContain(f.input.objective);
    expect(f.host.readPackage).not.toHaveBeenCalled();
    f.command("decline");
    expect(f.read().activity.some(e => e.text.includes("declined"))).toBe(true);
    expect(f.read()).toMatchObject({ state: "cancelled", steps: expect.any(Array), actions: [] });
    expect(() => f.command("start")).toThrow();
  });

  it("starts independent reads concurrently within a cap, blocks the writer, verifies actual bytes and persists receipts", async () => {
    let active = 0, peak = 0;
    const f = fixture({ readPackage: async name => {
      active++; peak = Math.max(peak, active); await new Promise<void>(done => setTimeout(done, 3)); active--; return observation(name);
    } });
    f.create({ concurrency: 2 }); await f.start();
    await f.until(() => f.read().state === "completed");
    const view = f.read(), report = await f.service.artifact(f.bot, f.id);
    expect(peak).toBe(2);
    expect(view.usage).toEqual({ toolCalls: 8, modelCalls: 0 });
    expect(report).toContain("**beta** ranks first");
    for (const name of shortlist.packages) expect(report).toContain(registrySource(name, "1.0.0"));
    expect(view.steps.every(s => s.status === "verified" && s.attempts === 1)).toBe(true);
    const rows = f.store.children(f.id);
    const write = rows.find(a => a.missionStep === "report:1")!;
    expect(rows.filter(a => a.missionStep?.startsWith("npm:")).every(a => a.assignee.botId === "research"
      && a.parentId === f.id && a.evidence?.okToolCalls === 2 && a.finishedAt! <= write.startedAt!)).toBe(true);
    expect(view.artifact?.assignmentId).toBe(write.id);
    expect(f.runtime.prune(Date.now() + 100_000)).toBe(0);
    files.set(f.store.get(f.id)!.mission!.artifactId, Buffer.from("changed"));
    await expect(f.service.artifact(f.bot, f.id)).rejects.toThrow("verification receipt");
  });

  it("pauses admission, resumes once, limits retries and preserves successful reads", async () => {
    let deny = true;
    const f = fixture({ readPackage: vi.fn(async name => {
      if (name === "beta" && deny) throw new Error("provider error with secret details");
      return observation(name);
    }) });
    f.create({ concurrency: 1 });
    await f.start(); f.command("pause");
    await f.until(() => f.read().actions.includes("resume"));
    expect(f.host.readPackage).not.toHaveBeenCalled();
    f.command("resume");
    await f.until(() => f.read().retryKeys.includes("npm:beta"));
    expect(f.read().state).toBe("partial");
    expect(JSON.stringify(f.read())).not.toContain("secret details");
    const revision = f.read().revision;
    deny = false;
    f.command("retry", "npm:beta");
    expect(() => f.service.command(f.bot, f.id, { action: "retry", step: "npm:beta", revision })).toThrow();
    await f.until(() => f.read().state === "completed");
    expect(f.read().steps.slice(0, 3).map(s => s.attempts)).toEqual([1, 2, 1]);
  });

  it("rejects corrupt artifact bytes, blocks on budget, and requires a versioned new approval to spend more", async () => {
    const f = fixture({ read: async () => Buffer.from("Everything passed!") });
    f.create({ toolCalls: 6 }); await f.start();
    await f.until(() => f.read().actions.includes("revise"));
    expect(f.read()).toMatchObject({ state: "partial", usage: { toolCalls: 6 } });
    f.service.command(f.bot, f.id, { revision: f.read().revision, action: "revise", plan: shortlist, limits: { toolCalls: 10 } });
    expect(f.read()).toMatchObject({ state: "review", version: 2 });
    expect(f.host.save).not.toHaveBeenCalled();
    await f.start();
    await f.until(() => f.read().retryKeys.includes("verify:2"));
    expect(f.read().artifact).toBeUndefined();
    expect(f.read().steps.slice(0, 3).every(s => s.attempts === 1)).toBe(true);
    f.command("retry", "verify:2"); await f.until(() => f.read().state === "partial");
    expect(f.read().retryKeys).toEqual([]);
  });

  it("propagates cancellation and drops late results after authority is revoked", async () => {
    let revoked = false, called = false, aborted = false;
    const f = fixture({ refusal: bot => revoked && bot === "research" ? "Access revoked" : undefined,
      readPackage: async (name, _version, signal) => {
        called = true; await new Promise<void>(resolve => signal.addEventListener("abort", () => { aborted = true; resolve(); }, { once: true }));
        return observation(name);
      } });
    f.create(); await f.start(); await f.until(() => called);
    revoked = true; await f.until(() => f.read().state === "failed");
    expect(aborted).toBe(true);
    expect(f.read().steps.every(s => !s.observation)).toBe(true);
    expect(f.host.save).not.toHaveBeenCalled();
    f.command("cancel"); expect(f.read().state).toBe("cancelled");
  });

  it("validates every phase pair, including internal transitions", () => {
    const phases = ["draft", "review", "active", "paused", "blocked"] as const;
    const allowed = ["draft-review", "draft-blocked", "review-active", "active-paused", "active-blocked", "paused-active",
      "paused-review", "paused-blocked", "blocked-review", "blocked-active"];
    for (const from of phases) for (const to of phases)
      expect(mayTransition(from, to), from + " -> " + to).toBe(from === to || allowed.includes(from + "-" + to));
  });

  it("retains a pending approval across restart and never repeats an uncertain model call", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mission-review-")); dirs.push(dir);
    const path = join(dir, "runtime.db");
    const f = fixture({ plan: async () => new Promise(() => {}) }, path);
    f.create(undefined, true);
    await f.until(() => f.read().usage.modelCalls === 1);
    const waitingId = randomUUID();
    f.service.create(f.bot, { ...f.input, id: waitingId, plan: shortlist });
    await f.until(() => f.read(waitingId).actions.includes("start"));
    f.runtime.close(); stores.splice(stores.indexOf(f.store), 1); f.store.close();
    const g = fixture({}, path);
    await g.until(() => g.read(f.id).state === "failed");
    expect(g.read(f.id).issue).toContain("interrupted");
    expect(g.read(waitingId).state).toBe("review");
    expect(g.host.plan).not.toHaveBeenCalled();
    expect(g.host.readPackage).not.toHaveBeenCalled();
  });

  it("retries a locked settlement without repeating the operation", async () => {
    const f = fixture();
    const original = f.store.update;
    let busy = true;
    vi.spyOn(f.store, "update").mockImplementation((row, event) => {
      if (busy && row.missionStep === "report:1" && event?.kind === "settled") {
        busy = false;
        throw Object.assign(new Error("database is locked"), { code: "ERR_SQLITE_ERROR", errcode: 5 });
      }
      return original(row, event);
    });
    f.create(); await f.start(); await f.until(() => f.read().state === "completed");
    expect(busy).toBe(false);
    expect(f.host.save).toHaveBeenCalledTimes(1);
    expect(f.read().steps.every(s => s.attempts === 1)).toBe(true);
  });

  it("fences an interrupted retry decision to the failed assignment", async () => {
    let deny = true;
    const f = fixture({ readPackage: async name => {
      if (name === "beta" && deny) throw new Error("offline");
      return observation(name);
    } });
    f.create(); await f.start();
    await f.until(() => f.read().retryKeys.includes("npm:beta"));
    const failedId = f.read().steps.find(s => s.name === "beta")!.assignmentId;
    deny = false; f.command("retry", "npm:beta");
    await f.until(() => f.read().steps.find(s => s.name === "beta")?.status === "verified");
    const parent = f.store.get(f.id)!;
    parent.mission!.retryOf = failedId;
    f.store.update(parent);
    await f.until(() => f.read().state === "completed");
    expect(f.read().steps.find(s => s.name === "beta")?.attempts).toBe(2);
  });

  it("passes only an owner-selected note to the planner and keeps provider usage with the mission", async () => {
    const f = fixture({ context: vi.fn(() => "bounded fact only"), plan: vi.fn(async () => ({
      text: JSON.stringify(shortlist), usage: { input: 43, output: 12 } })) });
    expect(() => f.create({ maxSpecialists: 1 })).toThrow("specialist");
    f.service.create(f.bot, { ...f.input, memoryTopic: "architecture.md" });
    await f.until(() => f.read().actions.includes("start"));
    expect(f.host.context).toHaveBeenCalledWith(f.bot, "architecture.md");
    const call = vi.mocked(f.host.plan).mock.calls[0]!;
    expect(call[1]).toContain("bounded fact only");
    expect(call[3]).toBe(f.id);
    expect(f.read().usage).toMatchObject({ input: 43, output: 12 });
    await f.start(); await f.until(() => f.read().state === "completed");
    expect(JSON.stringify(f.store.children(f.id))).not.toContain("bounded fact only");
    expect(JSON.stringify(f.read())).not.toContain("bounded fact only");
  });

  it("preserves the original objective and prior scope and requires review of a changed objective", async () => {
    const f = fixture();
    f.create(); await f.until(() => f.read().actions.includes("revise"));
    f.service.command(f.bot, f.id, { action: "revise", revision: f.read().revision, objective: "Compare unpacked bytes",
      plan: { ...shortlist, metric: "size" } });
    expect(f.read()).toMatchObject({ originalObjective: f.input.objective, objective: "Compare unpacked bytes", version: 2,
      state: "review", history: [{ objective: f.input.objective, version: 1, plan: shortlist }] });
    expect(f.host.readPackage).not.toHaveBeenCalled();
    expect(f.service.keptArtifacts()).toHaveLength(2);
  });

  it("reopens the same database after the artifact commit and before its receipt, using one protected file identity", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mission-restart-")); dirs.push(dir);
    const path = join(dir, "runtime.db");
    const disk = createMissionHost({ store: { bot: () => null }, enabled: () => true, busy: () => false,
      toolsEnabled: () => true, held: () => null, model: () => null, changed: () => {} });
    let name = "";
    const f = fixture({ save: async (id, text) => {
      await disk.save(id, text); name = id + ".md"; await new Promise(() => {});
    } }, path);
    f.create(); await f.start(); await f.until(() => !!name);
    const first = statSync(join(ATTACHMENTS_DIR, name), { bigint: true });
    f.runtime.close(); stores.splice(stores.indexOf(f.store), 1); f.store.close();
    const g = fixture({ save: vi.fn(disk.save), read: disk.read }, path);
    await g.until(() => g.read(f.id).state === "completed");
    expect(g.host.save).toHaveBeenCalledTimes(1);
    expect(readdirSync(ATTACHMENTS_DIR).filter(file => file.startsWith(name.slice(0, -3)))).toEqual([name]);
    const restored = statSync(join(ATTACHMENTS_DIR, name), { bigint: true });
    expect([restored.ino, restored.mtimeNs, restored.size]).toEqual([first.ino, first.mtimeNs, first.size]);
    expect(g.read(f.id).steps.map(s => s.attempts)).toEqual([1, 1, 1, 2, 1]);
    expect(await g.service.artifact(g.bot, f.id)).toContain("Registry sources");
    expect(g.host.readPackage).not.toHaveBeenCalled();
  });
});
