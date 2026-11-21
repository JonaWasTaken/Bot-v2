# 27 · Dependency ordering

[Project APEX ledger](../README.md) · Multi-agent collaboration

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Dispatch queue

**Current state** The coordinator exposes persisted roots, parked questions and continuations used to determine which work can start. Existing case “reads a root parked on the person's cards back with its cards”.

**Sources** [server/coordinator.ts](../../../../server/coordinator.ts) · [server/coordinator.test.ts](../../../../server/coordinator.test.ts) · [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [server/runtime/store.ts](../../../../server/runtime/store.ts)

**Dependencies** APEX-01-13

**Risk** Starting a dependent task too soon can publish a partial project result.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/coordinator.test.ts`.

**Manual verification** Inspect synthetic task rows and dispatch times in a three-worker desktop conversation.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-27-01 | Release a dependent task only after its input arrives | Stage an outline, review and final-draft sequence with controlled worker gates. | Review starts after outline acceptance and final drafting starts after review. |
| APEX-27-02 | Run independent siblings without serializing them behind one another | Hold sibling A and allow independent B to settle. | B produces its result before A releases. |
| APEX-27-03 | Keep a parked root attached to its pending card | Restart the synthetic coordinator with one unanswered parent question. | The original root and card IDs return together and zero duplicate children launch. |
| APEX-27-04 | Represent a failed prerequisite on its dependent | Fail an input-producing child before it yields a document. | Its dependent records an unavailable input and starts zero provider turns. |
| APEX-27-05 | Restore a partially completed dependency graph | Restart after the first of three child results is accepted. | The finished child stays finished and only outstanding eligible work dispatches. |

## Concurrent handoff inputs

**Current state** Recipient filenames derive from sender and assignment identity. The file handoff path also controls aggregate limits when deliveries overlap.

**Sources** [server/host/handoff-inbox.ts](../../../../server/host/handoff-inbox.ts) · [server/host/handoff-inbox.test.ts](../../../../server/host/handoff-inbox.test.ts) · [server/host/handoff-files.ts](../../../../server/host/handoff-files.ts) · [server/host/handoff-files.test.ts](../../../../server/host/handoff-files.test.ts)

**Dependencies** APEX-23-11

**Risk** Parallel workers can overwrite one another's inputs or charge the same delivery twice.

**Risk level** High

**Automated verification** Deliver overlapping fixture inputs with gated copy completion. Compare recipient paths, bytes and accounting while varying ordering and platform names.

**Manual verification** Open both worker inboxes after the parallel dispatch and follow the parent result chips back to their actual files.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-27-06 | Separate concurrent handoffs with the same output name | Complete two specialists' report.csv handoffs at the same instant with different fixture bytes. | Two assignment-scoped copies retain their own hashes and receipt IDs. |
| APEX-27-07 | Share an immutable prerequisite between parallel branches | Send one accepted snapshot to two workers while its original source changes. | Both workers read the accepted revision and neither reads the producer's later edits. |
| APEX-27-08 | Prevent prefix collisions across simultaneous inbox writes | Have two fixture receiver names sharing a path prefix accept similarly named inputs in parallel. | Each recorded path belongs to its full intended inbox and neither receives the other file. |
| APEX-27-09 | Resolve platform-reserved names under concurrent delivery | Deliver two inputs with device-like names on a Windows fixture. | Both accepted paths are usable, distinct and traceable to the correct original label. |
| APEX-27-10 | Make retried parallel copies idempotent per assignment | Restart between a successful first copy and the second worker's pending copy, then replay both receipts. | Each intended receiver ends with one complete logical input and an accurate byte charge. |

## Working status

**Current state** Handoff status maps stored records to working, waiting and terminal states and suppresses private detail in shared output. Existing case “maps the record's status to claimed, working, waiting, done and failed”.

**Sources** [server/host/handoff-status.ts](../../../../server/host/handoff-status.ts) · [server/host/handoff-status.test.ts](../../../../server/host/handoff-status.test.ts) · [src/components/HandoffStatusChip.tsx](../../../../src/components/HandoffStatusChip.tsx)

**Dependencies** APEX-01-13

**Risk** A waiting parent can appear complete or hide which dependency is outstanding.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/handoff-status.test.ts`.

**Manual verification** Read the fixture's parent and child status lines as each controlled dependency changes.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-27-11 | Show which teammate still owes a dependency | Complete two of three child inputs under one parent. | The view names the remaining child and leaves the parent waiting. |
| APEX-27-12 | Resume a parent when all required children have answered | Deliver the final required answer while an unrelated worker remains busy. | The parent becomes runnable once without waiting for unrelated work. |
| APEX-27-13 | Distinguish waiting on a person from waiting on a bot | Park two fixture tasks for different reasons. | Their status rows use the correct waiting audience and do not expose private question text. |
| APEX-27-14 | Retain a safe failure reason in shared project status | Fail a private child with a synthetic private marker. | Shared status reports failure without the marker and the owner can inspect the original. |
| APEX-27-15 | Order status transitions by accepted generation | Deliver a delayed working update after a terminal child result. | The status remains terminal and the parent counts that result once. |

## Mutual handoffs

**Current state** The tree already refuses a request back to a waiting upstream worker. Existing case “refuses a request back to a bot that is waiting on you, and the same hand-off once it has its answer”.

**Sources** [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [server/crossed-handoffs.e2e.test.ts](../../../../server/crossed-handoffs.e2e.test.ts)

**Dependencies** APEX-01-13

**Risk** A cycle can strand an entire project tree.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/crossed-handoffs.e2e.test.ts`.

**Manual verification** Inspect the fixture's synthetic dependency graph and the direct refusal or valid alternative at each edge.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-27-16 | Reject a two-node return dependency | Make A wait on B then ask B to hand the same work back to A. | The reverse edge is refused and the existing assignment can complete. |
| APEX-27-17 | Identify a three-node wait cycle before dispatch | Build A to B to C and propose C to A. | The final edge is refused with zero extra child turns. |
| APEX-27-18 | Keep an independent fourth worker available after cycle refusal | Add D as an eligible alternative following a refused cycle. | D receives one assignment and returns one accepted result. |
| APEX-27-19 | Distinguish repeated completed work from a new independent request | Reuse the same teammate on a newly identified deliverable after the first settles. | The new request has its own lineage and no prior answer satisfies it automatically. |
| APEX-27-20 | Ensure cycle diagnostics refer to the right root | Construct two fixture graphs sharing worker names and introduce a cycle in one. | Only that root's status and dispatch budget change. |
