import { z } from "zod";
import type { MissionLimits, ResearchPlan } from "../../shared/mission.ts";

export const packageName = z.string().min(1).max(128).regex(/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/);
export const researchPlan = z.strictObject({
  packages: z.array(packageName).min(1).max(8).refine(names => new Set(names).size === names.length),
  metric: z.enum(["dependencies", "size"]),
});
export const limitsSchema = z.strictObject({
  maxSteps: z.number().int().min(3).max(10), maxDepth: z.number().int().min(1).max(3),
  concurrency: z.number().int().min(1).max(4), retries: z.number().int().min(0).max(3),
  toolCalls: z.number().int().min(1).max(50), modelCalls: z.number().int().min(0).max(3),
  timeoutMs: z.number().int().min(1000).max(120000),
});
export const defaultLimits: MissionLimits = { maxSteps: 8, maxDepth: 3, concurrency: 3, retries: 1, toolCalls: 12, modelCalls: 1, timeoutMs: 60000 };
export const missionSchema = z.strictObject({
  owner: z.literal("workspace-owner"), creationHash: z.string().length(64), name: z.string().max(100), researcherId: z.string().min(1),
  projectId: z.string().optional(), limits: limitsSchema, plan: researchPlan.nullable(),
  phase: z.enum(["draft", "review", "active", "paused", "blocked"]),
  revision: z.number().int().positive(), version: z.number().int().positive().max(5),
  artifactId: z.uuid(), modelCalls: z.number().int().nonnegative(),
  issue: z.string().max(300).optional(), retryKey: z.string().optional(),
});
export type MissionRecord = z.infer<typeof missionSchema>;
export interface PlannedStep { key: string; kind: "source" | "report" | "verify"; name: string; dependsOn: string[] }

export function planSteps(plan: ResearchPlan, version: number): PlannedStep[] {
  const sources: PlannedStep[] = plan.packages.map(name => ({ key: "npm:" + name, kind: "source", name, dependsOn: [] }));
  const report = { key: "report:" + version, kind: "report" as const, name: "report.md", dependsOn: sources.map(step => step.key) };
  return [...sources, report, { key: "verify:" + version, kind: "verify", name: "report.md", dependsOn: [report.key] }];
}

export function validateDependencies(steps: PlannedStep[], limits: Pick<MissionLimits, "maxSteps" | "maxDepth">): void {
  const byKey = new Map(steps.map(step => [step.key, step]));
  if (byKey.size !== steps.length || !steps.length || steps.length > limits.maxSteps) throw Object.assign(new Error("The plan exceeds its step limit or repeats a step."), { status: 400 });
  const depths = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (key: string): number => {
    const known = depths.get(key);
    if (known !== undefined) return known;
    const step = byKey.get(key);
    if (!step || visiting.has(key)) throw new Error("The plan contains a missing or circular dependency.");
    visiting.add(key);
    const value = 1 + Math.max(0, ...step.dependsOn.map(depth));
    visiting.delete(key);
    depths.set(key, value);
    return value;
  };
  if (steps.some(step => depth(step.key) > limits.maxDepth)) throw Object.assign(new Error("The plan exceeds its dependency depth limit."), { status: 400 });
}

export function checkedPlan(raw: unknown, limits: MissionLimits): ResearchPlan {
  const parsed = researchPlan.safeParse(raw);
  if (!parsed.success) throw Object.assign(new Error("Choose distinct public npm package names and a supported comparison criterion."), { status: 400 });
  validateDependencies(planSteps(parsed.data, 1), limits);
  return parsed.data;
}

export function plannerPrompt(objective: string, limits: MissionLimits): string {
  return [
    "Plan a public npm package comparison for a TypeScript application. Return only a JSON object.",
    'Example output: {"packages":["zod","valibot","superstruct"],"metric":"dependencies"}. Use the names specified in the objective when supplied. For unpacked size use "size". Use public package names, never URLs.',
    "Choose the smallest useful shortlist (usually three, at most " + (limits.maxSteps - 2) + "). Compare direct runtime dependency count or unpacked size.",
    "Choose candidates suited to the stated purpose, with bundled TypeScript declarations and permissive licenses. The harness verifies registry metadata.",
    "If this objective cannot be answered by this kind of comparison, return {}. No actions are authorized.",
    "Objective: " + JSON.stringify(objective),
  ].join("\n");
}

export function parsePlannerReply(text: string, limits: MissionLimits): ResearchPlan {
  if (text.length > 2000) throw new Error("Planner output was too large.");
  const fenced = /^\x60{3}(?:json)?\s*([\s\S]*?)\s*\x60{3}$/i.exec(text.trim());
  return checkedPlan(JSON.parse(fenced?.[1] ?? text), limits);
}
