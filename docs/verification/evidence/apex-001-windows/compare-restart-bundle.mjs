import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [bundleDirectory] = process.argv.slice(2);
assert.equal(process.argv.length, 3, "Supply one built dist-server directory.");
const bundle = resolve(bundleDirectory);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bundleSha256 = sha256(readFileSync(join(bundle, "index.js")));
const fixture = pathToFileURL(resolve("scripts/verify-server-recovery.mjs"));
let source = readFileSync(fixture, "utf8").replaceAll("\r\n", "\n");
assert.equal(sha256(source), "d18674aeee474b4df48b84ef6b2232a98b0381d7cd36775e7f251a04d37c4d9d",
  "Run from the recovery fixture checkout at 549933b2a1300bfc9b219c680aed5a344857deb4.");

for (const relative of [
  "../electron/server-supervisor.mjs",
  "../electron/server-boot-probe.mjs",
  "../electron/data-dir-lease.mjs",
  "../server/testing/fake-connected-apps.ts",
  "./testing/recovery-handoff.mjs",
]) {
  source = source.replaceAll(JSON.stringify(relative), JSON.stringify(new URL(relative, fixture).href));
}
source = source
  .replace('new URL("..", import.meta.url)', `new URL("..", ${JSON.stringify(fixture.href)})`)
  .replaceAll("createRequire(import.meta.url)", `createRequire(${JSON.stringify(fixture.href)})`)
  .replace('cpSync(join(root, "dist-server"),', `cpSync(${JSON.stringify(bundle)},`)
  .replace("for (const scenario of scenarios)", 'for (const scenario of ["recover", "in-flight", "continue"])');

const observationStart = source.indexOf("      assert.equal(effectCount(), pendingSend ?");
const observationEnd = source.indexOf("\n    } else {\n      process.kill(initialPid", observationStart);
assert.ok(observationStart >= 0 && observationEnd > observationStart);
source = source.slice(0, observationStart) + `
      const recovered = wait.job.nodes.find(node => node.id === cut.nodes[0].id);
      assert.ok(recovered);
      assert.ok(["settled", "failed"].includes(wait.status));
      assert.equal(wait.target.busy, false);
      const terminalReceipts = (await transcript()).filter(row => row.tool?.terminal && row.tool.ok === false).length;
      finalReceipt = {
        measured: true, scenario, tool: slug, providerPrompts: promptCount(), receiverCalls: effectCount(),
        resultPresentAtCrash: resultSeen, status: wait.status, rootStatus: recovered.status,
        rootOutcome: recovered.outcome, executions: recovered.executions, terminalReceipts,
      };` + source.slice(observationEnd);

const directory = mkdtempSync(join(tmpdir(), "omb-restart-measurement-"));
const entry = join(directory, "measure.mjs");
writeFileSync(entry, source, { flag: "wx" });
try {
  const run = spawnSync(process.execPath, [entry], { encoding: "utf8", windowsHide: true });
  if (run.error) throw run.error;
  process.stderr.write(run.stderr);
  process.stdout.write(run.stdout);
  assert.equal(run.status, 0, "The isolated recovery fixture did not finish.");
  const receipts = run.stdout.trim().split(/\r?\n/).map(line => JSON.parse(line)).filter(row => row.receipt);
  assert.equal(receipts.length, 3);
  for (const { receipt } of receipts) {
    const { events, ...observation } = JSON.parse(readFileSync(receipt, "utf8"));
    assert.ok(observation.measured && events.some(event => event.event === "after-restart"));
    console.log(JSON.stringify({ bundleSha256, ...observation }));
  }
} finally {
  unlinkSync(entry);
  rmdirSync(directory);
}
