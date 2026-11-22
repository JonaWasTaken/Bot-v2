/** Approved public npm comparison. Dependencies name logical steps and assignmentId identifies the most recent attempt. */
export type MissionMetric = "dependencies" | "size";
export type MissionState = "planning" | "review" | "running" | "paused" | "verifying" | "partial" | "failed" | "completed" | "cancelled";
export type MissionAction = "start" | "decline" | "pause" | "resume" | "cancel" | "retry" | "revise";
export interface MissionLimits {
  maxSteps: number;
  maxSpecialists: number;
  maxDepth: number;
  concurrency: number;
  retries: number;
  toolCalls: number;
  modelCalls: number;
  timeoutMs: number;
}
export interface ResearchPlan { packages: string[]; metric: MissionMetric }
export interface PackageObservation {
  name: string;
  version: string;
  source: string;
  readAt: number;
  license: string;
  dependencies: number;
  bytes: number | null;
  types: boolean;
}
export interface MissionStepView {
  key: string;
  kind: "source" | "report" | "verify";
  name: string;
  dependsOn: string[];
  botId: string;
  status: "planned" | "blocked" | "queued" | "running" | "executed" | "verified" | "failed" | "cancelled";
  attempts: number;
  toolCalls: number;
  startedAt?: number;
  finishedAt?: number;
  assignmentId?: string;
  error?: string;
  observation?: PackageObservation;
}
export interface MissionView {
  id: string;
  botId: string;
  researcherId: string;
  owner: string;
  name: string;
  objective: string;
  originalObjective: string;
  memoryTopic?: string;
  history: Array<{ version: number; objective: string; plan: ResearchPlan | null; limits: MissionLimits; replacedAt: number }>;
  projectId?: string;
  conversationId?: string;
  /** The owner's delivery of this verified revision to its linked project conversation. */
  conversationReport?: "ready" | "posted" | "removed";
  state: MissionState;
  version: number;
  revision: number;
  limits: MissionLimits;
  plan: ResearchPlan | null;
  steps: MissionStepView[];
  actions: MissionAction[];
  retryKeys: string[];
  createdAt: number;
  updatedAt: number;
  finishedAt?: number;
  issue?: string;
  usage: { toolCalls: number; modelCalls: number; input?: number; output?: number; cachedInput?: number; costUsd?: number };
  artifact?: { name: string; bytes: number; sha256: string; assignmentId: string; verifiedAt: number };
  activity: Array<{ at: number; text: string }>;
}
