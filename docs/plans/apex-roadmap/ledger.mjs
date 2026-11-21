import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const home = dirname(fileURLToPath(import.meta.url));
const chapters = resolve(home, "chapters");
const root = resolve(home, "../../..");
const programNames = [
  "Architecture and infrastructure",
  "Desktop experience",
  "Core intelligence",
  "Advanced memory",
  "Tools and computer interaction",
  "Multi-agent collaboration",
  "Autonomous execution",
  "Projects and productivity",
  "Multimodal, performance and reliability",
  "Security, packaging and release",
];
const statuses = new Set([
  "Not started", "Blocked", "In progress", "Implemented",
  "Verified", "Integrated", "Failed or requires rework",
]);
const fields = [
  "Current state", "Sources", "Dependencies", "Risk", "Automated verification",
  "Manual verification", "Completion evidence", "GitHub", "Status",
];
const pad = (number) => String(number).padStart(2, "0");
const normalize = (value) => value.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const read = (path) => readFileSync(path, "utf8");
const requireThat = (condition, message) => {
  if (!condition) throw new Error(message);
};

function markdownLinks(line) {
  return Array.from(line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g), ([, label, target]) => ({ label, target }));
}

function checkLinks(file, source) {
  for (const { target } of markdownLinks(source)) {
    if (target.startsWith("https://")) continue;
    const absolute = resolve(dirname(file), target.split("#")[0]);
    const local = relative(root, absolute);
    requireThat(local && !local.startsWith(".." + sep) && existsSync(absolute) && statSync(absolute).isFile(),
      `${basename(file)} has an invalid local link to ${target}`);
  }
}

function sourceFiles(id, file, line) {
  const links = markdownLinks(line);
  requireThat(links.length >= 1, `${id} needs a source file`);
  for (const { label, target } of links) {
    const actual = relative(root, resolve(dirname(file), target)).split(sep).join("/");
    requireThat(label === actual && !label.startsWith("enterprise/") && !label.startsWith("docs/plans/apex-roadmap/"),
      `${id} needs a repository-relative label and an in-scope source for ${target}`);
  }
  return links.map(({ label }) => label);
}

function roadmapTitles() {
  const sprint = read(resolve(home, "../2026-11-21-first-cycle.md"));
  const titles = [];
  for (const program of programNames) {
    const prefix = `| ${program} | `;
    const row = sprint.split(/\r?\n/).find((line) => line.startsWith(prefix));
    requireThat(row, `Missing sprint program ${program}`);
    const names = row.slice(prefix.length).replace(/\s*\|$/, "").split("; ");
    requireThat(names.length === 5, `Expected five sprint titles in ${program}`);
    titles.push(...names);
  }
  return titles;
}

function readChapter(file, number, sprintTitle) {
  const source = read(file);
  checkLinks(file, source);
  const lines = source.split(/\r?\n/);
  const heading = lines[0].match(/^# (\d\d) · (.+)$/);
  const program = programNames[Math.floor((number - 1) / 5)];
  requireThat(heading && heading[1] === pad(number) && basename(file).startsWith(pad(number) + "-"), `Unexpected chapter number in ${file}`);
  const title = heading[2];
  requireThat(normalize(title) === normalize(sprintTitle.replace("HTTP/SSE", "HTTP and SSE")), `Unexpected sprint title in ${file}`);
  requireThat(lines.includes(`[Project APEX ledger](../README.md) · ${program}`), `Incorrect program in ${file}`);
  const defaults = {};
  const overrides = new Map();
  const rows = [];
  let group = "";
  let scope = {};
  for (const line of lines) {
    if (line.startsWith("## ")) {
      group = line.slice(3).trim();
      scope = {};
    } else if (line.startsWith("**")) {
      const match = line.match(/^\*\*(?:(APEX-\d\d-\d\d) )?([^*]+)\*\* (\S.*)$/);
      requireThat(match && fields.includes(match[2]), `Invalid metadata in ${basename(file)}: ${line}`);
      const [, id, field, value] = match;
      let values = group ? scope : defaults;
      if (id) {
        if (!overrides.has(id)) overrides.set(id, {});
        values = overrides.get(id);
      }
      requireThat(!Object.hasOwn(values, field), `Duplicate ${field} in ${id || group || file}`);
      values[field] = value.trim();
    } else if (line.startsWith("|") && !line.startsWith("| ID |") && !line.startsWith("| ---")) {
      const cells = line.split("|").map((cell) => cell.trim());
      requireThat(cells.length === 6 && !cells[0] && !cells.at(-1) && cells.slice(1, -1).every(Boolean) && group, `Invalid mission row in ${file}`);
      const [, id, objective, implementation_plan, acceptance] = cells;
      rows.push({ id, objective, implementation_plan, acceptance, group, metadata: { ...defaults, ...scope } });
    }
  }
  requireThat(rows.length === 20, `Expected 20 missions in ${file}, found ${rows.length}`);
  for (const id of overrides.keys()) requireThat(rows.some((row) => row.id === id), `Unknown metadata override ${id}`);
  return rows.map(({ id, objective, implementation_plan, acceptance, group, metadata }, i) => {
    requireThat(id === `APEX-${pad(number)}-${pad(i + 1)}`, `Unexpected or repeated mission ID ${id} in ${file}`);
    const m = { ...metadata, ...overrides.get(id) };
    for (const field of fields) requireThat(m[field]?.trim(), `${id} lacks ${field}`);
    requireThat(statuses.has(m.Status), `${id} has an unknown status ${m.Status}`);
    const github = markdownLinks(m.GitHub).map(({ target }) => target);
    requireThat((github.length || /^Unfiled\b/.test(m.GitHub)) &&
      github.every((url) => /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/[1-9]\d*$/.test(url)), `${id} needs a GitHub issue/PR reference or Unfiled`);
    if (["Implemented", "Verified", "Integrated"].includes(m.Status)) {
      requireThat(!/^Pending\b/i.test(m["Completion evidence"]) && markdownLinks(m["Completion evidence"]).length, `${id} needs recorded completion evidence`);
    }
    const dependencies = m.Dependencies === "None" ? [] : m.Dependencies.split(", ");
    requireThat(new Set(dependencies).size === dependencies.length, `${id} repeats a dependency`);
    return {
      id, program, chapter: number, chapter_title: title, scope: group,
      chapter_file: relative(root, file).split(sep).join("/"), objective,
      current_state: m["Current state"], source_files: sourceFiles(id, file, m.Sources),
      implementation_plan, dependencies, risk: m.Risk, acceptance,
      automated_verification: { method: m["Automated verification"], stimulus: implementation_plan, assertion: acceptance },
      manual_verification: { procedure: m["Manual verification"], scenario: implementation_plan, observation: acceptance },
      completion_evidence: m["Completion evidence"],
      evidence_references: markdownLinks(m["Completion evidence"]).map(({ target }) =>
        target.startsWith("https://") ? target : relative(root, resolve(dirname(file), target)).split(sep).join("/")),
      github_reference: m.GitHub, github_urls: github, status: m.Status,
    };
  });
}

function loadLedger() {
  const files = readdirSync(chapters).filter((name) => name.endsWith(".md")).sort();
  requireThat(files.length === 50, `Expected 50 chapters, found ${files.length}`);
  const index = read(resolve(home, "README.md"));
  checkLinks(resolve(home, "README.md"), index);
  const indexed = markdownLinks(index).map(({ target }) => target);
  const titles = roadmapTitles();
  const missions = files.flatMap((name, i) => {
    requireThat(indexed.includes("chapters/" + name), `Unindexed chapter ${name}`);
    return readChapter(resolve(chapters, name), i + 1, titles[i]);
  });
  const seen = new Set();
  const objectives = new Map();
  for (const { id, objective, dependencies } of missions) {
    const key = normalize(objective);
    requireThat(!objectives.has(key), `Duplicate objective in ${id} and ${objectives.get(key)}`);
    objectives.set(key, id);
    for (const required of dependencies) requireThat(seen.has(required), `${id} has a missing or non-earlier dependency ${required}`);
    seen.add(id);
  }
  return missions;
}

function main(args) {
  const missions = loadLedger();
  if (!args.length || (args.length === 1 && args[0] === "--check")) {
    const sources = new Set(missions.flatMap((m) => m.source_files));
    console.log(`Validated ${programNames.length} programs, 50 chapters, ${missions.length} ordered IDs and unique objectives, ${sources.size} source files.`);
    for (const status of statuses) console.log(`${status}: ${missions.filter((m) => m.status === status).length}`);
  } else if (args.length === 1 && args[0] === "--jsonl") {
    for (const mission of missions) console.log(JSON.stringify(mission));
  } else if (args.length === 2 && args[0] === "--show") {
    const mission = missions.find(({ id }) => id === args[1]);
    requireThat(mission, `Unknown mission ${args[1]}`);
    console.log(JSON.stringify(mission, null, 2));
  } else {
    throw new Error("Usage: node docs/plans/apex-roadmap/ledger.mjs [--check | --show APEX-CC-MM | --jsonl]");
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
