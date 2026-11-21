import { createHash } from "node:crypto";
import { z } from "zod";
import type { PackageObservation, ResearchPlan } from "../../shared/mission.ts";
import { fetchPublicPage } from "../wait-probes.ts";
import { packageName } from "./plan.ts";

const releaseVersion = z.string().max(100).regex(/^\d+\.\d+\.\d+(?:-[\da-zA-Z.-]+)?(?:\+[\da-zA-Z.-]+)?$/);
const license = z.string().max(100).regex(/^[a-zA-Z0-9().+ -]+$/);
const manifest = z.object({
  name: packageName, version: releaseVersion, license: z.unknown().optional(),
  types: z.string().optional(), typings: z.string().optional(), exports: z.unknown().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
  dist: z.object({ unpackedSize: z.number().int().nonnegative().safe().optional() }),
});
const permissive = new Set(["MIT", "Apache-2.0", "ISC", "BSD-2-Clause", "BSD-3-Clause", "0BSD"]);
export const registrySource = (name: string, version: string) => "https://registry.npmjs.org/" + encodeURIComponent(name) + "/" + encodeURIComponent(version);

function declaresTypes(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== "object" || depth > 7) return false;
  return Object.entries(value).some(([key, entry]) => (key === "types" && typeof entry === "string" && !!entry) || declaresTypes(entry, depth + 1));
}

export async function readPackage(name: string, version: string, signal: AbortSignal, read = fetchPublicPage): Promise<PackageObservation> {
  packageName.parse(name);
  if (version !== "latest") releaseVersion.parse(version);
  const url = registrySource(name, version);
  const response = await read(url, { signal, maxRedirects: 0, maxBytes: 256 * 1024, timeoutMs: 15000 });
  if (!response.ok) throw new Error("The public npm registry did not return a release for " + name + ".");
  const parsed = manifest.safeParse(JSON.parse(response.body.toString("utf8")));
  if (!parsed.success || parsed.data.name !== name || (version !== "latest" && parsed.data.version !== version) || response.url.href !== url) throw new Error("The release did not match the requested package.");
  const item = parsed.data;
  return { name, version: item.version, source: registrySource(name, item.version), readAt: Date.now(),
    license: license.safeParse(item.license).data ?? "unknown",
    dependencies: new Set([...Object.keys(item.dependencies ?? {}), ...Object.keys(item.optionalDependencies ?? {})]).size,
    bytes: item.dist.unpackedSize ?? null, types: Boolean(item.types || item.typings || declaresTypes(item.exports)) };
}

const measure = (item: PackageObservation, plan: ResearchPlan) => plan.metric === "size" ? item.bytes : item.dependencies;
export function comparisonReport(plan: ResearchPlan, observations: PackageObservation[]): string {
  if (observations.length !== plan.packages.length || observations.some((item, i) => item.name !== plan.packages[i]
    || item.source !== registrySource(item.name, item.version))) throw new Error("Some required source observations are missing.");
  const eligible = observations.filter(item => permissive.has(item.license) && item.types && measure(item, plan) !== null)
    .sort((a, b) => measure(a, plan)! - measure(b, plan)!);
  if (!eligible.length) throw new Error("No candidate meets the reviewed license, TypeScript and measurement requirements.");
  const winners = eligible.filter(item => measure(item, plan) === measure(eligible[0]!, plan));
  const criterion = plan.metric === "size" ? "smallest unpacked package" : "fewest direct runtime dependencies";
  const lines = ["# TypeScript package comparison", "", "## Recommendation", "",
    winners.map(item => "**" + item.name + "**").join(" and ") + (winners.length > 1 ? " tie for " : " ranks first for ") + criterion + " among eligible releases.",
    "", "| Package | Version | License | Declares types | Runtime dependencies | Unpacked bytes |", "| --- | --- | --- | --- | ---: | ---: |",
    ...observations.map(item => "| " + [item.name, item.version, item.license, item.types ? "Yes" : "No", item.dependencies, item.bytes ?? "Unknown"].join(" | ") + " |"),
    "", "## Scope", "", "Eligibility requires a declared permissive license (MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause or 0BSD) and bundled type declarations in the manifest. Dependency counts include optional runtime dependencies. Unpacked size describes the published package. API fit, transitive dependencies and application bundle size require separate evaluation.",
    "", "## Registry sources", "", ...observations.map(item => "- [" + item.name + " " + item.version + "](" + item.source + "), retrieved " + new Date(item.readAt).toISOString()), ""];
  return lines.join("\n");
}

export const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
export function verifyReport(bytes: Buffer, expected: string, observations: PackageObservation[]): string {
  for (const item of observations) {
    if (!expected.includes("](" + item.source + ")") || item.source !== registrySource(item.name, item.version)) throw new Error("The report is missing a versioned source.");
  }
  if (!bytes.equals(Buffer.from(expected))) throw new Error("The saved report differs from the comparison of the retrieved releases.");
  return sha256(bytes);
}
