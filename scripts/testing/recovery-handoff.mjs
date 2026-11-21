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
      marker: row.outboundDispatch, statusOnly: row.statusOnly, result: row.result,
    });
    return { root: project(root), child: project(child) };
  } finally { db.close(); }
}

export async function verifyRecoveryHandoff({ scenario, home, dataDir, fetcher, control, apps, until, record, replace }) {
  const marked = scenario !== "handoff-continue";
  const notification = scenario === "handoff-notify";
  const cancel = scenario === "handoff-cancel";
  const { bot } = await control("create_bot", { name: "Receipt owner", section: "Dispatch" });
  const { bot: helper } = await control("create_bot", { name: "Receipt helper", section: "Review" });
  const patch = (id, body) => fetcher(`/api/bots/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  await patch(bot.id, { chiefOfStaff: true, managedSections: ["Review"], acknowledgePeerScope: true,
    composio: true, connectorScopes: { apps: { gmail: "write" } }, connectorTools: { gmail: { tools: ["GMAIL_SEND_EMAIL"] } }, outbound: { policy: "allow" } });
  const steps = [];
  if (marked) steps.push({ server: "composio", tool: "COMPOSIO_MULTI_EXECUTE_TOOL",
    arguments: { tools: [{ tool_slug: "GMAIL_SEND_EMAIL", arguments: { to: "receipt@example.test", body: "Fixture receipt" } }] } });
  steps.push({ arguments: { bot_ids: [helper.id], message: marked ? "FYI: the fixture receipt is filed." : "Check the fixture inbox and report its count.",
    ...(notification ? { reply: "none" } : {}) } });
  writeFileSync(join(home, "classify.json"), JSON.stringify({ "<teammate_reply>": marked ? "ACK" : "NEEDS" }));
  writeFileSync(join(home, "handoffs.json"), JSON.stringify({
    [bot.id]: { steps, readyFile: join(home, "root-ready"), gateFile: join(home, "root-finish"),
      reply: "Handed off.", resumeReply: "The helper counted four receipts." },
    [helper.id]: { reply: marked ? "Noted." : "The fixture inbox holds four receipts.",
      ...(cancel ? { gateFile: join(home, "child-finish") } : {}) },
  }));
  const since = (await fetcher(`/api/threads/${bot.activeTaskId}/job`)).now;
  const target = { target_type: "bot", target_id: bot.id, task_id: bot.activeTaskId };
  const tree = () => assignmentTree(dataDir, bot.id);
  const sends = () => apps.calls.filter(call => call.tool === "GMAIL_SEND_EMAIL").length;
  await control("send_bot_message", { bot_id: bot.id, task_id: bot.activeTaskId, text: "Follow the receipt plan with your helper." });
  await until(() => existsSync(join(home, "root-ready")) && tree().child?.status === (cancel ? "running" : "completed"), "requester running after handing out work");
  const before = tree();
  assert.equal(before.root.status, "running");
  assert.equal(before.root.marker, marked ? "GMAIL_SEND_EMAIL" : null);
  assert.equal(before.child.reply, notification ? "none" : "resume");
  if (scenario === "handoff-status") assert.equal(before.child.statusOnly, true);
  assert.equal(sends(), marked ? 1 : 0);
  record("handoff-before-crash", { sends: sends(), ...before });
  const replacementPid = await replace();
  if (cancel) {
    await until(() => tree().root?.status === "failed" && tree().child?.status === "running", "helper remains cancellable after recovery");
    await control("interrupt_conversation", target);
    await until(() => tree().child?.status === "cancelled", "the user's Stop reached the helper");
  }
  const wait = await control("wait_for_conversation", { ...target, since_ms: since, timeout_seconds: 8 });
  await until(() => tree().child?.reported, "the helper outcome was durably reported");
  const after = tree();
  record("handoff-after-restart", { sends: sends(), wait: wait.status, state: wait.state, ...after });
  assert.equal(after.root.id, before.root.id);
  assert.equal(after.child.id, before.child.id);
  assert.equal(after.root.status, marked ? "failed" : "completed");
  assert.equal(after.root.outcome, marked ? "interrupted" : "done");
  assert.equal(after.root.executions, marked ? 1 : 2);
  assert.equal(after.child.outcome, cancel ? "stopped" : "done");
  assert.equal(after.child.reported, true);
  assert.equal(wait.status, marked ? "failed" : "settled");
  assert.equal(wait.target.busy, false);
  assert.equal(sends(), marked ? 1 : 0);
  const rows = (await fetcher(`/api/threads/${bot.activeTaskId}/messages`)).messages;
  assert.equal(rows.filter(message => message.tool?.terminal && message.tool.name.includes("GMAIL_SEND_EMAIL")).length, marked ? 1 : 0);
  if (!marked) assert.match(after.root.result, /four receipts/i);
  return { replacementPid, before, after, receiverCalls: sends(), waitStatus: wait.status };
}
