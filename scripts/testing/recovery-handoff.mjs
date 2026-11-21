import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

function assignmentTree(dataDir, botId) {
  const db = new DatabaseSync(join(dataDir, "runtime.db"), { readOnly: true });
  try {
    const rows = db.prepare("SELECT json FROM assignments").all().map(row => JSON.parse(row.json));
    const root = rows.find(row => !row.parentId && row.assignee.botId === botId);
    const child = rows.find(row => row.parentId === root?.id);
    const project = row => row && ({
      id: row.id, parentId: row.parentId, status: row.status, outcome: row.outcome, detail: row.outcomeDetail,
      executions: row.executions, reported: row.reportedAt !== undefined, mode: row.mode, reply: row.reply,
      hasMarkerField: Object.hasOwn(row, "outboundDispatch"), marker: row.outboundDispatch, statusOnly: row.statusOnly, result: row.result,
    });
    return { root: project(root), child: project(child) };
  } finally { db.close(); }
}

export async function verifyRecoveryHandoff({ scenario, legacy, home, dataDir, fetcher, control, apps, until, record, replace }) {
  const readOnly = scenario === "handoff-read";
  const bounded = scenario === "handoff-bounded";
  const sendsReceipt = scenario !== "handoff-continue" && !readOnly;
  const substantive = !sendsReceipt || bounded || scenario === "handoff-substantive";
  const notification = scenario === "handoff-notify";
  const cancel = scenario === "handoff-cancel";
  const { bot } = await control("create_bot", { name: "Receipt owner", section: "Dispatch" });
  const { bot: helper } = await control("create_bot", { name: readOnly ? "Send receipts" : "Receipt helper", section: "Review" });
  const patch = (id, body) => fetcher(`/api/bots/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  const allowedTools = readOnly ? ["GMAIL_FETCH_EMAILS"] : ["GMAIL_SEND_EMAIL"];
  if (bounded) allowedTools.push("GMAIL_FETCH_EMAILS");
  await patch(bot.id, { chiefOfStaff: true, managedSections: ["Review"], acknowledgePeerScope: true,
    composio: true, connectorScopes: { apps: { gmail: readOnly ? "read" : "write" } },
    connectorTools: { gmail: { tools: allowedTools } },
    outbound: { policy: "allow" } });
  const steps = [];
  const reads = bounded ? 39 : readOnly ? 1 : 0;
  const tools = Array.from({ length: reads }, (_, index) => ({
    tool_slug: "GMAIL_FETCH_EMAILS", arguments: { query: `label:${index}`, max_results: 1 },
  }));
  if (sendsReceipt) tools.push({ arguments: { to: "receipt@example.test", body: "Fixture receipt" }, tool_slug: "GMAIL_SEND_EMAIL" });
  if (tools.length) steps.push({ server: "composio", tool: "COMPOSIO_MULTI_EXECUTE_TOOL", arguments: { tools }, emitToolActivity: true });
  steps.push({ arguments: { bot_ids: [helper.id], message: substantive ? "Check the fixture inbox and report its count." : "FYI: the fixture receipt is filed.",
    ...(notification ? { reply: "none" } : {}) } });
  writeFileSync(join(home, "classify.json"), JSON.stringify({ "<teammate_reply>": substantive ? "NEEDS" : "ACK" }));
  writeFileSync(join(home, "handoffs.json"), JSON.stringify({
    [bot.id]: { steps, readyFile: join(home, "root-ready"), gateFile: join(home, "root-finish"),
      reply: "Handed off.", resumeReply: "The helper counted four receipts." },
    [helper.id]: { reply: substantive ? "The fixture inbox holds four receipts." : "Noted.",
      ...(cancel ? { gateFile: join(home, "child-finish") } : {}) },
  }));
  const since = (await fetcher(`/api/threads/${bot.activeTaskId}/job`)).now;
  const target = { target_type: "bot", target_id: bot.id, task_id: bot.activeTaskId };
  const tree = () => assignmentTree(dataDir, bot.id);
  const sends = () => apps.calls.filter(call => call.tool === "GMAIL_SEND_EMAIL").length;
  const fetches = () => apps.calls.filter(call => call.tool === "GMAIL_FETCH_EMAILS").length;
  const transcript = async () => (await fetcher(`/api/threads/${bot.activeTaskId}/messages`)).messages;
  await control("send_bot_message", { bot_id: bot.id, task_id: bot.activeTaskId, text: "Follow the receipt plan with your helper." });
  await until(() => existsSync(join(home, "root-ready")) && tree().child?.status === (cancel ? "running" : "completed"), "requester running after handing out work");
  const before = tree();
  assert.equal(before.root.status, "running");
  assert.equal(before.root.hasMarkerField, !legacy);
  if (!legacy) assert.equal(before.root.marker, sendsReceipt ? "GMAIL_SEND_EMAIL" : null);
  assert.equal(before.child.reply, notification ? "none" : "resume");
  if (scenario === "handoff-status") assert.equal(before.child.statusOnly, true);
  if (substantive) assert.ok(!before.child.statusOnly);
  assert.equal(sends(), Number(sendsReceipt));
  assert.equal(fetches(), reads);
  let savedBatch;
  if (tools.length) {
    const batch = (await transcript()).find(message => message.tool?.name === "COMPOSIO_MULTI_EXECUTE_TOOL" && message.tool.ok)?.tool;
    assert.ok(batch, "server persisted the provider's successful tool result before the crash");
    const lastSlug = JSON.parse(batch.input).tools.at(-1).tool_slug;
    assert.equal(lastSlug, bounded ? "[additional data omitted]" : tools.at(-1).tool_slug);
    savedBatch = { name: batch.name, ok: batch.ok, previewChars: batch.input.length, lastSlug };
  }
  record("handoff-before-crash", { sends: sends(), reads: fetches(), savedBatch, ...before });
  const replacementPid = await replace();
  if (cancel) {
    await until(() => tree().root?.status === "failed" && tree().child?.status === "running", "helper remains cancellable after recovery");
    await control("interrupt_conversation", target);
    await until(() => tree().child?.status === "cancelled", "the user's Stop reached the helper");
  }
  const wait = await control("wait_for_conversation", { ...target, since_ms: since, timeout_seconds: 8 });
  await until(() => tree().child?.reported, "the helper outcome was durably reported");
  const after = tree();
  record("handoff-after-restart", { sends: sends(), reads: fetches(), wait: wait.status, state: wait.state, ...after });
  assert.equal(after.root.id, before.root.id);
  assert.equal(after.child.id, before.child.id);
  assert.equal(after.root.status, sendsReceipt ? "failed" : "completed");
  assert.equal(after.root.outcome, sendsReceipt ? "interrupted" : "done");
  assert.equal(after.root.executions, sendsReceipt ? 1 : 2);
  assert.equal(after.child.outcome, cancel ? "stopped" : "done");
  assert.equal(after.child.reported, true);
  assert.equal(wait.status, sendsReceipt ? "failed" : "settled");
  assert.equal(wait.target.busy, false);
  assert.equal(sends(), Number(sendsReceipt));
  assert.equal(fetches(), reads);
  const receipts = (await transcript()).filter(message => message.tool?.terminal);
  assert.equal(receipts.length, Number(sendsReceipt));
  if (sendsReceipt) {
    assert.match(after.root.detail, /may have taken effect/);
    assert.ok(receipts[0].tool.name.includes(legacy && bounded ? "COMPOSIO_MULTI_EXECUTE_TOOL" : "GMAIL_SEND_EMAIL"));
  } else {
    assert.match(after.root.result, /four receipts/i);
  }
  return { replacementPid, before, after, savedBatch, receiverCalls: sends(), reads: fetches(), waitStatus: wait.status };
}
