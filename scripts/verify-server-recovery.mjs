// Real Electron utilityProcess + built server, never the operator's desktop.
// Run after pnpm build:server. Evidence remains; fixture homes are removed.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServerSupervisor } from "../electron/server-supervisor.mjs";
import { pollServerIdentity } from "../electron/server-boot-probe.mjs";
import { acquireDataDirLease } from "../electron/data-dir-lease.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const flag = "--omb-server-recovery-fixture";
const platformEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^(systemroot|windir|comspec|pathext|display)$/i.test(key)));
function fixtureEnv(home, runtime) {
  return {
    ...platformEnv, PATH: dirname(runtime), HOME: home, USERPROFILE: home,
    XDG_CONFIG_HOME: home, XDG_CACHE_HOME: home, XDG_DATA_HOME: home,
    APPDATA: home, LOCALAPPDATA: home, TMPDIR: home, TEMP: home, TMP: home,
    OMB_TEST_SEALED_PATH: "1", OMB_DISABLE_ANNOUNCEMENTS: "1", OMB_DISABLE_MODEL_MANIFEST_FETCH: "1",
  };
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check, label) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(20);
  }
  throw new Error(`Timed out: ${label}`);
}
async function freePort() {
  const listener = createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  return port;
}

if (process.versions.electron && process.argv.includes(flag)) {
  const { app, utilityProcess } = await import("electron");
  const [scenario, output, runtime] = process.argv.slice(process.argv.indexOf(flag) + 1);
  const home = join(output, scenario, "home");
  app.setPath("home", home);
  app.setPath("userData", join(home, "profile"));
  app.setPath("sessionData", join(home, "profile"));
  app.commandLine.appendSwitch("disable-background-networking");
  process.once("SIGTERM", () => app.quit());
  process.once("SIGINT", () => app.quit());
  const { createTrustedApprovalModeCoordinator } = createRequire(import.meta.url)("../electron/approval-trusted-mode.cjs");
  const { DESKTOP_MUTATION_HEADER } = createRequire(import.meta.url)("../electron/desktop-server-auth.cjs");
  const approval = createTrustedApprovalModeCoordinator({ randomId: randomUUID });
  const events = [];
  const commands = [];
  const children = [];
  const exits = new WeakMap();
  let lease;
  let supervisor;
  let active = null;
  let exhausted = false;
  let fakePid = null;
  let quitting = false;
  let finalReceipt;
  let apps;
  const replyGate = Promise.withResolvers();
  let holdApprovalFrom;
  let heldReply = false;
  const record = (event, fields = {}) => {
    const row = { event, at: Date.now(), ...fields };
    events.push(row);
    console.log(JSON.stringify(row));
  };
  const stop = async (proc) => {
    if (!proc) return true;
    proc.kill();
    return Promise.race([exits.get(proc).then(() => true), sleep(6500).then(() => false)]);
  };
  app.on("before-quit", (event) => {
    if (quitting) return;
    quitting = true;
    event.preventDefault();
    void (async () => {
      assert.equal(await supervisor?.shutdown(), true);
      if (fakePid) { try { process.kill(fakePid, "SIGKILL"); } catch {} fakePid = null; }
      replyGate.resolve();
      await apps?.close();
      const count = children.length;
      // Let the first retry deadline pass after real Electron before-quit.
      await sleep(1200);
      assert.equal(children.length, count, "quit must not spawn another child");
      assert.equal(active, null);
      lease?.release();
      record("quit-clean", { children: count });
      if (finalReceipt) {
        finalReceipt.events = events;
        writeFileSync(join(output, `${scenario}.json`), `${JSON.stringify(finalReceipt, null, 2)}\n`);
      }
      app.exit(finalReceipt ? 0 : 1);
    })().catch((error) => { console.error(error); app.exit(1); });
  });

  app.whenReady().then(async () => {
    const dataDir = join(home, "data");
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, "config.json"), JSON.stringify({ features: { smartSetupChoices: false }, instances: {
      claude: { driver: "claudeAgent", displayName: "Isolated fake", config: { cli: join(root, "server/testing/fake-claude-cli.ts") } },
    } }));
    const port = await freePort();
    let webhookPort;
    do { webhookPort = await freePort(); } while (webhookPort === port);
    const url = `http://127.0.0.1:${port}`;
    const token = randomBytes(32).toString("base64url");
    lease = acquireDataDirLease(dataDir);
    const leaseFile = join(dataDir, "openmausbot-server.lease");
    const parentLease = readFileSync(leaseFile, "utf8");
    const outbound = scenario === "recover" || scenario === "in-flight";
    const withTurn = outbound || scenario === "continue";
    const slug = outbound ? "GMAIL_SEND_EMAIL" : "GMAIL_FETCH_EMAILS";
    const callsFile = join(home, "calls.json");
    const finishGate = join(home, "finish");
    const requestAppTool = (tool_slug, args) => writeFileSync(callsFile, JSON.stringify([{
      server: "composio", name: "COMPOSIO_MULTI_EXECUTE_TOOL", input: { tools: [{ tool_slug, arguments: args }] },
    }]));
    if (withTurn) {
      const { startFakeConnectedApps } = await import("../server/testing/fake-connected-apps.ts");
      apps = await startFakeConnectedApps(scenario === "in-flight" ? () => replyGate.promise : undefined);
      requestAppTool(slug, outbound ? { to: "fixture@example.test", body: "receipt" } : { user_id: "me" });
    }
    const start = async () => {
      const proc = utilityProcess.fork(join(output, "server/index.js"), [], {
        cwd: home, stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...fixtureEnv(home, runtime),
          OMB_DATA_DIR: dataDir, OMB_PORT: String(port), OMB_WEBHOOK_PORT: String(webhookPort),
          OMB_STATIC_DIR: join(output, "ui"), OMB_DESKTOP_PARENT: "1",
          ...lease.utilityServerLeaseEnvironment(),
          ...(apps ? { OMB_COMPOSIO_BROKER_URL: apps.url, OMB_COMPOSIO_BROKER_TOKEN: apps.token } : {}),
          FAKE_CLAUDE_MODE: "slow", FAKE_CLAUDE_TOOL_CALLS_FILE: callsFile, FAKE_CLAUDE_SLOW_FINISH_GATE: finishGate,
          FAKE_CLAUDE_PROMPTS: join(home, "prompts.jsonl"),
          FAKE_CLAUDE_DUMP: join(home, "fake.json"),
        },
      });
      children.push(proc);
      let exited = false;
      exits.set(proc, new Promise((resolve) => proc.once("exit", (code) => {
        exited = true;
        approval.rejectProcess(proc);
        record("exit", { code });
        resolve();
      })));
      supervisor.watch(proc);
      proc.once("spawn", () => {
        record("spawn", { pid: proc.pid, generation: children.length });
        proc.postMessage({ type: "openmausbot:desktop-mutation-token", token, companionToken: token });
      });
      proc.on("message", (message) => {
        if (proc === holdApprovalFrom && message.type === "approval-trusted-mode-result") { heldReply = true; return; }
        if (supervisor.isCurrent(proc)) approval.receive(proc, message);
      });
      for (const stream of [proc.stdout, proc.stderr]) stream?.on("data", (data) => process.stdout.write(data));
      const identity = await pollServerIdentity({ port, pid: () => proc.pid, bootTimeoutMs: 20_000, isExited: () => exited || quitting });
      if (identity.outcome === "ready" && supervisor.isCurrent(proc)) return { proc };
      return { proc: null, abort: !(await stop(proc)) };
    };
    supervisor = createServerSupervisor({
      restart: start, stop, log: (message) => record("recovery", { message }),
      onReady(proc) {
        active = proc;
        record("ready", { pid: proc.pid, port });
        assert.equal(readFileSync(leaseFile, "utf8"), parentLease, "parent lease must never be replaced");
        if (scenario === "exhausted" && children.length > 1) setTimeout(() => process.kill(proc.pid, "SIGKILL"), 30);
      },
      onUnavailable() { active = null; record("unavailable"); },
      onExhausted() { exhausted = true; record("exhausted"); },
    });
    const initial = await start();
    assert.ok(initial.proc, "initial server must pass its PID identity probe");
    assert.equal(supervisor.ready(initial.proc), true);
    const initialPid = initial.proc.pid;
    const fetcher = async (route, options = {}) => {
      const response = await fetch(`${url}${route}`, {
        ...options, headers: { "content-type": "application/json", [DESKTOP_MUTATION_HEADER]: token },
        signal: AbortSignal.timeout(10_000),
      });
      assert.ok(response.ok, `${route}: ${response.status} ${await response.clone().text()}`);
      return response.json();
    };
    const { handleToolCall } = await import(pathToFileURL(join(output, "server/mcp-server.js")));
    const control = async (name, args) => {
      const result = await handleToolCall(name, args, fetcher);
      commands.push({ name, args, result });
      return result;
    };

    if (withTurn) {
      assert.deepEqual(await fetcher("/api/edition"), { edition: "oss", features: [] });
      const { bot } = await control("create_bot", { name: "Recovery fixture" });
      const { bot: approvalProbe } = await control("create_bot", { name: "Approval probe" });
      assert.equal((await approval.request(active, bot.id, "ask")).approvalMode, "ask");
      const target = { bot_id: bot.id, task_id: bot.activeTaskId };
      await fetcher(`/api/bots/${bot.id}`, { method: "PATCH", body: JSON.stringify({
        composio: true, connectorScopes: { apps: { gmail: outbound ? "write" : "read" } },
        connectorTools: { gmail: { tools: [slug] } }, outbound: { policy: "allow" },
      }) });
      let since = (await fetcher(`/api/threads/${bot.activeTaskId}/job`)).now;
      await control("send_bot_message", { ...target, text: outbound ? "Send the fixture receipt once." : "Read the fixture inbox." });
      const transcript = () => fetcher(`/api/threads/${bot.activeTaskId}/messages`).then(page => page.messages);
      const effectCount = () => apps.calls.filter(call => call.tool === slug).length;
      const hasToolResult = async () => (await transcript()).some(message => message.tool?.name.includes("MULTI_EXECUTE_TOOL") && message.tool.ok === true);
      await until(() => effectCount() === 1, "one call reached the connected app");
      if (scenario !== "in-flight") await until(hasToolResult, "successful connected-app result before crash");
      fakePid = JSON.parse(readFileSync(join(home, "fake.json"), "utf8")).pid;
      const prompts = readFileSync(join(home, "prompts.jsonl"), "utf8");
      assert.equal(prompts.trim().split("\n").length, 1);
      holdApprovalFrom = initial.proc;
      const pendingApproval = approval.request(initial.proc, approvalProbe.id, "ask").then(
        () => "unexpected success", (error) => error.message,
      );
      await until(() => heldReply, "real approval reply held in transit");
      const resultSeen = await hasToolResult();
      assert.equal(resultSeen, scenario !== "in-flight");
      const cut = await fetcher(`/api/threads/${bot.activeTaskId}/job?since=${since}`);
      assert.equal(cut.nodes.length, 1);
      assert.equal(cut.nodes[0].status, "running");
      record("before-crash", { slug, effects: effectCount(), prompts: 1, resultSeen, assignment: cut.nodes[0].id });
      process.kill(initialPid, "SIGKILL");
      await exits.get(initial.proc);
      assert.equal(active, null, "readiness cleared in the same exit dispatch");
      assert.match(await pendingApproval, /server stopped/);
      replyGate.resolve();
      try { process.kill(fakePid, "SIGKILL"); } catch (error) { if (error.code !== "ESRCH") throw error; }
      fakePid = null;
      writeFileSync(finishGate, "finish");
      await until(() => active && active.pid !== initialPid, "replacement PID verified");
      const replacementPid = active.pid;
      assert.equal(JSON.parse(readFileSync(join(dataDir, ".openmausbot-server-child/openmausbot-server.lease"), "utf8")).pid, replacementPid);
      const conversation = { target_type: "bot", target_id: bot.id, task_id: bot.activeTaskId };
      const waitForTurn = () => control("wait_for_conversation", { ...conversation, since_ms: since, timeout_seconds: 20 });
      const wait = await waitForTurn();
      const promptCount = () => readFileSync(join(home, "prompts.jsonl"), "utf8").trim().split("\n").length;
      record("after-restart", { slug, effects: effectCount(), prompts: promptCount(), status: wait.status, state: wait.state, busy: wait.target.busy });
      assert.equal(effectCount(), outbound ? 1 : 2);
      assert.equal(promptCount(), outbound ? 1 : 2);
      assert.equal(wait.state, outbound ? "failed" : "completed");
      assert.equal(wait.status, outbound ? "failed" : "settled");
      assert.equal(wait.target.busy, false);
      assert.equal(wait.job.nodes.length, 1);
      const recovered = wait.job.nodes[0];
      assert.equal(recovered.id, cut.nodes[0].id);
      assert.equal(recovered.executions, outbound ? 1 : 2);
      assert.equal(recovered.outcome, outbound ? "interrupted" : "done");
      const savedBot = (await fetcher("/api/bots?messages=0")).bots.find(candidate => candidate.id === bot.id);
      assert.equal(savedBot.approvalMode, "ask");
      assert.equal(savedBot.connectorScopes.apps.gmail, outbound ? "write" : "read");
      const messages = await control("get_bot_messages", { bot_id: bot.id, task_id: bot.activeTaskId, limit: 10 });
      assert.equal(messages.messages.filter((message) => message.role === "user").length, 1);
      if (outbound) {
        const failed = messages.messages.filter(message => message.tool?.ok === false && message.tool.name.includes(slug));
        assert.equal(failed.length, 1, "one visible interruption naming the outward action");
        assert.equal(failed[0].tool.terminal, true);
        writeFileSync(callsFile, "[]");
        since = (await fetcher(`/api/threads/${bot.activeTaskId}/job`)).now;
        await control("send_bot_message", { ...target, text: "Summarize what remains." });
        assert.equal((await waitForTurn()).state, "completed");
        assert.equal(effectCount(), 1, "fresh request does not duplicate the send");
      } else {
        rmSync(finishGate);
        requestAppTool("GMAIL_SEND_EMAIL", { to: "fixture@example.test", body: "restricted" });
        since = (await fetcher(`/api/threads/${bot.activeTaskId}/job`)).now;
        await control("send_bot_message", { ...target, text: "Try a send with read-only Gmail." });
        await until(async () => (await transcript()).some(message => message.at >= since &&
          message.tool?.name === "COMPOSIO_MULTI_EXECUTE_TOOL" && message.tool.ok === false), "write refused on the replacement");
        await control("interrupt_conversation", conversation);
        const stopped = await waitForTurn();
        assert.equal(stopped.target.busy, false);
        assert.ok(stopped.job.nodes.some(node => node.status === "cancelled" && node.outcome === "stopped"));
        const sends = apps.calls.filter(call => call.tool === "GMAIL_SEND_EMAIL").length;
        assert.equal(sends, 0, "the read-only grant prevents the send");
        record("denied-and-stopped", { sends, busy: stopped.target.busy });
      }
      assert.equal((await approval.request(active, bot.id, "ask")).approvalMode, "ask");
      await control("create_bot", { name: "Replacement accepts fresh authorized writes" });
      const refused = await fetch(`${url}/api/bots`, { method: "POST", headers: { "content-type": "application/json" }, body: '{"name":"Must refuse"}' });
      assert.equal(refused.status, 403, "replacement remains fail-closed without the private token");
      finalReceipt = { passed: true, scenario, url, initialPid, replacementPid, commands,
        checks: ["PID verified replacement", "same port", "unchanged parent lease", "replacement child lease", "immediate unavailable", "pending approval rejected", "new approval accepted", "private mutation capability restored", "unauthorized write refused",
          outbound ? "one send, visible interruption and explicit follow-up" : "read-only turn resumed once and completed"],
        limitation: "Headless Electron main with the production supervisor, probe, lease, approval protocol and built server. The engine and connected-app service are local fakes." };
    } else {
      process.kill(initialPid, "SIGKILL");
      await exits.get(initial.proc);
      assert.equal(active, null);
      if (scenario === "exhausted") {
        await until(() => exhausted, "bounded recovery exhausted");
        assert.equal(children.length, 4, "initial child plus exactly three replacements");
        await sleep(4500);
        assert.equal(children.length, 4, "exhaustion must stop retries without needing app.quit");
      }
      finalReceipt = { passed: true, scenario, url, initialPid, children: children.length,
        checks: scenario === "quit" ? ["actual before-quit cancels pending retry", "no replacement after retry deadline"] : ["three bounded recovery attempts", "no restart after exhaustion"] };
    }
    app.quit();
  }).catch((error) => { console.error(error); app.quit(); });
} else {
  // macOS's default temp path leaves no room for the server's Unix sockets.
  const output = mkdtempSync(join(process.platform === "darwin" ? "/tmp" : tmpdir(), "omb-server-recovery-"));
  const electron = createRequire(import.meta.url)("electron");
  cpSync(join(root, "dist-server"), join(output, "server"), { recursive: true });
  mkdirSync(join(output, "ui"));
  writeFileSync(join(output, "ui/index.html"), "<!doctype html><title>Isolated recovery fixture</title>");
  console.log(JSON.stringify({ evidence: output }));
  const cleanup = { recursive: true, force: true, maxRetries: 5, retryDelay: 250 };
  try {
    for (const scenario of ["recover", "in-flight", "continue", "quit", "exhausted"]) {
      const home = join(output, scenario, "home");
      mkdirSync(home, { recursive: true });
      const child = spawn(electron, [fileURLToPath(import.meta.url), flag, scenario, output, process.execPath], {
        cwd: home, env: fixtureEnv(home, process.execPath), stdio: ["ignore", "pipe", "pipe"],
      });
      for (const stream of [child.stdout, child.stderr]) stream.on("data", (data) => appendFileSync(join(output, `${scenario}.log`), data));
      const timeout = setTimeout(() => child.kill("SIGTERM"), 60_000);
      try {
        const code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
        assert.equal(code, 0, `${scenario} failed; see ${join(output, `${scenario}.log`)}`);
        console.log(JSON.stringify({ scenario, receipt: join(output, `${scenario}.json`), passed: true }));
      } finally {
        clearTimeout(timeout);
        rmSync(home, cleanup);
      }
    }
  } finally {
    rmSync(join(output, "server"), cleanup);
    rmSync(join(output, "ui"), cleanup);
  }
}
