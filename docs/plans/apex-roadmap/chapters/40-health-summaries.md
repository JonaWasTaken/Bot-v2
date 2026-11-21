# 40 · Health summaries

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Today view

**Current state** Today aggregates completed work, origin, outcome and destination within a bounded reporting window. Existing case “counts finished outcomes once, routines OK and failed, and the minutes they stand for”.

**Sources** [server/today.ts](../../../../server/today.ts) · [server/today.test.ts](../../../../server/today.test.ts) · [server/routes/today.ts](../../../../server/routes/today.ts)

**Dependencies** APEX-35-11

**Risk** A team health summary can double-count routine reports or disclose private deliverables.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/today.test.ts`.

**Manual verification** Compare the fixture Today view with its explicitly seeded work items as two different readers.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-01 | Count one completed deliverable across duplicate activity | Emit a routine outcome and a chat report representing the same run. | Today counts one finished item and one associated duration. |
| APEX-40-02 | Link a summary to the actual result conversation | Complete a fixture routine that reports outside its default thread. | Opening the Today item lands on its delivered report. |
| APEX-40-03 | Bound a longer summary to its supported window | Request a period exceeding the fixture report's maximum days. | The effective interval is displayed and every included item falls inside it. |
| APEX-40-04 | Separate no-change checks from delivered work | Mix three empty scans with one accepted artifact. | The summary reports one deliverable and does not fabricate three additional results. |
| APEX-40-05 | Respect member visibility in summary totals | Seed equal public and private synthetic outcomes in one period. | Each reader's count and list reconcile using only their visible work. |

## Routine health

**Current state** Routine health counts failures and missed runs since the last successful run using occurrence history. Existing case “counts the failed and missed runs since the last one that completed, newest first”.

**Sources** [server/routine-health.ts](../../../../server/routine-health.ts) · [server/routine-health.test.ts](../../../../server/routine-health.test.ts) · [server/routine-run-history.ts](../../../../server/routine-run-history.ts)

**Dependencies** APEX-35-01

**Risk** Counting cancelled or running occurrences as failures can overstate operational risk.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-health.test.ts`.

**Manual verification** Compare health badges with the ordered fixture run history before and after a successful run.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-06 | Count failure streaks since the latest completion | Seed fail, missed, completed, fail and missed outcomes in sequence. | The current streak counts only the two after completion. |
| APEX-40-07 | Make streaks invariant under input ordering | Shuffle a synthetic history with known occurrence times ten ways. | All permutations produce the same health counts. |
| APEX-40-08 | Exclude a cancelled run from a failure streak | Insert cancellation between two failures without an intervening success. | Cancellation adds no failure and preserves the previous streak as documented. |
| APEX-40-09 | Remove inactive routines from the health summary | Disable one failing routine while another stays enabled. | Only the enabled routine contributes a current health alert. |
| APEX-40-10 | Expose a recovery event after a previously failing routine succeeds | Settle the next occurrence successfully after a three-failure streak. | The new summary clears the streak and retains the historical failed runs. |

## Connection health

**Current state** Connection health tracks source-specific results, repeated unreachability and separate member and team states. Existing case “moves with each outcome: refused and signed out at once, unreachable only once it repeats, working on any success”.

**Sources** [server/connection-health.ts](../../../../server/connection-health.ts) · [server/connection-health.test.ts](../../../../server/connection-health.test.ts)

**Dependencies** APEX-31-16

**Risk** A temporary outage can be presented as expired credentials or shared across accounts.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/connection-health.test.ts`.

**Manual verification** Flip synthetic connection outcomes and compare owner-specific health cards and recorded reasons.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-11 | Distinguish one transient network failure from repeated unreachability | Feed one failure, a recovery, then the configured failure sequence. | The first failure never becomes a persistent outage after recovery. |
| APEX-40-12 | Treat an explicit sign-out as immediately actionable | Return a fixture signed-out response after a healthy read. | Health changes on that response and names the correct synthetic account. |
| APEX-40-13 | Recover connection health after a successful read | Record a repeated unavailable state then a valid source-specific read. | The next health view shows working and clears the obsolete action. |
| APEX-40-14 | Keep a removed account out of health summaries | Remove A's connection while B retains an account with the same label. | A's status disappears and B's remains accurate. |
| APEX-40-15 | Separate a tool's own failure from its returned content | Return successful synthetic content containing words like disconnected. | The account remains healthy because only the actual operation outcome controls health. |

## Schedule report

**Current state** The schedule report separates upcoming eligible work, unstarted occurrences and recently decided outcomes. Existing case “is exactly the contract's fields”.

**Sources** [server/routine-schedule-report.ts](../../../../server/routine-schedule-report.ts) · [server/routine-schedule-report.test.ts](../../../../server/routine-schedule-report.test.ts)

**Dependencies** APEX-31-06

**Risk** A dashboard can hide missed work behind the next active run.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-schedule-report.test.ts`.

**Manual verification** Compare the synthetic schedule summary to queued, paused, missed and active occurrence records.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-16 | Show the earliest unstarted occurrence | Seed an active run and an earlier unstarted due slot. | The summary identifies the unstarted slot even while the active run is visible. |
| APEX-40-17 | Exclude paused bots from next-due forecasts | Pause the bot with the earliest scheduled timestamp. | The next-due time moves to the earliest eligible bot and existing missed counts stay visible. |
| APEX-40-18 | Report an occurrence closed without starting | Mark a due slot missed before dispatch. | The schedule history shows its final reason with no invented start timestamp. |
| APEX-40-19 | Reconcile daily scheduled counts across midnight | Seed occurrences immediately before and after the report's local midnight. | Each occurrence contributes to exactly one correct day. |
| APEX-40-20 | Identify stale summary data after reconnect | Disconnect the desktop, change the fixture schedule then reopen the summary. | The next-due and pending totals both match the new snapshot revision. |
