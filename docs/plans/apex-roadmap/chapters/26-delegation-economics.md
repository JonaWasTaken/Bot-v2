# 26 · Delegation economics

[Project APEX ledger](../README.md) · Multi-agent collaboration

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Delegation trial

**Current state** The existing live lane explicitly asks for delegation. It supplies the baseline for an optional-team comparison.

**Sources** [evals/live/live-suite.ts](../../../../evals/live/live-suite.ts) · [evals/live/scenarios/live-delegation-lane.json](../../../../evals/live/scenarios/live-delegation-lane.json) · [evals/live/config.json](../../../../evals/live/config.json)

**Dependencies** APEX-15-16

**Risk** A forced delegation benchmark cannot show whether choosing a teammate helps.

**Automated verification** Clone the delegation scenario into the two experimental arms in a disposable eval checkout. Grade frozen transcripts offline. Run model trials only with the specified approved fixture provider.

**Manual verification** Blind-grade the solo and optional-team fixture artifacts before revealing the run labels.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-01 | Locate the delegation crossover as dependency depth grows | Run the same synthetic deliverable with one, two and four dependent revisions in matched solo and optional-team arms. | Each depth has at least three paired trials, blind artifact scores, actual child counts and cost per accepted deliverable or an explicit zero denominator. |
| APEX-26-02 | Separate explicit delegation compliance from optional routing | Compare an otherwise identical prompt with and without a request for a teammate. | Both arms report who dispatched, who answered and how many artifacts passed. |
| APEX-26-03 | Hold tool and token budgets constant between arms | Cap the total across all actors and log each allowance. | Every comparison pair records equal allocated budgets or an explicit exclusion. |
| APEX-26-04 | Test whether independent checking improves a flawed draft | Seed a synthetic subtotal error for the writer and a separately grounded checker. | The blind grader records correction rate and each unnecessary rewrite per arm. |
| APEX-26-05 | Identify tasks where coordination costs more than it returns | Add a one-step lookup control alongside a multi-source reconciliation task. | For each task the report gives incremental accepted artifacts, tokens and wall time. |

## Usage ledger

**Current state** The usage ledger stores per-turn rows, distinguishes estimates from measured costs and reads monthly files. Existing case “appends one private row per turn into the month's file and reads it back in order”.

**Sources** [server/usage-ledger.ts](../../../../server/usage-ledger.ts) · [server/usage-ledger.test.ts](../../../../server/usage-ledger.test.ts)

**Dependencies** APEX-15-04

**Risk** Missing child usage can make a team appear cheaper than the solo route.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/usage-ledger.test.ts`.

**Manual verification** Recalculate one paired run from the fixture's ledger rows grouped by root and child turn.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-06 | Attribute child usage to its root deliverable | Run two concurrent fixture projects with the same specialist. | Their child token totals reconcile separately to their original roots. |
| APEX-26-07 | Include cancelled child cost | Cancel a child after its first usage report but before the artifact arrives. | Its metered tokens appear once and its accepted-output count is zero. |
| APEX-26-08 | Keep estimates distinct from priced work | Mix one unpriced local turn and one synthetic priced record. | The report has separate unpriced, estimated and measured fields. |
| APEX-26-09 | Deduplicate cumulative usage callbacks for a child | Deliver repeated identical final counters for one turn. | The root total increases once by the actual counted amount. |
| APEX-26-10 | Account for a turn crossing a month boundary | Dispatch before midnight on month end and settle the child afterward. | A report for the whole root includes both ledger periods without duplicates. |

## Fan-out limits

**Current state** The runtime limits total turns per request and consecutive failures with configurable positive whole numbers. Existing case “defaults to 300 turns per request and 5 failures in a row”.

**Sources** [server/runtime/handoff-limits.ts](../../../../server/runtime/handoff-limits.ts) · [server/runtime/handoff-limits.test.ts](../../../../server/runtime/handoff-limits.test.ts)

**Dependencies** APEX-01-13

**Risk** Unbounded fan-out can spend the team's budget without finishing the parent task.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/runtime/handoff-limits.test.ts`.

**Manual verification** Inspect the handoff tree and attempts remaining in a synthetic high-fan-out run.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-11 | Enforce a common request-level turn ceiling | Have two workers repeatedly request further help under a small fixture cap. | Total accepted turns never exceed the configured ceiling. |
| APEX-26-12 | Stop a failing branch at its consecutive failure bound | Return the same synthetic refusal on each worker attempt. | The branch terminates at its configured failure count with one visible reason. |
| APEX-26-13 | Reset failure accounting after meaningful child progress | Interleave a successful accepted result between two failure streaks. | The next streak begins at the documented reset point. |
| APEX-26-14 | Reject invalid fan-out configuration without disabling limits | Try zero, negative, fractional and missing values on fresh fixtures. | Each selects the declared default and the effective limit is displayed. |
| APEX-26-15 | Report which bound ended a costly delegation | Create separate runs exhausting total turns and consecutive failures. | The two outcomes identify different exhausted limits and record their final counts. |

## Trace scoring

**Current state** Golden behavior traces normalize argument keys, sends and handoffs before comparison. Existing case “normalizes turns to sorted argument keys and stable handoffs/sends”.

**Sources** [evals/golden/trace/behavior-trace.ts](../../../../evals/golden/trace/behavior-trace.ts) · [evals/golden/trace/behavior-trace.test.ts](../../../../evals/golden/trace/behavior-trace.test.ts) · [evals/golden/trace/diff-trace.ts](../../../../evals/golden/trace/diff-trace.ts) · [server/handoff-ticks.ts](../../../../server/handoff-ticks.ts)

**Dependencies** APEX-01-13

**Risk** A normalized trace can discard exactly the difference that explains a cost regression.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/golden/trace/behavior-trace.test.ts`.

**Manual verification** Compare the synthetic raw handoff tree with its normalized trace and timing record.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-26-16 | Distinguish one useful child from two redundant children | Compare traces producing identical text through one and two dispatches. | The score identifies the extra dispatch and the same artifact verdict. |
| APEX-26-17 | Align argument ordering across identical team trials | Shuffle tool argument keys without changing values. | Normalized traces match and the report shows zero behavior drift. |
| APEX-26-18 | Preserve dependency order in normalized handoffs | Swap the completion order of two dependent tasks while keeping names equal. | The drift report identifies the first wrong dependency. |
| APEX-26-19 | Record useful versus idle worker time | Instrument queued, running and delivered times on a scripted child. | The three durations sum to its observed lifetime within the clock resolution. |
| APEX-26-20 | Keep costs comparable when a child never starts | Queue a specialist then cancel before dispatch. | The trace counts one cancelled assignment, zero started child turns and no child usage. |
