import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { removeTempDir, waitForExit } from "../server/testing/cleanup.ts";
import { openHeadlessChrome } from "./testing/headless-chrome.ts";
import { fixtureApi, mountPreview } from "./testing/preview-fixture.ts";

const { values } = parseArgs({ options: { baseline: { type: "string" }, endpoint: { type: "string" },
  model: { type: "string" }, out: { type: "string" }, metric: { type: "string" }, "no-screenshots": { type: "boolean" } } });
const endpoint = new URL(values.endpoint ?? "");
assert(endpoint.protocol === "http:" && ["127.0.0.1", "[::1]"].includes(endpoint.hostname) && !endpoint.username && !endpoint.password,
  "Provide a dedicated local OpenAI-compatible verification model.");
assert(values.model && values.out, "Pass --model and --out.");
const root = values.baseline ? resolve(values.baseline) : fileURLToPath(new URL("..", import.meta.url));
const { launchVerificationServer, runControlOmb, verificationServerEnvironment, verificationServerArgs } =
  await import(pathToFileURL(join(root, "scripts/control-omb.ts")).href);
const out = resolve(values.out);
await mkdir(out, { recursive: true });
const metric = values.metric ?? "dependencies";
assert(["dependencies", "size"].includes(metric));
const criterion = metric === "size" ? "unpacked package size" : "direct runtime dependency count";
const objective = "Compare zod, valibot and superstruct for a TypeScript application by " + criterion + ". Check current registry sources and save a Markdown report.";
const toolScope = { allow: ["mcp:agents:coordinate_bots", "mcp:agents:wait_until", "mcp:agents:attach_file"] };
const result = { revision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  model: values.model, metric, objective, toolScope, startedAt: new Date().toISOString() };
const fixture = await launchVerificationServer();
const base = fixture.info.url;
const api = fixtureApi(base, { headers: { origin: base } });
const cli = (...args) => runControlOmb([...args, "--url", base]);
const profile = await mkdtemp(join(tmpdir(), "omb-mission-ui-"));
let restarted, preview, page;
const capture = async name => { if (!values["no-screenshots"]) await writeFile(join(out, name), await page.capture()); };
const buttons = "[...document.querySelectorAll('button,[role=tab]')]";
const byText = name => buttons + ".find(b => b.textContent.trim() === " + JSON.stringify(name) + ")";
async function click(name) {
  const selector = byText(name);
  await page.until(selector + " && !" + selector + ".disabled", 35_000);
  await page.evaluate(selector + ".click()");
}
async function openControl() {
  await page.until("document.querySelector('[data-chathead-pill]')");
  if (!(await page.evaluate("document.querySelector('[data-chathead-pill]').getAttribute('aria-label')?.includes('Research')"))) {
    const bot = "[...document.querySelectorAll('button,[role=button]')].find(b => b.innerText?.split('\\n').some(t => t.trim() === 'Research') || b.getAttribute('title') === 'Research')";
    await page.until(bot);
    await page.evaluate(bot + ".click()");
  }
  if (!(await page.evaluate("Boolean(" + byText("Details") + ")"))) await page.evaluate("document.querySelector('[data-chathead-pill]')?.click()");
  await click("Details");
  await click("Mission Control");
  await page.until("document.querySelector('#mission-control-title')");
}
async function current(path) {
  const { missions } = await api("GET", path);
  return api("GET", path + "/" + missions[0].id);
}
async function restart() {
  await waitForExit(fixture.child, { signal: "SIGTERM" });
  const env = verificationServerEnvironment(process.env, fixture.info.dataDir, Number(new URL(base).port));
  restarted = spawn(process.execPath, verificationServerArgs(env), { cwd: root, env, stdio: "ignore", windowsHide: true });
  for (let i = 0; i < 120; i++) {
    if (restarted.exitCode !== null) throw new Error("The isolated server exited during restart.");
    try { await api("GET", "/api/bots"); return; } catch { await delay(250); }
  }
  throw new Error("The isolated server did not return after restart.");
}
try {
  await api("PATCH", "/api/config", { openaiCompat: { key: "fixture-local", url: endpoint.href, model: values.model } });
  await api("POST", "/api/instances/openaiCompat/refresh-models", {});
  await api("PATCH", "/api/instances/openaiCompat", { tools: true });
  const reader = (await api("GET", "/api/bots")).bots[0];
  await api("PATCH", "/api/bots/" + reader.id + "/profile", { name: "Registry reader" });
  await cli("set-model", "--bot", reader.id, "--instance", "openaiCompat", "--model", values.model);
  result.readerScope = { allow: ["mcp:agents:wait_until"] };
  await api("PATCH", "/api/bots/" + reader.id, { toolScope: result.readerScope, approvalMode: "ask" });
  const { bot } = await cli("new-bot", "--name", "Research");
  await cli("set-model", "--bot", bot.id, "--instance", "openaiCompat", "--model", values.model);
  await api("PATCH", "/api/bots/" + bot.id, { toolScope, approvalMode: "ask" });
  const botPath = "/api/bots/" + bot.id;
  if (values.baseline) {
    const start = performance.now();
    await cli("send", "--bot", bot.id, "--text", objective);
    const turn = await cli("wait", "--bot", bot.id, "--timeout", "120");
    const { messages } = await cli("messages", "--bot", bot.id, "--limit", "100");
    const files = await readdir(join(fixture.info.dataDir, "attachments")).catch(e => e.code === "ENOENT" ? [] : Promise.reject(e));
    Object.assign(result, { elapsedMs: Math.round(performance.now() - start), turnStatus: turn.status, messages: messages.map(m => m.role ?? m.kind),
      toolRows: messages.filter(m => m.tool || m.role === "tool" || m.kind === "tool" || m.type === "tool").length,
      attachments: files.length, verifiedReport: files.length ? null : false, usage: (await api("GET", "/api/usage")).total });
    if (files.length) result.requiresArtifactReview = true;
  } else {
    preview = await mountPreview(fixture, { entry: "/scripts/testing/threads-preview.tsx", route: "/mission-check.html",
      title: "OpenMausBot", logLevel: "error" });
    page = await openHeadlessChrome(profile);
    await page.send("Emulation.setDeviceMetricsOverride", { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url: preview.previewUrl });
    await openControl();
    await page.until("document.querySelector('form textarea')");
    await page.evaluate("(() => {const e=document.querySelector('form textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,"
      + JSON.stringify(objective) + ");e.dispatchEvent(new Event('input',{bubbles:true}));})()");
    await page.evaluate("(() => { const e = [...document.querySelectorAll('form select')].find(s => [...s.options].some(o => o.textContent === 'Registry reader'));"
      + "Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e," + JSON.stringify(reader.id) + ");e.dispatchEvent(new Event('change',{bubbles:true})); })()");
    const start = performance.now();
    await click("Prepare plan");
    await page.until(byText("Approve and start") + " || document.querySelector('[role=dialog] [role=alert]') || document.querySelector('[role=dialog] article [role=status]')", 100_000);
    const path = botPath + "/missions";
    const reviewed = await current(path);
    assert.equal(reviewed.state, "review", reviewed.issue);
    assert.deepEqual([...reviewed.plan.packages].sort(), ["superstruct", "valibot", "zod"]);
    assert.equal(reviewed.plan.metric, metric);
    assert.equal(reviewed.researcherId, reader.id);
    assert.equal(reviewed.usage.toolCalls, 0);
    assert.equal(reviewed.usage.modelCalls, 1);
    result.planMs = Math.round(performance.now() - start);
    await capture("review.png");
    const execution = performance.now();
    await click("Approve and start");
    await page.until(byText("Pause new steps") + " || " + byText("Preview report"));
    await page.evaluate("document.querySelector('[aria-labelledby=mission-control-title] button[aria-label=Close]').click()");
    await page.until("!document.querySelector('#mission-control-title')");
    await openControl();
    await page.until("document.querySelector('[aria-labelledby=mission-control-title] article .ui-chip')?.textContent === 'Completed'", 100_000);
    const verified = await current(path);
    assert.equal(verified.state, "completed", verified.issue);
    assert(verified.steps.every(step => step.status === "verified" && step.attempts === 1));
    assert(verified.steps.filter(step => step.kind === "source").every(step => step.botId === reader.id));
    assert(verified.steps.filter(step => step.kind !== "source").every(step => step.botId === bot.id));
    const href = await page.evaluate("document.querySelector('a[download=\"report.md\"]').getAttribute('href')");
    const download = async () => {
      const response = await fetch(base + href, { headers: { origin: base } });
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-disposition"), /attachment/);
      return Buffer.from(await response.arrayBuffer());
    };
    const bytes = await download();
    assert.equal(createHash("sha256").update(bytes).digest("hex"), verified.artifact.sha256);
    for (const step of verified.steps.filter(s => s.kind === "source")) assert(bytes.toString().includes(step.observation.source));
    Object.assign(result, { executionMs: Math.round(performance.now() - execution), elapsedMs: Math.round(performance.now() - start),
      verifiedReport: true, mission: verified, usage: (await api("GET", "/api/usage")).total });
    await writeFile(join(out, "report.md"), bytes);
    await capture("completed.png");
    await restart();
    await page.send("Page.navigate", { url: preview.previewUrl });
    await openControl();
    await page.until(byText("Preview report"));
    await click("Preview report");
    await page.until("document.querySelector('#mission-report')?.innerText.includes('Registry sources')");
    const restored = await current(path);
    assert.deepEqual(restored, verified);
    assert.deepEqual(await download(), bytes);
    await page.send("Emulation.setDeviceMetricsOverride", { width: 430, height: 790, deviceScaleFactor: 1, mobile: false });
    await page.until("document.documentElement.scrollWidth <= innerWidth");
    await capture("narrow.png");
    result.reopenedAfterRestart = true;
    const note = "memory/mission-" + restored.id + "-v" + restored.version + ".md";
    const noteUrl = botPath + "/memory/file?path=" + encodeURIComponent(note);
    assert.equal((await api("GET", noteUrl)).exists, false);
    await click("Draft a memory note");
    assert.equal((await api("GET", noteUrl)).exists, false);
    await click("Save to bot memory");
    await page.until("document.body.innerText.includes('Saved to this bot')");
    assert((await api("GET", noteUrl)).text.includes(restored.artifact.sha256));
    result.noteSavedByOwner = true;
  }
  const name = values.baseline ? "baseline.json" : "mission.json";
  await writeFile(join(out, name), JSON.stringify(result, null, 2) + "\n");
  assert(result.usage && typeof result.usage.input === "number");
  console.log(name, result.elapsedMs, "ms", "verified:", result.verifiedReport);
} catch (error) {
  if (page) console.error((await page.evaluate("document.body.innerText"))?.slice(-2600));
  throw error;
} finally {
  page?.close();
  if (page) await page.exited(5000);
  await preview?.close();
  if (restarted) await waitForExit(restarted, { signal: "SIGTERM" });
  await fixture.close();
  await removeTempDir(profile);
}
