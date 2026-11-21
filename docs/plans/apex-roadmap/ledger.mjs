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
const releaseTitles = [
  ["Repository audit", "Architecture", "Build infrastructure", "Storage", "Developer tooling"],
  ["Design system", "Application shell", "Chat experience", "Execution visibility", "Accessibility"],
  ["Models", "Context", "Sessions", "Task routing", "Output verification"],
  ["Persistence", "Formation", "Retrieval", "Correction", "Personalization"],
  ["Execution tools", "MCP", "Research", "Browser", "Workspace capabilities"],
  ["Orchestration", "Specialists", "Parallelism", "Coding", "Independent review"],
  ["Scheduling", "Events", "Durable tasks", "Proactive assistance", "Governance"],
  ["Projects", "Documents", "Artifacts", "Integrations", "Knowledge management"],
  ["Voice", "Multimodal", "Performance", "Efficiency", "Reliability"],
  ["Authorization", "Tool security", "Data protection", "Windows packaging", "Final acceptance"],
].flat();
const programNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const riskLevels = new Set(["Low", "Medium", "High", "Critical"]);
const planningUrl = "https://github.com/JonaWasTaken/Bot-v2/pull/7";
const issueOrPull = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/[1-9]\d*$/;
const statuses = new Set([
  "Not started", "Blocked", "In progress", "Implemented",
  "Verified", "Integrated", "Failed or requires rework",
]);
const fields = [
  "Current state", "Sources", "Dependencies", "Risk", "Risk level", "Automated verification",
  "Manual verification", "Completion evidence", "GitHub", "Status",
];
const metadataFields = new Set([...fields, "Related GitHub", "Evidence GitHub"]);
const pad = (number) => String(number).padStart(2, "0");
const anchor = (heading) => heading.toLowerCase().replace(/[^\w -]/g, "").replaceAll(" ", "-");
const repoPath = (file) => relative(root, file).split(sep).join("/");
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

function githubTracking(id, metadata) {
  const references = [{ type: "planning", url: planningUrl }];
  const tracker = metadata.GitHub;
  for (const [field, type] of [["GitHub", "implementation"], ["Evidence GitHub", "evidence"], ["Related GitHub", "related"]]) {
    const value = metadata[field];
    if (!value || (field === "GitHub" && value === "Unfiled")) continue;
    const links = markdownLinks(value);
    requireThat(links.length && !value.startsWith("Unfiled"), `${id} needs a separate ${type} issue or PR`);
    for (const { target } of links) {
      requireThat(issueOrPull.test(target) && target !== planningUrl, `${id} has an invalid ${type} reference ${target}`);
      requireThat(!references.some((r) => r.type === type && r.url === target), `${id} repeats a ${type} reference`);
      references.push({ type, url: target });
    }
  }
  return {
    implementation_tracker: tracker,
    github_reference: [
      `Planning [APEX ledger PR #7](${planningUrl})`, `Individual implementation tracker — ${tracker}`,
      metadata["Evidence GitHub"] && `Recorded evidence — ${metadata["Evidence GitHub"]}`,
      metadata["Related GitHub"] && `Related work — ${metadata["Related GitHub"]}`,
    ].filter(Boolean).join(" · "),
    github_references: references,
    github_urls: [...new Set(references.map(({ url }) => url))],
  };
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
      requireThat(match && metadataFields.has(match[2]), `Invalid metadata in ${basename(file)}: ${line}`);
      const [, id, field, value] = match;
      if (field === "Risk level") requireThat(riskLevels.has(value.trim()), `Invalid risk level in ${id || group || basename(file)}: ${value}`);
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
    requireThat(riskLevels.has(m["Risk level"]), `${id} needs an explicit risk level`);
    requireThat(!m["Completion evidence"].includes(planningUrl), `${id} cites the umbrella planning PR as completion evidence`);
    if (["In progress", "Implemented", "Verified", "Integrated"].includes(m.Status)) {
      requireThat(!/^Pending\b/i.test(m["Completion evidence"]) && markdownLinks(m["Completion evidence"]).length, `${id} needs recorded completion evidence`);
    }
    const dependencies = m.Dependencies === "None" ? [] : m.Dependencies.split(", ");
    requireThat(new Set(dependencies).size === dependencies.length, `${id} repeats a dependency`);
    return {
      id, source_program: program, source_chapter: number, source_chapter_title: title, scope: group,
      chapter_file: repoPath(file), objective,
      current_state: m["Current state"], source_files: sourceFiles(id, file, m.Sources),
      implementation_plan, dependencies, risk_level: m["Risk level"], risk: m.Risk, acceptance,
      automated_verification: { method: m["Automated verification"], stimulus: implementation_plan, assertion: acceptance },
      manual_verification: { procedure: m["Manual verification"], scenario: implementation_plan, observation: acceptance },
      completion_evidence: m["Completion evidence"],
      evidence_references: markdownLinks(m["Completion evidence"]).map(({ target }) =>
        target.startsWith("https://") ? target : relative(root, resolve(dirname(file), target)).split(sep).join("/")),
      ...githubTracking(id, m), status: m.Status,
    };
  });
}

function mapReleaseChapters(missions, index) {
  const manifest = resolve(home, "release-chapters.md");
  const source = read(manifest);
  checkLinks(manifest, source);
  const indexLinks = new Set(markdownLinks(index).map(({ target }) => target));
  const byId = new Map(missions.map((m) => [m.id, m]));
  const membership = new Map();
  const counts = [];
  let program = -1;
  let chapter = 0;
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      program++;
      requireThat(chapter === program * 5 && program < programNames.length &&
        line === `## Program ${programNumerals[program]} · ${programNames[program]}`, `Unexpected release program: ${line}`);
    } else if (line.startsWith("### ")) {
      chapter++;
      const title = releaseTitles[chapter - 1];
      requireThat(title && line === `### ${pad(chapter)} ${title}` && program === Math.floor((chapter - 1) / 5),
        `Unexpected release chapter: ${line}`);
      requireThat(indexLinks.has(`release-chapters.md#${anchor(line.slice(4))}`), `Unindexed release chapter ${chapter}`);
      counts.push(0);
    } else if (line.startsWith("- ")) {
      const range = line.match(/^- `APEX-(\d\d)-(\d\d)\.\.APEX-(\d\d)-(\d\d)` \[([^\]]+)\]\(([^)]+)\)$/);
      requireThat(chapter && range && range[1] === range[3], `Invalid mission range: ${line}`);
      const [, book, first, , last, label, target] = range;
      const start = Number(first), end = Number(last);
      requireThat(start >= 1 && start <= end && end <= 20, `Invalid bounds: ${line}`);
      const [filename, section] = target.split("#");
      for (let row = start; row <= end; row++) {
        const id = `APEX-${book}-${pad(row)}`;
        const m = byId.get(id);
        requireThat(m && m.chapter_file === repoPath(resolve(home, filename)), `Wrong source book for ${id} in chapter ${chapter}`);
        requireThat(section ? section === anchor(m.scope) && label === m.scope : book === "01" && start === 1 && end === 20,
          `Wrong source section for ${id} in chapter ${chapter}`);
        requireThat(!membership.has(id), `${id} appears in more than one release range`);
        const title = releaseTitles[chapter - 1];
        membership.set(id, {
          program: programNames[program], chapter, chapter_title: title, release_position: ++counts[chapter - 1],
          release_view: `${repoPath(manifest)}#${anchor(pad(chapter) + " " + title)}`,
        });
      }
    }
  }
  requireThat(chapter === 50 && program === 9, "Expected ten release programs and fifty chapters");
  counts.forEach((count, i) => requireThat(count === 20, `Release chapter ${i + 1} has ${count} missions instead of 20`));
  requireThat(membership.size === missions.length, "Release view omits stable IDs");
  return missions.map(({ id, ...source }) => ({ id, ...membership.get(id), ...source }));
}

function loadLedger() {
  const files = readdirSync(chapters).filter((name) => name.endsWith(".md")).sort();
  requireThat(files.length === 50, `Expected 50 chapters, found ${files.length}`);
  const index = read(resolve(home, "README.md"));
  checkLinks(resolve(home, "README.md"), index);
  const titles = roadmapTitles();
  const missions = files.flatMap((name, i) => readChapter(resolve(chapters, name), i + 1, titles[i]));
  const seen = new Set();
  const unique = { objective: new Map(), implementation_plan: new Map(), acceptance: new Map() };
  for (const mission of missions) {
    const { id, dependencies } = mission;
    for (const [field, values] of Object.entries(unique)) {
      const key = normalize(mission[field]);
      requireThat(key && !values.has(key), `Empty or duplicate ${field} in ${id} and ${values.get(key)}`);
      values.set(key, id);
    }
    for (const required of dependencies) requireThat(seen.has(required), `${id} has a missing or non-earlier dependency ${required}`);
    seen.add(id);
  }
  return mapReleaseChapters(missions, index);
}

function main(args) {
  const missions = loadLedger();
  if (!args.length || (args.length === 1 && args[0] === "--check")) {
    const sources = new Set(missions.flatMap((m) => m.source_files));
    console.log(`Validated ${programNames.length} programs, 50 release chapters of 20 missions, ${missions.length} stable IDs and ${sources.size} source files.`);
    console.log("Validated unique objectives, plans and acceptance criteria, dependency order, risk levels and typed GitHub references.");
    for (const status of statuses) console.log(`${status}: ${missions.filter((m) => m.status === status).length}`);
  } else if (args.length === 2 && args[0] === "--chapter") {
    const selection = missions.filter((m) => pad(m.chapter) === args[1]);
    requireThat(selection.length, `Unknown release chapter ${args[1]} (use 01 through 50)`);
    selection.sort((a, b) => a.release_position - b.release_position);
    for (const mission of selection) console.log(JSON.stringify(mission));
  } else if (args.length === 1 && args[0] === "--jsonl") {
    for (const mission of missions) console.log(JSON.stringify(mission));
  } else if (args.length === 2 && args[0] === "--show") {
    const mission = missions.find(({ id }) => id === args[1]);
    requireThat(mission, `Unknown mission ${args[1]}`);
    console.log(JSON.stringify(mission, null, 2));
  } else {
    throw new Error("Usage: node docs/plans/apex-roadmap/ledger.mjs [--check | --show APEX-CC-MM | --chapter NN | --jsonl]");
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
