import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import { json, readBody } from "../harness/http.ts";
import type { MissionControl } from "../missions/control.ts";
import { createMissionHost } from "../missions/host.ts";
import type { RequestAuth } from "../request-auth.ts";
import type { Store } from "../store.ts";
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
  const service = { list: vi.fn(() => []), create: vi.fn(() => ({ id })), command: vi.fn(() => ({ id })),
    artifact: vi.fn(async () => "# Report") };
  const route = createMissionRoutes({ service: service as unknown as MissionControl, enabled: () => enabled, live: () => live,
    conversationProject: (_bot, thread) => thread === "discussion" ? "owned" : undefined,
    hasBot: bot => bot === "lead", hasProject: (_bot, project) => project === "owned" });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, "http://localhost");
    const handled = await dispatchRoutes([route], { req, res, url, path: url.pathname, method: req.method!, auth, json,
      readBody: async (...args) => { const result = await readBody(...args); if (req.headers["x-revoke"]) live = false; return result; } });
    if (!handled) json(res, 404, {});
  });
  servers.push(server);
  await new Promise<void>(ready => server.listen(0, "127.0.0.1", ready));
  const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port + "/api/bots/lead/missions";
  const post = (data: unknown, path = "", revoke = false) => fetch(base + path, { method: "POST",
    headers: { "content-type": "application/json", ...(revoke ? { "x-revoke": "1" } : {}) }, body: JSON.stringify(data) });
  return { base, post, service };
}

it.each([
  ["service loopback", { kind: "loopback", scopes: ["client"], trust: "service" }, true],
  ["guest session", { kind: "session", scopes: ["client"], via: "bearer", session: { id: "guest" } }, true],
  ["shared workspace", owner, false],
] as const)("rejects reads, writes and exports for %s", async (_label, auth, enabled) => {
  const f = await serve(auth as RequestAuth, enabled);
  expect((await fetch(f.base)).status).toBe(403);
  expect((await fetch(f.base + "/" + id + "/export")).status).toBe(403);
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
  expect((await fetch(f.base + "?projectId=owned")).status).toBe(200);
  expect(f.service.list).toHaveBeenCalledWith("lead", "owned");
  expect((await f.post({ ...input, conversationId: "discussion" })).status).toBe(404);
  expect((await f.post({ ...input, projectId: "owned", conversationId: "foreign" })).status).toBe(404);
  expect(f.service.create).not.toHaveBeenCalled();
  expect((await f.post({ ...input, projectId: "owned", conversationId: "discussion" })).status).toBe(201);
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
