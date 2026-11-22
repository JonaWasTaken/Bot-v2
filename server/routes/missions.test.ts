import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import { json, readBody } from "../harness/http.ts";
import type { MissionControl } from "../missions/control.ts";
import { createMissionHost } from "../missions/host.ts";
import { deleteThread } from "../message-db.ts";
import { commandReceipt } from "../commands.ts";
import type { RequestAuth } from "../request-auth.ts";
import { Store } from "../store.ts";
import { createMissionRoutes } from "./missions.ts";
import { dispatchRoutes } from "./table.ts";

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(done => {
    server.close(() => done()); server.closeAllConnections();
  })));
});
const owner: RequestAuth = { kind: "loopback", scopes: ["admin"] };
const id = randomUUID();
const input = { id, name: "Research", objective: "Compare packages" };

async function serve(auth: RequestAuth = owner, enabled = true) {
  let live = true;
  const store = new Store(() => ({ instanceId: "claude", model: "fixture" }));
  const bot = store.createBot({ name: "Lead" });
  const project = store.createProject(bot.id, "Package research")!;
  const thread = store.createTask(bot.id, "Discussion", false, project.id)!;
  const mission = { id: randomUUID(), botId: bot.id, revision: 4, version: 1, state: "completed",
    projectId: project.id, conversationId: thread.threadId, artifact: { name: "report.md" } };
  const service = { list: vi.fn(() => []), create: vi.fn(() => ({ id })), command: vi.fn(() => ({ id })),
    get: vi.fn(() => mission), verifiedReport: vi.fn(async () => ({ text: "# Report", attachmentId: id })) };
  const route = createMissionRoutes({ service: service as unknown as MissionControl, enabled: () => enabled,
    store, live: () => live, hasBot: botId => botId === bot.id });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, "http://localhost");
    const handled = await dispatchRoutes([route], { req, res, url, path: url.pathname, method: req.method!, auth, json,
      readBody: async (...args) => { const result = await readBody(...args); if (req.headers["x-revoke"]) live = false; return result; } });
    if (!handled) json(res, 404, {});
  });
  servers.push(server);
  await new Promise<void>(ready => server.listen(0, "127.0.0.1", ready));
  const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port + "/api/bots/" + bot.id + "/missions";
  const post = (data: unknown, path = "", revoke = false) => fetch(base + path, { method: "POST",
    headers: { "content-type": "application/json", ...(revoke ? { "x-revoke": "1" } : {}) }, body: JSON.stringify(data) });
  return { base, post, service, store, bot, thread, project, mission, revoke: () => { live = false; } };
}

it.each([
  ["service loopback", { kind: "loopback", scopes: ["client"], trust: "service" }, true],
  ["guest session", { kind: "session", scopes: ["client"], via: "bearer", session: { id: "guest" } }, true],
  ["shared workspace", owner, false],
] as const)("rejects reads, writes and exports for %s", async (_label, auth, enabled) => {
  const f = await serve(auth as RequestAuth, enabled);
  expect((await fetch(f.base)).status).toBe(403);
  expect((await fetch(f.base + "/" + id + "/export")).status).toBe(403);
  expect((await f.post({ revision: 4 }, "/" + id + "/conversation-report")).status).toBe(403);
  expect((await f.post(input)).status).toBe(403);
  for (const method of Object.values(f.service)) expect(method).not.toHaveBeenCalled();
});

it("rechecks authority after receiving the body and rejects invented grants and foreign projects", async () => {
  const f = await serve();
  expect((await f.post({ ...input, projectId: "other" })).status).toBe(404);
  for (const args of [{ capability: "shell" }, { memoryTopic: "../other.md" }, { limits: { toolCalls: 500 } }])
    expect((await f.post({ ...input, ...args })).status).toBe(400);
  expect((await f.post({ action: "complete", revision: 1 }, "/" + id)).status).toBe(400);
  expect((await f.post(input, "", true)).status).toBe(403);
  expect(f.service.create).not.toHaveBeenCalled();
  expect(f.service.command).not.toHaveBeenCalled();
});

it("checks the project for scoped lists and the conversation membership before creation", async () => {
  const f = await serve();
  expect((await fetch(f.base + "?projectId=foreign")).status).toBe(404);
  expect(f.service.list).not.toHaveBeenCalled();
  expect((await fetch(f.base + "?projectId=" + f.project.id)).status).toBe(200);
  expect(f.service.list).toHaveBeenCalledWith(f.bot.id, f.project.id);
  expect((await f.post({ ...input, conversationId: f.thread.threadId })).status).toBe(404);
  expect((await f.post({ ...input, projectId: f.project.id, conversationId: "foreign" })).status).toBe(404);
  expect(f.service.create).not.toHaveBeenCalled();
  expect((await f.post({ ...input, projectId: f.project.id, conversationId: f.thread.threadId })).status).toBe(201);
});

it("posts the verified attachment once on simultaneous requests and respects subsequent removal", async () => {
  const f = await serve(), path = "/" + f.mission.id + "/conversation-report";
  const send = () => f.post({ revision: 4 }, path);
  const detail = async () => (await fetch(f.base + "/" + f.mission.id)).json();
  expect(await detail()).toMatchObject({ conversationReport: "ready" });
  expect((await f.post({ revision: 3 }, path)).status).toBe(409);
  expect((await f.post({ revision: 4, conversationId: f.bot.threadId }, path)).status).toBe(400);
  expect(f.service.verifiedReport).not.toHaveBeenCalled();
  const replies = await Promise.all([send(), send()]);
  for (const response of replies) expect(await response.json()).toMatchObject({ conversationReport: "posted" });
  const attachments = f.store.messagesFor(f.thread.threadId).flatMap(m => m.attachments ?? []);
  expect(attachments).toEqual([expect.objectContaining({ name: "report.md", path: expect.stringContaining(id + ".md") })]);
  const posted = f.store.messagesFor(f.thread.threadId).find(message => message.attachments?.length);
  expect(posted?.text).toBe("# Report");
  expect(commandReceipt("mission.post-report", f.mission.id + ":1")?.result).toBe(posted?.id);
  expect(f.store.messagesFor(f.bot.threadId).every(m => !m.attachments?.length)).toBe(true);
  expect(await detail()).toMatchObject({ conversationReport: "posted" });
  deleteThread(f.thread.threadId);
  expect(await detail()).toMatchObject({ conversationReport: "removed" });
  expect((await send()).status).toBe(409);
});

it.each(["revoked", "moved", "unverified", "unreadable"] as const)("withholds a %s delivery", async reason => {
  const f = await serve();
  if (reason === "unverified") f.mission.state = "partial";
  f.service.verifiedReport.mockImplementationOnce(async () => {
    if (reason === "revoked") f.revoke();
    if (reason === "moved") {
      const other = f.store.createProject(f.bot.id, "Other")!;
      f.store.patchTask(f.bot.id, f.thread.threadId, { projectId: other.id });
    }
    if (reason === "unreadable") throw new Error("fixture disk error");
    return { text: "# Report", attachmentId: id };
  });
  const response = await f.post({ revision: 4 }, "/" + f.mission.id + "/conversation-report");
  expect(response.status).toBe(reason === "revoked" ? 403 : reason === "unreadable" ? 503 : 409);
  expect(f.store.messagesFor(f.thread.threadId).every(m => !m.attachments?.length)).toBe(true);
});

it("checks the current specialist's tool grants, engine, holds and workspace on each operation", () => {
  const bot = { modelSelection: { instanceId: "local" }, toolScope: { allow: ["mcp:agents:wait_until"] } };
  let enabled = true, tools = true, hold: string | null = null;
  const host = createMissionHost({ store: { bot: () => bot } as unknown as Pick<Store, "bot">, enabled: () => enabled,
    busy: () => false, toolsEnabled: () => tools, held: () => hold, model: () => null, changed: () => {} });
  expect(host.refusal("research", "source")).toBeUndefined();
  for (const operation of ["report", "coordinate", "verify"] as const) expect(host.refusal("research", operation)).toBeTruthy();
  tools = false; expect(host.refusal("research", "source")).toContain("engine");
  tools = true; hold = "paused"; expect(host.refusal("research", "source")).toBe("paused");
  hold = null; enabled = false; expect(host.refusal("research", "source")).toContain("workspace");
});
