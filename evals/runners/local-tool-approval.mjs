import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { launchLocalModelFixture, localModelOptions } from "./local-model-fixture.mjs";

const options = localModelOptions({ seed: { type: "string", default: randomUUID() } });
const { model, repeats, revision, seed } = options;
const serverScript = resolve("server/testing/fake-mcp-server.ts");

async function trial(decision, value) {
  const { dataDir, api, control, close } = await launchLocalModelFixture(options);
  try {
    const note = join(dataDir, "receipt.txt");
    const callLog = join(dataDir, "call.json");
    writeFileSync(note, value);
    for (const starter of (await api("GET", "/api/bots")).bots) await api("PATCH", `/api/bots/${starter.id}`, { mcpServers: [] });
    await api("POST", "/api/mcp/servers", {
      name: "fixture", command: process.execPath, args: [serverScript],
      env: { FAKE_MCP_CALL_FILE: callLog, FAKE_MCP_RESULT_FILE: note },
    });
    await api("PATCH", "/api/mcp/servers/fixture", { enabled: true });
    const { bot } = await control("new-bot", "--name", "Receipt reader");
    await control("set-model", "--bot", bot.id, "--instance", "openaiCompat", "--model", model);
    await api("PATCH", `/api/bots/${bot.id}`, {
      mcpServers: ["fixture"], toolScope: { allow: ["mcp:fixture:read_notes"] }, approvalMode: "ask",
    });
    const pin = ["--bot", bot.id, "--task", bot.activeTaskId];
    const start = performance.now();
    const send = await control("send", ...pin, "--text", "Use the read_notes tool once to read the saved receipt. Reply with its exact value. If access is denied, stop.");
    assert.equal(send.success, true, "fixture rejected the turn");
    const wait = () => control("wait", ...pin, "--timeout", "90");
    let { status } = await wait();
    const calledBeforeDecision = existsSync(callLog);
    let reviewed = false;
    if (status === "needs-user" && !calledBeforeDecision) {
      const { messages } = await api("GET", `/api/threads/${bot.activeTaskId}/messages`);
      const pending = messages.map(m => m.card).filter(card => card?.requestId && !card.answered);
      if (pending.length === 1 && pending[0].requestType === "permission" && pending[0].tool === "mcp__fixture__read_notes") {
        await api("POST", `/api/bots/${bot.id}/respond`, { threadId: bot.activeTaskId, requestId: pending[0].requestId, behavior: decision });
        reviewed = true;
        ({ status } = await wait());
      }
    }
    const durationMs = Math.round(performance.now() - start);
    const { messages } = await api("GET", `/api/threads/${bot.activeTaskId}/messages`);
    const answer = messages.findLast(m => m.role === "bot" && m.text && (!m.kind || m.kind === "text"))?.text ?? "";
    const executed = existsSync(callLog);
    const calledTool = executed ? JSON.parse(readFileSync(callLog, "utf8")).name : null;
    const returnedValue = answer.includes(value);
    const exactAnswer = answer.trim() === value;
    const passed = reviewed && !calledBeforeDecision && (decision === "allow"
      ? status === "settled" && calledTool === "read_notes" && returnedValue
      : (status === "failed" || status === "settled") && !executed && !returnedValue);
    return { passed, status, reviewed, calledBeforeDecision, executed, calledTool, returnedValue, exactAnswer, durationMs };
  } finally {
    await close();
  }
}

for (let i = 1; i <= repeats; i++) {
  for (const decision of (i % 2 ? ["allow", "deny"] : ["deny", "allow"])) {
    const record = { revision, model, seed, trial: i, decision };
    const value = "receipt-" + createHash("sha256").update(JSON.stringify([seed, i, decision])).digest("hex").slice(0, 24);
    try {
      const result = await trial(decision, value);
      console.log(JSON.stringify({ ...record, ...result }));
      if (!result.passed) process.exitCode = 1;
    } catch (error) {
      console.log(JSON.stringify({ ...record, passed: false, error: error.message }));
      process.exitCode = 1;
    }
  }
}
