import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: { endpoint: { type: "string" }, model: { type: "string" } } });
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(values.endpoint ?? "") || !values.model) {
  throw new Error("Pass --endpoint http://127.0.0.1:PORT and --model MODEL for a local Ollama server.");
}

const stationPairs = [
  ["Birch", "Cedar"],
  ["Flint", "Reed"],
  ["Jade", "Slate"],
];
const question = "Which personal and team departure terminals are on the travel plan?";
const format = "Use two lines, Personal: NAME and Team: NAME. Use unknown for any missing terminal.";
const cases = [
  { name: "same filename", teamFile: "travel.md", teamReadable: true },
  { name: "distinct filenames", teamFile: "travel-team.md", teamReadable: true },
  { name: "member alone", teamFile: "travel.md", teamReadable: false },
];
const revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const directory = await mkdtemp(join(tmpdir(), "omb-notebook-reader-"));
process.env.OMB_BENCH = "1";
process.env.OMB_DATA_DIR = directory;

try {
  const { buildRecall } = await import(pathToFileURL(resolve("server/recall.ts")).href);
  const { writeMemoryTopic } = await import(pathToFileURL(resolve("server/workspace.ts")).href);
  async function readAnswer(context) {
    const response = await fetch(`${values.endpoint}/api/chat`, {
      method: "POST",
      redirect: "error",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: values.model, think: false, stream: false, options: { temperature: 0, num_predict: 96 },
        messages: [{ role: "user", content: `${context}\n\n${question} ${format}` }],
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!response.ok) throw new Error(`Local reader returned HTTP ${response.status}.`);
    const result = await response.json();
    if (!result.done || typeof result.message?.content !== "string") throw new Error("Local reader did not finish.");
    return result.message.content.trim();
  }
  for (const [index, [personal, team]] of stationPairs.entries()) {
    for (const [kind, exercise] of cases.entries()) {
      const bot = `notebook-reader-${index}-${kind}`;
      const member = `${bot}--member-p_fixture`;
      writeMemoryTopic(member, "travel.md", `- My personal departure terminal is ${personal}.\n`);
      writeMemoryTopic(bot, exercise.teamFile, `- The team departure terminal is ${team}.\n`);
      const recall = buildRecall({
        botId: bot, memoryIds: exercise.teamReadable ? [member, bot] : [member], message: question,
        threadIds: [], label: () => "", author: () => "",
      });
      const context = recall?.text ?? "";
      const answer = await readAnswer(context);
      const expected = `personal: ${personal}\nteam: ${exercise.teamReadable ? team : "unknown"}`;
      const normalized = answer.split(/\r?\n/).map(line => line.trim()).join("\n").toLowerCase();
      console.log(JSON.stringify({
        revision, model: values.model, exercise: exercise.name, personal, team,
        context, answer, correct: normalized === expected.toLowerCase(),
      }));
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
