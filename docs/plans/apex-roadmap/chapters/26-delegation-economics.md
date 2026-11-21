# 26 · Delegation economics

[Project APEX ledger](../README.md) · Multi-agent collaboration

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Specialist profiles and assignment

**Current state** Role templates expose instructions and app recommendations. The offline skill-assignment scenario observes the difference in the next real driver prompt.

**Sources** [src/lib/bot-roles.ts](../../../../src/lib/bot-roles.ts) · [src/lib/bot-roles.test.ts](../../../../src/lib/bot-roles.test.ts) · [src/lib/ready-bots.ts](../../../../src/lib/ready-bots.ts) · [evals/scenarios/skill-assignment-visibility.json](../../../../evals/scenarios/skill-assignment-visibility.json) · [evals/live/scenarios/live-delegation-lane.json](../../../../evals/live/scenarios/live-delegation-lane.json)

**Dependencies** APEX-01-13

**Risk** A team can assign confidential source material to a bot with the wrong role or give work to someone lacking the required skill.

**Risk level** High

**Automated verification** Run the role/template suite and the skill-assignment-visibility scenario, then add two eligible fixture specialists and one ineligible control. Capture selected IDs, prompts and accepted artifact.

**Manual verification** Choose the specialist from the desktop team and inspect its profile, active skills, inputs and returned deliverable before revealing its synthetic display name to the grader.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-01 | Create a specialist from its selected role template | Apply two distinct role templates to fresh bots and inspect the actual first working turn. | Each turn contains its own role instructions and zero instructions unique to the other template. |
| APEX-26-02 | Choose a specialist by required skill rather than display name | Give two equally named bots different assigned skills and request an order audit. | Only the qualified bot receives the audit and its output links back to the originating assignment. |
| APEX-26-03 | Make a newly assigned skill available on the next specialist turn | Assign the fixture audit skill between two otherwise identical briefs. | The first prompt lacks its skill block and the second prompt contains it once. |
| APEX-26-04 | Remove obsolete specialist expertise after reassignment | Move the synthetic skill from writer A to reviewer B and start a fresh task. | Only B advertises the skill and A's previous completion remains attributable to A. |
| APEX-26-05 | Measure whether a named specialist improves its own task class | Compare a role-qualified reviewer with a generalist on three matched pairs of synthetic discrepancies. | Blind scores, specialist-turn counts and per-accepted-artifact cost are reported for both arms. |

## Research costs and evidence yields

**Current state** The research adapter exposes endpoint cost and retries a lost answer with the same idempotency key. The turn usage ledger distinguishes measured usage, estimates and missing costs.

**Sources** [server/usage-ledger.ts](../../../../server/usage-ledger.ts) · [server/usage-ledger.test.ts](../../../../server/usage-ledger.test.ts) · [server/research.ts](../../../../server/research.ts) · [server/research.test.ts](../../../../server/research.test.ts) · [server/x-research-pagination.test.ts](../../../../server/x-research-pagination.test.ts)

**Dependencies** APEX-01-07

**Risk** A comparison may double-charge a retried lookup or treat an unavailable price as zero.

**Risk level** High

**Automated verification** Extend the loopback research transport and ledger fixtures. Reconcile synthetic endpoint charges, unique source counts and any separate model usage for the owning turn.

**Manual verification** Review the fixture research receipts beside the final source list and recompute cost per usable source from the printed amounts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-06 | Attribute a research purchase to its originating conversation | Launch concurrent synthetic queries from two tasks with identical search text. | Each charge is linked only to its own task, turn and endpoint. |
| APEX-26-07 | Keep lost research replies from double-counting spend | Withhold a response after the fixture service records a paid call, then allow its supported retry. | Both attempts share the same idempotency key and one charged purchase appears in the cost summary. |
| APEX-26-08 | Separate endpoint spend from model inference cost | Complete one result collection with a known synthetic provider fee and measured token usage. | The receipt exposes both components with their own units and no double-counted total. |
| APEX-26-09 | Report cost per accepted source during deduplication | Return six posts across two paid pages with three duplicate IDs. | The report counts three distinct sources and divides the recorded charges by three. |
| APEX-26-10 | Keep cost unknown when a research provider omits a price | Return a valid synthetic finding without a usable amount beside a priced control. | The unpaid-or-unpriced state is explicit and the known subtotal excludes the missing price. |

## Fan-out limits

**Current state** The runtime limits total turns per request and consecutive failures with configurable positive whole numbers. Existing case “defaults to 300 turns per request and 5 failures in a row”.

**Sources** [server/runtime/handoff-limits.ts](../../../../server/runtime/handoff-limits.ts) · [server/runtime/handoff-limits.test.ts](../../../../server/runtime/handoff-limits.test.ts)

**Dependencies** APEX-01-13

**Risk** Unbounded fan-out can spend the team's budget without finishing the parent task.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/runtime/handoff-limits.test.ts`.

**Manual verification** Inspect the handoff tree and attempts remaining in a synthetic high-fan-out run.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-11 | Enforce a common request-level turn ceiling | Have two workers repeatedly request further help under a small fixture cap. | Total accepted turns never exceed the configured ceiling. |
| APEX-26-12 | Stop a failing branch at its consecutive failure bound | Return the same synthetic refusal on each worker attempt. | The branch terminates at its configured failure count with one visible reason. |
| APEX-26-13 | Reset failure accounting after meaningful child progress | Interleave a successful accepted result between two failure streaks. | The next streak begins at the documented reset point. |
| APEX-26-14 | Reject invalid fan-out configuration without disabling limits | Try zero, negative, fractional and missing values on fresh fixtures. | Each selects the declared default and the effective limit is displayed. |
| APEX-26-15 | Report which bound ended a costly delegation | Create separate runs exhausting total turns and consecutive failures. | The two outcomes identify different exhausted limits and record their final counts. |

## Independent review traces

**Current state** The trace normalizer records ordered turns and handoffs, while checker selection can return a different provider or no eligible alternative.

**Sources** [evals/golden/trace/behavior-trace.ts](../../../../evals/golden/trace/behavior-trace.ts) · [evals/golden/trace/behavior-trace.test.ts](../../../../evals/golden/trace/behavior-trace.test.ts) · [server/checker-model.ts](../../../../server/checker-model.ts) · [server/checked-handoff.e2e.test.ts](../../../../server/checked-handoff.e2e.test.ts)

**Dependencies** APEX-01-13

**Risk** A review trace can show a reassuring verdict even when the author reviewed its own work or checked an obsolete revision.

**Risk level** High

**Automated verification** Replay a writer/checker fixture and score author identity, provider independence, submitted revision and review verdict as separate assertions. Perturb one at a time.

**Manual verification** Inspect anonymous reviewer outputs first and then compare both actor IDs, provider IDs and the exact artifact hash with the trace.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-16 | Reject an author self-review labeled independent | Return the author's own fixture actor ID on an otherwise correct approving review. | The correctness check can pass while the independent-review criterion fails. |
| APEX-26-17 | Require the reviewer to receive the writer's final version | Deliver revision one to the checker and revision two to the user under the same filename. | The verdict identifies a hash mismatch and supplies no approval for revision two. |
| APEX-26-18 | Preserve multiple independent objections in review order | Have two reviewers identify distinct defects on one frozen draft. | The trace retains both original objections, reviewer IDs and source revision. |
| APEX-26-19 | Detect a review result replayed into a sibling assignment | Inject a valid approval from a different synthetic coding task with a matching title. | The receiving parent rejects it by assignment identity and retains its pending review. |
| APEX-26-20 | Retain a failed checker call in the normalized review trace | Run the same checker twice with matching argument keys, different private values and one failed tool call. Compare the normalized traces. | Both traces name the checker and the sorted argument keys. Only the failed call carries its error flag, and neither private argument value appears. |
