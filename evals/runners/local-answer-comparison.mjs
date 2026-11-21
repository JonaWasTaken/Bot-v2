import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: {
  endpoint: { type: "string" },
  model: { type: "string" },
  repeats: { type: "string", default: "3" },
} });
if (!values.endpoint || !values.model) throw new Error("Supply --endpoint http://127.0.0.1:PORT/v1 and --model MODEL.");
const endpoint = new URL(values.endpoint);
if (endpoint.protocol !== "http:" || endpoint.hostname !== "127.0.0.1" || endpoint.username || endpoint.password ||
    endpoint.pathname !== "/v1" || endpoint.search || endpoint.hash) throw new Error("Use a local /v1 endpoint.");
const repeats = Number(values.repeats);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10) throw new Error("--repeats must be between 1 and 10.");

const tasks = [
  {
    id: "general",
    prompt: "A meeting starts at 10:40 and takes 35 minutes. Give only the finishing time in HH:MM.",
    answer: "11:15",
  },
  {
    id: "source-reconciliation",
    prompt: "Use these records. Alpha memo A1: freight is 72 per crate, plus a single 16 booking fee. Beta memo B1: 68 per crate, plus 40 booking. Beta amendment B2 replaces B1: the booking fee is 18. For three crates, give the cheaper carrier, total, and final applicable source IDs. Use exactly the format CARRIER TOTAL SOURCE1 SOURCE2, ordering source IDs alphabetically.",
    answer: "BETA 222 A1 B2",
  },
  {
    id: "code-review",
    prompt: "Review this JavaScript expression: return records.find(r => r.id = wanted); It should look up a record without modifying it and without coercing its ID. Give only the replacement operator.",
    answer: "===",
  },
];
const { launchVerificationServer, runControlOmb } = await import(pathToFileURL(resolve("scripts/control-omb.ts")).href);
const revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const fixture = await launchVerificationServer();
const api = async (method, path, body) => {
  const res = await fetch(fixture.info.url + path, {
    method, headers: { origin: fixture.info.url, "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`${method} ${path} returned ${res.status}`);
  return res.json();
};
const control = (...args) => runControlOmb([...args, "--url", fixture.info.url]);
try {
  await api("PATCH", "/api/config", { openaiCompat: { key: "local-fixture", url: endpoint.href, model: values.model } });
  await api("POST", "/api/instances/openaiCompat/refresh-models", {});
  await api("PATCH", "/api/instances/openaiCompat", { tools: false });
  for (let trial = 1; trial <= repeats; trial++) {
    for (const task of tasks) {
      const { bot } = await control("new-bot", "--name", `Reader ${task.id} ${trial}`);
      await control("set-model", "--bot", bot.id, "--instance", "openaiCompat", "--model", values.model);
      const pin = ["--bot", bot.id, "--task", bot.activeTaskId];
      const start = performance.now();
      const receipt = await control("send", ...pin, "--text", task.prompt);
      if (!receipt.success) throw new Error("Fixture failed to send the task.");
      const waited = await control("wait", ...pin, "--timeout", "120");
      const durationMs = Math.round(performance.now() - start);
      const { messages } = await api("GET", `/api/threads/${bot.activeTaskId}/messages`);
      const answer = messages.findLast(m => m.role === "bot" && m.text && (!m.kind || m.kind === "text"))?.text?.trim() ?? "";
      const correct = waited.status === "settled" && answer.replaceAll("`", "").toUpperCase() === task.answer;
      const usage = (await api("GET", "/api/usage?groupBy=bot")).groups.find(row => row.key === `bot:${bot.id}`);
      console.log(JSON.stringify({ revision, model: values.model, trial, task: task.id, status: waited.status,
        correct, answer, durationMs, usage: usage ?? null }));
    }
  }
} finally {
  await fixture.close();
}
