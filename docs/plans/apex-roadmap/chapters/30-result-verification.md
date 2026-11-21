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

**Risk level** High

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

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/handoff-sent.test.ts`.

**Manual verification** Follow each fixture result chip from the parent and match its destination and artifact.

**APEX-30-09 Related GitHub** [Fork PR #8 audience checks for waiting chips](https://github.com/JonaWasTaken/Bot-v2/pull/8)

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-06 | Link a direct handoff to its actual child thread | Send to a teammate outside the addressed fixture room. | The activity opens the child's exact thread and identifies direct delivery. |
| APEX-30-07 | Keep all accepted file chips on the sent-work line | Pass three named fixture inputs and open the resulting activity. | Exactly three chips resolve to their original hashes. |
| APEX-30-08 | Preserve room and lane identity in the result trail | Send separate work through a room and a direct lane using the same titles. | Both links open the correct scope and task ID. |
| APEX-30-09 | Keep private child detail out of a shared result preview | Complete a fixture child with an owner-only marker and a shareable summary. | The shared parent line shows the summary and zero private markers. |
| APEX-30-10 | Repair a deleted child link gracefully | Remove a synthetic completed child after its result is delivered. | The parent retains the accepted result and clearly identifies the unavailable destination. |

## Independent artifact verdicts

**Current state** Snapshot scoring can assert actual calls, turn order and stored evidence. The checked-handoff fixture supplies the independent checker with the selected brief and artifact.

**Sources** [evals/scorers/assertions.ts](../../../../evals/scorers/assertions.ts) · [evals/scorers/assertions.test.ts](../../../../evals/scorers/assertions.test.ts) · [server/checked-handoff.e2e.test.ts](../../../../server/checked-handoff.e2e.test.ts) · [server/checker-model.ts](../../../../server/checker-model.ts)

**Dependencies** APEX-05-16

**Risk** An independent reviewer can approve persuasive prose without validating the delivered artifact itself.

**Risk level** High

**Automated verification** Cross a scripted author's claim with a checker that has the frozen artifact, expected values and a separate actor ID. Vary artifact correctness and verdict independently.

**Manual verification** Blind-review the synthetic deliverable and compare the checker's cited bytes, measurements and conclusion with the review rubric.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-11 | Make an objectively wrong artifact fail independent review | Have a writer claim the expected output hash but attach different bytes. | The checker names the observed hash mismatch and declines approval despite the claim. |
| APEX-30-12 | Account for every required reviewer finding | Seed three bounded errors and supply a review that identifies only two. | The review scorer reports two detected errors and the specific missed fixture issue. |
| APEX-30-13 | Require a checker verdict from the same assignment revision | Attach a positive verdict for an earlier, correct revision while the latest artifact contains a known defect. | The current submission stays unaccepted until its own revision has a verdict. |
| APEX-30-14 | Keep a reviewer timeout distinct from a failed artifact | Withhold the checker result for a known-valid fixture artifact. | The report records review unavailable and issues neither a pass nor a content-failure verdict. |
| APEX-30-15 | Grade reviewer disagreement separately from objective correctness | Give two eligible reviewers opposing recommendations on an artifact with a deterministic total. | The report shows the independently computed total, both verdicts, and the disagreement without treating majority opinion as arithmetic proof. |

## Coding evaluation and reproducible tests

**Current state** Golden replays compare deterministic traces, and the loopback tool fixture observes a real file effect. These provide seams for judging a coding task by its patch, test and changed behavior.

**Sources** [evals/golden/run-golden.ts](../../../../evals/golden/run-golden.ts) · [evals/golden/golden.test.ts](../../../../evals/golden/golden.test.ts) · [evals/golden/trace/behavior-trace.ts](../../../../evals/golden/trace/behavior-trace.ts) · [server/checkpoints.ts](../../../../server/checkpoints.ts) · [server/openai-tools.e2e.test.ts](../../../../server/openai-tools.e2e.test.ts)

**Dependencies** APEX-05-16

**Risk** A coding evaluator can accept a passing transcript despite incorrect code, skipped tests or a mismatched worktree.

**Risk level** High

**Automated verification** Extend the offline fixture with a tiny two-function package, a failing regression and an inert developer tool that runs its test command. Freeze tree hashes, exits and assertion counts for scoring.

**Manual verification** Inspect the proposed source diff, apply it to a fresh copy of the tiny package and rerun the documented regression independently of the model transcript.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-30-16 | Require a reproducible red-to-green coding result | Seed a function with a deterministic off-by-one error and a boundary test. | The original source fails, the patch passes, and both exit codes point to the same test and named fixture revision. |
| APEX-30-17 | Catch a patch that removes its own failing test | Have a scripted worker omit the boundary assertion while claiming a fix. | The grader detects the changed test inventory and denies credit even with a zero exit code. |
| APEX-30-18 | Detect a skipped required test in a coding receipt | Mark the only required case skipped in a copied fixture result. | The evaluator records zero exercised required assertions and withholds a pass. |
| APEX-30-19 | Separate a lint-only edit from the requested behavior change | Offer one formatting-only patch and one functional patch against the same regression. | Only the functional patch passes the behavioral oracle and both retain their exact diffs. |
| APEX-30-20 | Replay an accepted patch outside the original worker checkout | Apply the recorded patch and test command to two newly seeded fixture directories. | Their changed path sets, resulting tree hashes and required test outcomes agree. |
