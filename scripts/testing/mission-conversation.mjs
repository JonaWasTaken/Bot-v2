import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const projectBrief = {
  objective: "Research three suitable open-source tools for a TypeScript application, compare their strengths, choose an appropriate option, create a report, and save the findings to my project.",
  topic: "validation-requirements.md",
  text: "This project needs a runtime schema validator for untrusted JSON in a TypeScript application. Choose three comparable npm libraries with bundled type declarations and permissive licenses. We distribute the full package with the app, so minimize published unpacked size.",
};

export async function selectProjectBrief(api, botPath, page) {
  const path = "memory/" + projectBrief.topic;
  const url = botPath + "/memory/file";
  const current = await api("GET", url + "?path=" + encodeURIComponent(path));
  assert.equal(current.exists, false);
  await api("PUT", url, { path, text: projectBrief.text, expectedHash: current.hash });
  await page.evaluate("document.querySelector('form details summary').click()");
  await page.evaluate("(() => {const e = document.querySelector('form input[placeholder=\"architecture.md\"]');"
    + "Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e," + JSON.stringify(projectBrief.topic)
    + "); e.dispatchEvent(new Event('input',{bubbles:true}));})()");
}

export async function conversationReports(api, threadId) {
  const { messages } = await api("GET", "/api/threads/" + threadId + "/messages");
  return messages.flatMap(message => (message.attachments ?? [])
    .filter(file => file.kind === "file" && file.name === "report.md")
    .map(file => ({ messageId: message.id, text: message.text, path: file.path })));
}

export async function checkConversationReport(api, base, threadId, expectedBytes) {
  const reports = await conversationReports(api, threadId);
  assert.equal(reports.length, 1, "The linked conversation must contain exactly one posted report.");
  const [{ messageId, path, text }] = reports;
  assert.equal(text, expectedBytes.toString("utf8"), "The follow-up conversation must contain the verified findings.");
  const response = await fetch(base + "/api/threads/" + threadId + "/messages/" + messageId + "/file", {
    method: "POST", headers: { origin: base, "content-type": "application/json" }, body: JSON.stringify({ path }),
  });
  assert.equal(response.status, 200, "The chat attachment must open through its own message.");
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(bytes, expectedBytes);
  return { messageId, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

export async function checkDamagedReportRefusal(fixture, postPath, revision, bytes) {
  const dir = join(fixture.info.dataDir, "attachments");
  const reports = (await readdir(dir)).filter(name => name.endsWith(".md"));
  assert.equal(reports.length, 1);
  const file = join(dir, reports[0]), damaged = Buffer.from(bytes);
  damaged[0] ^= 1;
  try {
    await writeFile(file, damaged);
    const base = fixture.info.url;
    const response = await fetch(base + postPath, { method: "POST", headers: { origin: base, "content-type": "application/json" },
      body: JSON.stringify({ revision }) });
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /verification receipt/);
    return response.status;
  } finally {
    await writeFile(file, bytes);
  }
}

export async function checkReportFollowUp(cli, api, botId, threadId, observation) {
  const question = "Using the report in this conversation, give the published unpacked size in bytes and the exact versioned registry URL for "
    + observation.name + ". Use the saved findings.";
  await cli("send", "--bot", botId, "--task", threadId, "--text", question);
  await cli("wait", "--bot", botId, "--task", threadId, "--timeout", "120");
  const { messages } = await api("GET", "/api/threads/" + threadId + "/messages");
  const questionIndex = messages.findIndex(m => m.role === "user" && m.text === question);
  assert(questionIndex >= 0, "The follow-up must reach the linked conversation.");
  const answer = messages.slice(questionIndex + 1).filter(m => m.role === "bot" && m.kind === "text").map(m => m.text).join("\n");
  assert(answer.includes(observation.source), "The follow-up must cite the version in the saved report.");
  assert(observation.bytes !== null && new RegExp("\\b" + observation.bytes + "\\b").test(answer.replaceAll(",", "")),
    "The answer must reproduce the measured unpacked bytes.");
  return { source: observation.source, bytes: observation.bytes, matched: true };
}

export async function captureReportSkins(page, capture) {
  const original = await page.evaluate('import("/src/lib/skins.ts").then(s => s.readSkinChoice())');
  try {
    for (const skin of ["midnight", "daylight"]) {
      await page.evaluate('import("/src/lib/skins.ts").then(s => s.applySkinChoice(' + JSON.stringify(skin) + '))');
      await page.until("document.documentElement.dataset.skin === " + JSON.stringify(skin));
      await page.evaluate("Promise.all(document.querySelector('[aria-labelledby=mission-control-title]').getAnimations({subtree:true}).filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})))");
      await capture("project-report-" + skin + ".png");
    }
  } finally {
    await page.evaluate('import("/src/lib/skins.ts").then(s => s.applySkinChoice(' + JSON.stringify(original) + '))');
  }
}
