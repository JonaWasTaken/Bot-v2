# 29 · Cancellation and recovery

[Project APEX ledger](../README.md) · Multi-agent collaboration

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Interrupted child

**Current state** The runtime distinguishes explicit cancellation from a provider/client interruption on queued or running work. Existing case “says in words that a turn nobody stopped was cut off, and retries the room request a client abort stopped”.

**Sources** [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [server/cancelled-turn.e2e.test.ts](../../../../server/cancelled-turn.e2e.test.ts) · [server/runtime-coordinator.ts](../../../../server/runtime-coordinator.ts)

**Dependencies** APEX-01-13

**Risk** A transport disconnect can be mistaken for a person's explicit Stop.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cancelled-turn.e2e.test.ts`.

**Manual verification** Interrupt the fixture child at controlled points and inspect parent status, receipts and active processes.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-01 | Distinguish a user stop from an unexpected child disconnect | End two identical workers with Stop and a synthetic disconnect respectively. | Only the disconnected child is marked unexpectedly interrupted. |
| APEX-29-02 | Cancel one branch without cancelling a sibling | Start two assignments under one root then stop the first. | The second completes and returns its original result. |
| APEX-29-03 | Propagate root cancellation to pending descendants | Stop the parent while one child runs and one waits for a worker. | The active child gets one stop and the queued one never starts. |
| APEX-29-04 | Keep an already delivered child result after cancellation | Stop the root after one result is accepted and before final synthesis. | The accepted artifact remains inspectable with a cancelled root outcome. |
| APEX-29-05 | Resolve a stop/result race deterministically | Deliver completion and Stop in each possible order using fixture gates. | Each ordering yields one terminal child state and one parent notification. |

## Resume policy

**Current state** Automatic recovery compares backup engine capabilities with the files and tools needed by interrupted work. Existing case “keeps a compatible local workspace and rejects losing a tool or attachment”.

**Sources** [server/automatic-recovery.ts](../../../../server/automatic-recovery.ts) · [server/automatic-recovery.test.ts](../../../../server/automatic-recovery.test.ts)

**Dependencies** APEX-02-11, APEX-13-11

**Risk** Moving interrupted work to a backup can drop required files or tools.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/automatic-recovery.test.ts`.

**Manual verification** Compare source and backup capabilities against the fixture deliverable after recovery selection.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-06 | Reject a backup missing a required document capability | Interrupt a file-based child and offer a text-only backup. | The backup sees zero turns and the missing capability is identified. |
| APEX-29-07 | Honor configured backup ordering | Offer two equivalent ready backups after the primary fails. | Only the first eligible configured backup starts. |
| APEX-29-08 | Allow an equivalent local workspace on a replacement engine | Give the backup the same fixture workspace and required tools. | The resumed task finds the original input hash and produces one result. |
| APEX-29-09 | Keep a failed backup from looping back to its predecessor | Fail two fixture engines in sequence during one child assignment. | The same assignment never retries either failed engine indefinitely. |
| APEX-29-10 | Report an exhausted backup list to the parent | Make all configured alternatives ineligible for different stated reasons. | The parent receives one blocked outcome with the relevant reasons. |

## Parallel dispatch pacing

**Current state** The scheduler uses different tick intervals for active, parked and idle handoffs and accepts immediate wakeups. The coordinator exposes work waiting on teammates and people.

**Sources** [server/handoff-ticks.ts](../../../../server/handoff-ticks.ts) · [server/handoff-ticks.test.ts](../../../../server/handoff-ticks.test.ts) · [server/coordinator.ts](../../../../server/coordinator.ts) · [server/runtime-coordinator.test.ts](../../../../server/runtime-coordinator.test.ts)

**Dependencies** APEX-01-13

**Risk** Repeated scheduler kicks can start parallel work twice or leave eligible siblings waiting behind a parked branch.

**Risk level** High

**Automated verification** Drive multiple workers from a common fake clock. Record tick count, eligible task IDs, dispatch times and assignment generations alongside each tick transition.

**Manual verification** Open the fixture project tree while one worker is parked and another becomes eligible. Inspect both task IDs and the observed dispatch timing.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-11 | Dispatch two independent ready siblings in the same scheduling window | Release two synthetic prerequisites simultaneously while a third sibling stays parked. | Both eligible siblings begin within one active tick and the parked sibling issues zero calls. |
| APEX-29-12 | Coalesce parallel completion wakeups | Settle 20 children in one fake-clock turn while their parent is parked. | One immediate processing batch considers all 20 completions and resumes the parent once. |
| APEX-29-13 | Keep an idle tree from slowing an active peer | Put one project into hourly idle ticks then queue new work in another project. | The new project starts within its active allowance without waiting for the old idle timer. |
| APEX-29-14 | Retain runnable siblings after one scheduler callback throws | Throw during one child's bookkeeping while two unrelated tasks are ready. | Subsequent ticks start both eligible tasks once and report which callback failed. |
| APEX-29-15 | Measure fairness across unequal parallel branches | Hold ten long workers and inject one short eligible assignment on a separate free worker. | Its queued-to-start time is recorded and it starts before any held worker releases. |

## Parallel work across suspend and resume

**Current state** The wake fixture advances its synthetic clock after suspension and observes queued work among thirteen bots. The handoff tree supplies distinct root and worker IDs.

**Sources** [server/handoff-ticks.ts](../../../../server/handoff-ticks.ts) · [server/handoff-wake.e2e.test.ts](../../../../server/handoff-wake.e2e.test.ts) · [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [evals/runners/coordination-world.ts](../../../../evals/runners/coordination-world.ts)

**Dependencies** APEX-01-13

**Risk** Resuming several assignments together can duplicate a completed input, drop a wait or incorrectly serialize unrelated projects.

**Risk level** High

**Automated verification** Expand the wake e2e with two roots and gated siblings. Freeze each root's assignment tree and record concurrency intervals, completions and resumed parent count.

**Manual verification** Inspect the fixture team after waking it, checking active intervals for parallel work and accepted inputs for each parent.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-16 | Resume independent projects concurrently after simulated sleep | Suspend two roots with ready work on distinct available workers and advance the clock nine hours. | Their run intervals overlap and each has one start per ready child. |
| APEX-29-17 | Hold a fan-in parent until its final required worker finishes | Suspend with two of three parallel inputs accepted and release the last one only after wake. | The parent starts once after input three and preserves the original first two hashes. |
| APEX-29-18 | Exclude already completed branches from resume dispatch | Finish one sibling before sleeping while its neighbor still runs. | Wake adds zero turns for the completed sibling and does not erase the other worker's active assignment. |
| APEX-29-19 | Partition results when two resumed roots share a worker | Give the shared worker similarly named assignments from two projects. | Each accepted result links to the correct project and neither parent consumes the other's input. |
| APEX-29-20 | Quantify dispatch lag under parallel wake load | Compare 1, 12 and 50 ready teammates under the same fixture clock and per-worker budget. | Each load level reports median and worst eligible dispatch lag plus zero duplicate assignments. |
