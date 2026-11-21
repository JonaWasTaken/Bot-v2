# 30 · Result verification

[Project APEX ledger](../README.md) · Multi-agent collaboration

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Checker brief

**Current state** The checked-handoff fixture measures brief length, byte-preserving attachment delivery and alternative provider selection. Existing case “passes the file the person attached on to the checker, byte for byte, and no other stored file”.

**Sources** [server/host/handoff-files.ts](../../../../server/host/handoff-files.ts) · [server/checked-handoff.e2e.test.ts](../../../../server/checked-handoff.e2e.test.ts) · [server/checker-model.ts](../../../../server/checker-model.ts)

**Dependencies** APEX-01-13

**Risk** A reviewer may judge truncated instructions or a different revision of the work.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/checked-handoff.e2e.test.ts`.

**Manual verification** Open the synthetic checker conversation and compare its brief and attachment hashes with the sender's.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-01 | Reject a checker brief one character above the limit | Add a sentinel at the tail of an oversized fixture brief. | The check never runs and no truncated substitute is accepted. |
| APEX-30-02 | Pass a boundary-length brief intact | Make the last legal characters identify the intended deliverable. | The checker sees the tail marker and exact full length once. |
| APEX-30-03 | Bind a checker to the accepted attachment revision | Change the writer's working copy after dispatching the attached snapshot. | The checker sees the hash at dispatch and no silently updated file. |
| APEX-30-04 | Keep unrelated stored attachments out of review | Send one private fixture file in a past turn and another for this review. | Only the latter appears in the checker input. |
| APEX-30-05 | Mark a same-provider fallback honestly | Request independent checking with only one usable provider. | The result records independence unavailable and counts no independent verdict. |

## Sent work

**Current state** The sent-work row carries file chips and links to the child conversation, source room or lane. Existing case “carries the files passed with the hand-off, for the line's chips”.

**Sources** [server/host/handoff-sent.ts](../../../../server/host/handoff-sent.ts) · [server/host/handoff-sent.test.ts](../../../../server/host/handoff-sent.test.ts) · [src/components/HandoffReply.tsx](../../../../src/components/HandoffReply.tsx)

**Dependencies** APEX-27-11

**Risk** A successful-looking activity line can point to a worker or file that never received the assignment.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/handoff-sent.test.ts`.

**Manual verification** Follow each fixture result chip from the parent and match its destination and artifact.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-06 | Link a direct handoff to its actual child thread | Send to a teammate outside the addressed fixture room. | The activity opens the child's exact thread and identifies direct delivery. |
| APEX-30-07 | Keep all accepted file chips on the sent-work line | Pass three named fixture inputs and open the resulting activity. | Exactly three chips resolve to their original hashes. |
| APEX-30-08 | Preserve room and lane identity in the result trail | Send separate work through a room and a direct lane using the same titles. | Both links open the correct scope and task ID. |
| APEX-30-09 | Keep private child detail out of a shared result preview | Complete a fixture child with an owner-only marker and a shareable summary. | The shared parent line shows the summary and zero private markers. |
| APEX-30-10 | Repair a deleted child link gracefully | Remove a synthetic completed child after its result is delivered. | The parent retains the accepted result and clearly identifies the unavailable destination. |

## Result assertions

**Current state** The evaluator derives pass/fail results from actual snapshot tool calls, order, prompt and handoff structure. Existing case “counts activities and pins a gate answer HTTP status”.

**Sources** [evals/scorers/assertions.ts](../../../../evals/scorers/assertions.ts) · [evals/scorers/assertions.test.ts](../../../../evals/scorers/assertions.test.ts)

**Dependencies** APEX-05-16

**Risk** A narrative of success can satisfy a text check without any accepted deliverable.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/scorers/assertions.test.ts`.

**Manual verification** Compare the frozen fixture assertions with the actual artifact and handoff tree.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-11 | Assert the artifact hash independently of the final reply | Let a scripted child claim it returned the file while supplying different bytes. | The artifact criterion fails despite successful prose. |
| APEX-30-12 | Check that every required child delivered | Supply a valid-looking final answer but omit one of three required child results. | The missing child ID appears as the specific failing condition. |
| APEX-30-13 | Reject a result from the wrong generation | Replace the accepted child's evidence with a previous run's equally named answer. | The scorer refuses it as belonging to a different run. |
| APEX-30-14 | Require a terminal result before parent completion | Present a snapshot with dispatched and working states but no settlement. | Completion fails even if all requested tools appeared. |
| APEX-30-15 | Measure review disagreement separately from artifact correctness | Pair opposing checker opinions with an objectively correct fixture total. | The report records disagreement and the independent total verdict separately. |

## Golden replay

**Current state** Golden replay compares a redacted scenario and its normalized behavior trace against committed baselines. Existing case “carry golden provenance and pass both leak scans”.

**Sources** [evals/golden/run-golden.ts](../../../../evals/golden/run-golden.ts) · [evals/golden/golden.test.ts](../../../../evals/golden/golden.test.ts) · [evals/golden/redact/redact-thread.ts](../../../../evals/golden/redact/redact-thread.ts)

**Dependencies** APEX-05-16

**Risk** A recorded golden can preserve a regression or leak synthetic identities across replay runs.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/golden/golden.test.ts`.

**Manual verification** Inspect the redacted fixture, normalized trace and diff before accepting a baseline.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-16 | Reconstruct a reference handoff from its golden fixture | Replay into two fresh mock worlds with different generated actor IDs. | Both normalized traces match the same committed baseline. |
| APEX-30-17 | Catch a missing specialist step during replay | Remove the specialist's only recorded action from a copied scenario. | The trace diff identifies the missing turn or action. |
| APEX-30-18 | Expose a real result-order change in the golden diff | Reverse a required review and delivery in a controlled snapshot. | The first differing step is reported with both expected and actual order. |
| APEX-30-19 | Verify re-redaction reproduces the committed fixture | Redact the same synthetic sample twice in disposable directories. | Both outputs match the stored fixture byte for byte. |
| APEX-30-20 | Keep baseline updates reviewable | Stage a deliberate golden change with its old trace, new trace and fixture diff. | Each changed outcome is tied to a named scenario and no unrelated trace changes. |
