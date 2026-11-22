import type { MissionView } from "../../shared/mission.ts";

const plain = (s: string) => s.replaceAll(/[\r\n]+/g, " ").replace(/[\\<>[\]()_*|!#]/g, "\\$&");

export function missionSummary(m: MissionView): string {
  const lines = ["# " + plain(m.name), "", plain(m.objective), "", "State: " + m.state,
    "Plan version: " + m.version, "Mission: " + m.id, "Created: " + new Date(m.createdAt).toISOString(),
    "", "## Steps", "", "| Step | Assigned bot | Status | Attempts | Prerequisites |", "| --- | --- | --- | ---: | --- |"];
  for (const s of m.steps) lines.push("| " + [plain(s.name), plain(s.botId), s.status, s.attempts, s.dependsOn.map(plain).join(", ") || "None"].join(" | ") + " |");
  lines.push("", "## Evidence", "");
  for (const s of m.steps) {
    if (s.observation) lines.push("- [" + s.observation.name + " " + s.observation.version + "](" + s.observation.source + ")");
    if (s.error) lines.push("- " + plain(s.name) + " — " + plain(s.error));
  }
  if (m.artifact) lines.push("- " + m.artifact.name + " (" + m.artifact.bytes + " bytes), SHA-256 " + m.artifact.sha256);
  if (m.issue) lines.push("", plain(m.issue));
  lines.push("", "## Usage", "", "Tool calls attempted: " + m.usage.toolCalls, "Planning calls attempted: " + m.usage.modelCalls);
  if (m.usage.input !== undefined) lines.push("Reported input tokens: " + m.usage.input);
  if (m.usage.output !== undefined) lines.push("Reported output tokens: " + m.usage.output);
  for (const plan of m.history) lines.push("", "Prior plan v" + plan.version + ": " + (plan.plan?.packages.join(", ") ?? "draft"));
  return lines.join("\n") + "\n";
}
