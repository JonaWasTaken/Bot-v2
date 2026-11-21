# 31 · Trigger and timezone semantics

[Project APEX ledger](../README.md) · Autonomous execution

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Cron expression

**Current state** The cron formatter turns a rule and instant into localized wording and has a fallback language. Existing case “has German words and falls back to complete English for an untranslated language”.

**Sources** [server/routine-cron-text.ts](../../../../server/routine-cron-text.ts) · [server/routine-cron-text.test.ts](../../../../server/routine-cron-text.test.ts) · [server/routine-cron.e2e.test.ts](../../../../server/routine-cron.e2e.test.ts) · [server/routine-schedules.ts](../../../../server/routine-schedules.ts) · [src/lib/cron-text.ts](../../../../src/lib/cron-text.ts)

**Dependencies** APEX-01-12

**Risk** A translated schedule can show a different day or time than the scheduler uses.

**Risk level** High

**Automated verification** Run `corepack pnpm exec vitest run server/routine-cron-text.test.ts server/routine-cron.e2e.test.ts` with fixed instants and explicit fixture time zones. Compare generated occurrence instants with formatted text.

**Manual verification** Read the desktop schedule text next to its generated fixture occurrences in the named time zone.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-31-01 | Describe a weekday rule unambiguously across locales | Render the same Mon/Wed/Fri rule in English, German and Traditional Chinese. | Each rendering names exactly the three scheduled weekdays. |
| APEX-31-02 | Display a repeat rule across the spring DST gap | Expand a local 02:30 rule over the clock change and format its next occurrences. | The text and scheduler agree on the next actual instant and its offset. |
| APEX-31-03 | Disambiguate a repeated fall-back hour | Format two distinct instants sharing the same local clock time. | Their occurrence identities remain distinct and the displayed explanation resolves which is next. |
| APEX-31-04 | Use complete fallback wording for an untranslated locale | Render an unsupported locale for a rule with a weekday and end date. | All components form one understandable fallback sentence. |
| APEX-31-05 | Keep a stored time zone when the desktop locale changes | Switch the fixture host locale without editing the routine. | The next three UTC instants remain identical and only display wording changes. |

## Due computation

**Current state** The due selector combines eligible run times, pending checks and meeting preparation deadlines. Existing case “is null with no routines, or none with checks or a next run”.

**Sources** [server/routine-due.ts](../../../../server/routine-due.ts) · [server/routine-due.test.ts](../../../../server/routine-due.test.ts)

**Dependencies** APEX-01-12

**Risk** An early wake can busy-loop while a late wake can miss a due event.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-due.test.ts`.

**Manual verification** Advance the fixture clock and compare scheduler wake times with the pending routine list.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-31-06 | Pick the earliest of check and scheduled run | Set a routine check and a fixed run five minutes apart. | The earliest eligible timestamp wins regardless of insertion order. |
| APEX-31-07 | Return no due time when all routines are inactive | Disable or remove every fixture trigger and clear pending holds. | The scheduler records no wake deadline. |
| APEX-31-08 | Handle a just-created unchecked routine | Add a routine at the current fake instant with no previous check. | Its first check time matches the configured interval and does not fire twice. |
| APEX-31-09 | Respect a held occurrence ahead of a later meeting | Hold the earlier run while scheduling an eligible meeting preparation. | The eligible meeting is not starved by the held routine. |
| APEX-31-10 | Recompute due time promptly after edit | Move a fixture routine's next occurrence earlier while the old timer is pending. | A single new wake targets the updated instant. |

## Catch-up

**Current state** Catch-up counts elapsed slots for intervals and cron rules while considering allowed hours, end dates and staggering. Existing case “counts an interval's slots by arithmetic and a cron's by walking them”.

**Sources** [server/routine-catch-up.ts](../../../../server/routine-catch-up.ts) · [server/routine-catch-up.test.ts](../../../../server/routine-catch-up.test.ts)

**Dependencies** APEX-01-12

**Risk** Bulk catch-up can flood chats after a long offline interval.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-catch-up.test.ts`.

**Manual verification** Suspend a fixture scheduler for the specified interval and compare missed and dispatched occurrence keys.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-31-11 | Bound catch-up after a month of minutely slots | Jump one month ahead with a one-minute rule. | The newest slot and missed count are correct without dispatching every missed minute. |
| APEX-31-12 | Count only slots within the configured workday | Suspend an interval routine across two nights. | The catch-up tally excludes every out-of-window occurrence. |
| APEX-31-13 | Treat a one-time trigger as one occurrence after sleep | Advance well beyond its due date and restart twice. | Exactly one logical occurrence is recorded. |
| APEX-31-14 | Respect the end date during long catch-up | Set the routine's end before a fixture outage finishes. | No recovered occurrence has a timestamp after the end. |
| APEX-31-15 | Stagger several overdue routines on resume | Wake ten equally overdue fixture routines simultaneously. | Dispatch times follow the configured stagger and no logical occurrence repeats. |

## Connected checks

**Current state** Routine checks collect mail and meeting items and advance cursors after keeping a result. Existing case “new mail and a meeting to prepare become one run; its answer being kept moves the cursor”.

**Sources** [server/host/routine-checks.ts](../../../../server/host/routine-checks.ts) · [server/host/routine-checks.test.ts](../../../../server/host/routine-checks.test.ts) · [server/connected-reads.ts](../../../../server/connected-reads.ts) · [server/connected-reads.test.ts](../../../../server/connected-reads.test.ts)

**Dependencies** APEX-01-12

**Risk** A disconnected or denied mailbox can appear indistinguishable from an empty inbox.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/routine-checks.test.ts`.

**Manual verification** Run scheduled checks against synthetic account adapters and inspect source reports, cursors and one visible result.
**GitHub** Unfiled

**Related GitHub** [#6895](https://github.com/milind-soni/OpenMausBot/issues/6895)

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-31-16 | Report Outlook-only coverage | Configure just the synthetic Outlook adapter with one unread item. | The run names Outlook, includes that item once and never claims Gmail was checked. |
| APEX-31-17 | Distinguish no new Gmail mail from disconnection | Run a healthy empty Gmail fixture then a disconnected account. | The outcomes distinguish empty from unavailable and neither advances an unearned cursor. |
| APEX-31-18 | Combine mail and meeting checks once | Give the same fixture tick new mail and one meeting to prepare. | One run carries both distinct inputs without creating a second check. |
| APEX-31-19 | Restore mail eligibility when a run fails | Fail after fetching a new item but before accepting its result. | The next check reoffers that item and the cursor advances only after acceptance. |
| APEX-31-20 | Keep account-specific check receipts separate | Give two synthetic members identically titled messages in different mailboxes. | Each report and watermark refer only to its own account. |
