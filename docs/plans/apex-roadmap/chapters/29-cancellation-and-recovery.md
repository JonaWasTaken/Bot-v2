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

**Dependencies** APEX-02-16

**Risk** Moving interrupted work to a backup can drop required files or tools.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/automatic-recovery.test.ts`.

**Manual verification** Compare source and backup capabilities against the fixture deliverable after recovery selection.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-06 | Reject a backup missing a required document capability | Interrupt a file-based child and offer a text-only backup. | The backup sees zero turns and the missing capability is identified. |
| APEX-29-07 | Honor configured backup ordering | Offer two equivalent ready backups after the primary fails. | Only the first eligible configured backup starts. |
| APEX-29-08 | Allow an equivalent local workspace on a replacement engine | Give the backup the same fixture workspace and required tools. | The resumed task finds the original input hash and produces one result. |
| APEX-29-09 | Keep a failed backup from looping back to its predecessor | Fail two fixture engines in sequence during one child assignment. | The same assignment never retries either failed engine indefinitely. |
| APEX-29-10 | Report an exhausted backup list to the parent | Make all configured alternatives ineligible for different stated reasons. | The parent receives one blocked outcome with the relevant reasons. |

## Delivery ticks

**Current state** Handoff processing changes tick rate as work moves, parks or becomes idle and accepts an immediate wake signal. Existing case “ticks every 250 ms only while work is moving, rarely while it is parked, and hourly with none”.

**Sources** [server/handoff-ticks.ts](../../../../server/handoff-ticks.ts) · [server/handoff-ticks.test.ts](../../../../server/handoff-ticks.test.ts) · [server/handoff-wake.e2e.test.ts](../../../../server/handoff-wake.e2e.test.ts)

**Dependencies** APEX-01-13

**Risk** A stale scheduler timer can either spin continuously or miss a ready child.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/handoff-ticks.test.ts`.

**Manual verification** Inspect fake-clock tick timestamps beside the fixture's active, parked and empty assignment counts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-11 | Use fast ticks only while handoff work moves | Switch a fixture from active to parked to empty. | Measured intervals match all three configured pacing classes. |
| APEX-29-12 | Wake idle handoff processing on a new write | Add an assignment just after an empty-state tick. | The first processing attempt occurs before the normal next idle tick. |
| APEX-29-13 | Continue after one scheduler callback throws | Throw inside a single controlled tick and then add eligible work. | Later ticks still process the work and the first fault is observable. |
| APEX-29-14 | Coalesce simultaneous kicks during wake | Release 20 ready notifications in the same fake-clock turn. | At most one immediate processing batch starts and every eligible assignment is considered. |
| APEX-29-15 | Stop scheduler work on teardown | Dispose the fixture tick controller with one delayed callback pending. | No further tick or assignment mutation occurs after disposal. |

## Wake parent

**Current state** The wake fixture advances the clock after suspension and times queued dispatch among thirteen synthetic bots.

**Sources** [server/handoff-ticks.ts](../../../../server/handoff-ticks.ts) · [server/handoff-wake.e2e.test.ts](../../../../server/handoff-wake.e2e.test.ts)

**Dependencies** APEX-01-13

**Risk** Sleep/resume can delay ready workers or redeliver inputs to a completed parent.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/handoff-wake.e2e.test.ts`.

**Manual verification** Wake a suspended fixture with several synthetic teammates and inspect the post-wake event timeline.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-29-16 | Dispatch new work promptly after a simulated overnight sleep | Advance the fixture clock nine hours then add one assignment. | One child starts within the documented busy tick allowance. |
| APEX-29-17 | Retain a waiting parent across machine sleep | Suspend after dispatch and release the child's result on wake. | One parent resumes with the original child result. |
| APEX-29-18 | Avoid replaying assignments settled before sleep | Complete a child before clock suspension then wake the scheduler. | No new provider turn starts for that completed assignment. |
| APEX-29-19 | Keep unrelated busy work alive through wake | Hold a second project open while the first wakes a pending child. | Only the target child gains a new dispatch and the sibling retains its turn. |
| APEX-29-20 | Measure wake lag as team size grows | Repeat with 1, 12 and 50 disposable teammates under the same clock. | Each size reports dispatch lag, eligibility count and duplicate-start count. |
