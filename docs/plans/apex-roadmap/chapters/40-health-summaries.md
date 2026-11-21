# 40 · Health summaries

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Actionable daily assistance

**Current state** Today already separates finished work and items needing the person's attention. Proactive routine fixtures can create and report observations without real external accounts.

**Sources** [server/today.ts](../../../../server/today.ts) · [server/today.test.ts](../../../../server/today.test.ts) · [server/routes/today.ts](../../../../server/routes/today.ts) · [server/proactive-routines.e2e.test.ts](../../../../server/proactive-routines.e2e.test.ts)

**Dependencies** APEX-31-16

**Risk** A proactive digest can expose a private task, nag repeatedly or direct the person to a stale decision.

**Risk level** Critical

**Automated verification** Seed a deterministic day of fixture work, then run Today and the proactive routine e2e. Compare visible suggestions, actor scope, source timestamps and destination receipts.

**Manual verification** Open the fixture desktop as two team members and follow one Needs you item, one delivered result and one dismissed suggestion.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-01 | Offer one actionable item for duplicate signals | Emit a pending approval and two synthetic notifications for its same run. | Today's assistance opens one actionable item with the original decision ID. |
| APEX-40-02 | Point a proactive follow-up to the actual result thread | Finish a fixture routine outside its bot's default chat and request a follow-up summary. | The proposed action opens the exact reported result and preserves its project. |
| APEX-40-03 | Suppress routine chatter with no meaningful change | Seed three healthy empty checks and one new synthetic deliverable. | The digest offers the new deliverable once and no synthetic action for the empty checks. |
| APEX-40-04 | Retire a proactive item after the underlying work is resolved | Complete a highlighted fixture request in another window before refreshing Today. | The next summary drops the stale request and never reopens its completed decision. |
| APEX-40-05 | Protect private work in proactive suggestions and totals | Generate separate private and team-visible outcomes in the same synthetic period. | Each reader's suggested actions, counts and links reconcile exclusively to their own eligible work. |

## Routine health

**Current state** Routine health counts failures and missed runs since the last successful run using occurrence history. Existing case “counts the failed and missed runs since the last one that completed, newest first”.

**Sources** [server/routine-health.ts](../../../../server/routine-health.ts) · [server/routine-health.test.ts](../../../../server/routine-health.test.ts) · [server/routine-run-history.ts](../../../../server/routine-run-history.ts)

**Dependencies** APEX-35-01

**Risk** Counting cancelled or running occurrences as failures can overstate operational risk.

**Risk level** High

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

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/connection-health.test.ts`.

**Manual verification** Flip synthetic connection outcomes and compare owner-specific health cards and recorded reasons.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-11 | Distinguish one transient network failure from repeated unreachability | Feed one failure, a recovery, then the configured failure sequence. | The first failure never becomes a persistent outage after recovery. |
| APEX-40-12 | Treat an explicit sign-out as immediately actionable | Return a fixture signed-out response after a healthy read. | Health changes on that response and names the correct synthetic account. |
| APEX-40-13 | Recover connection health after a successful read | Record a repeated unavailable state then a valid source-specific read. | The next health view shows working and clears the obsolete action. |
| APEX-40-14 | Keep a removed account out of health summaries | Remove A's connection while B retains an account with the same label. | A's status disappears and B's remains accurate. |
| APEX-40-15 | Separate a tool's own failure from its returned content | Return successful synthetic content containing words like disconnected. | The account remains healthy because only the actual operation outcome controls health. |

## Anticipating missed work

**Current state** Schedule reporting exposes the earliest unstarted event and treats paused bots separately. Health history distinguishes failures and missed work from completed or cancelled runs.

**Sources** [server/routine-schedule-report.ts](../../../../server/routine-schedule-report.ts) · [server/routine-schedule-report.test.ts](../../../../server/routine-schedule-report.test.ts) · [server/routine-health.ts](../../../../server/routine-health.ts) · [server/proactive-routines.e2e.test.ts](../../../../server/proactive-routines.e2e.test.ts)

**Dependencies** APEX-31-06

**Risk** A proactive prompt can create work for an intentionally paused routine or hide an actual missed occurrence.

**Risk level** High

**Automated verification** Build schedule reports at three controlled instants and test the corresponding proactive action against the fixture scheduler. Check pending IDs, retrigger count and outcome labels.

**Manual verification** Inspect the next-due panel and proactive notice in a temporary workspace, then pause, resolve or reschedule the named occurrence and refresh.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-40-16 | Highlight the earliest unattended occurrence still actionable | Seed one missed eligible slot and a later active run. | The proactive notice points to the earlier unresolved slot and identifies the active run separately. |
| APEX-40-17 | Respect an intentional project pause in proactive planning | Pause the bot that owns the earliest future occurrence. | The notice proposes no immediate dispatch for the paused bot and reports its deferred reason. |
| APEX-40-18 | Explain a missed occurrence before offering a retry | Close a synthetic due slot without a recorded start. | The suggestion identifies its observed reason and never claims that work already ran. |
| APEX-40-19 | Avoid sending a second reminder across local midnight | Seed a pending item immediately before midnight and keep it unresolved just after. | The same pending identity persists across day buckets without two reminders for one occurrence. |
| APEX-40-20 | Reconcile suggestions against current state after wake | Suspend before a due-time change and resume after another worker handled the task. | Refreshed assistance excludes the completed action and reports the next genuinely eligible occurrence. |
