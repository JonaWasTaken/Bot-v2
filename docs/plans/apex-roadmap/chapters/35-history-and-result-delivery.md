# 35 · History and result delivery

[Project APEX ledger](../README.md) · Autonomous execution

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## History query

**Current state** Run history evicts eligible ended rows from the routines that dominate storage and preserves unfinished work. Existing case “drops the oldest ended rows of the routine that holds the most, never one that has not ended”.

**Sources** [server/routine-run-history.ts](../../../../server/routine-run-history.ts) · [server/routine-run-history.test.ts](../../../../server/routine-run-history.test.ts)

**Dependencies** APEX-32-11

**Risk** Retention can evict active runs or let one noisy routine displace every other history.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-run-history.test.ts`.

**Manual verification** Open fixture histories for a noisy and a quiet routine before and after retention runs.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-35-01 | Keep every active run during history eviction | Fill a capped history with active and ended rows. | All active IDs remain searchable after eviction. |
| APEX-35-02 | Evict from the routine dominating history first | Seed one routine with twenty ended rows and another with two. | The first eviction removes the oldest eligible row from the larger history. |
| APEX-35-03 | Handle an all-active history above its cap | Seed more active rows than the nominal history limit. | Eviction terminates and removes zero active rows. |
| APEX-35-04 | Break tied end times deterministically | Persist equally timed ended runs then invoke retention twice on identical snapshots. | Both retained ID sets match. |
| APEX-35-05 | Keep the current run reachable across a history trim | Open an active run, exceed the history cap with other occurrences and refresh. | Its route still resolves to the same run and current status. |

## Run card

**Current state** The run card and text fallback describe an occurrence in the reader's language. Existing case “says how the run stands, in the language of the conversation's person”.

**Sources** [server/routine-run-card.ts](../../../../server/routine-run-card.ts) · [server/routine-run-card.test.ts](../../../../server/routine-run-card.test.ts) · [src/components/RoutineRunCard.tsx](../../../../src/components/RoutineRunCard.tsx)

**Dependencies** APEX-01-12

**Risk** A localized run card can make deferred or cancelled work appear completed.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-run-card.test.ts`.

**Manual verification** Read fixture cards and their fallbacks in two desktop locales before and after settlement.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-35-06 | Render a waiting run with its actual state | Hold a routine on an existing question and reopen chat. | Its card describes waiting and contains no completed claim. |
| APEX-35-07 | Preserve the conversation person's language | Use one shared fixture routine from two differently localized member contexts. | Each reader gets the supported local wording with the same run ID. |
| APEX-35-08 | Keep text fallback consistent with the structured card | Remove rich-card support from a fixture client. | Fallback conveys the same terminal state and identifies the same run. |
| APEX-35-09 | Update one card in place after settlement | Replay running, done and duplicate done events. | One terminal card remains for that occurrence. |
| APEX-35-10 | Distinguish cancellation from failure for readers | Stop one fixture run and fail another with the same summary. | Both visual and accessible card text differentiate their terminal states. |

## Outcome delivery

**Current state** Routine outcomes can report to different personal conversations depending on where the person established the routine. Existing case “reports every run into the bot's main thread while fresh executions, approvals, deletion and unread stay reachable”.

**Sources** [server/routine-outcomes.ts](../../../../server/routine-outcomes.ts) · [server/routine-results.e2e.test.ts](../../../../server/routine-results.e2e.test.ts) · [server/routine-same-conversation.ts](../../../../server/routine-same-conversation.ts)

**Dependencies** APEX-01-12

**Risk** A routine result can surface in the wrong personal conversation.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-results.e2e.test.ts`.

**Manual verification** Open the fixture chats receiving scheduled reports and count reports and unread transitions.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-35-11 | Report into the chat where the person established the routine | Create in thread B and leave A selected at completion. | Exactly one result lands in B and none in A. |
| APEX-35-12 | Handle a migrated bot's last active personal conversation | Seed an older fixture with last-written and last-selected thread IDs that differ. | The report opens the documented last-written destination. |
| APEX-35-13 | Keep a no-change check out of the person's result feed | Run one scan with an empty synthetic source and another with new information. | Only the latter produces a visible result. |
| APEX-35-14 | Preserve direct access to approval and history from a report | Open a result carrying a synthetic follow-up action and prior runs. | Both links resolve to the original routine and intended member's run. |
| APEX-35-15 | Avoid duplicate unread counts when an outcome is redelivered | Deliver an identical result event twice while the desktop is away. | The destination gets one report and one unread increment. |

## Run updates

**Current state** The run watcher announces task metadata while keeping the bot transcript on its own feed. Existing case “announces the run's task without the bot's transcript”.

**Sources** [server/routine-run-watch.ts](../../../../server/routine-run-watch.ts) · [server/routine-run-broadcast.e2e.test.ts](../../../../server/routine-run-broadcast.e2e.test.ts) · [server/sse-fanout.ts](../../../../server/sse-fanout.ts)

**Dependencies** APEX-03-01

**Risk** Live run updates can expose full chat content to a status-only subscriber.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-run-broadcast.e2e.test.ts`.

**Manual verification** Subscribe a fixture status view and a full conversation view, then compare their SSE payloads.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-35-16 | Broadcast only run metadata to a status subscriber | Include a private synthetic marker in the conversation text. | The status feed carries the run task identity and zero marker occurrences. |
| APEX-35-17 | Notify on final state without a second conversation subscription | Keep only the run watcher attached through settlement. | It receives the terminal status for the original run. |
| APEX-35-18 | Remove a watcher when its fixture window closes | Close the status window during a live run and inspect subscription counts. | The watcher count returns to baseline and the run continues. |
| APEX-35-19 | Refresh a stale run row after reconnect | Disconnect status-only view, settle the run and reconnect. | The reloaded state agrees with durable history. |
| APEX-35-20 | Keep parallel run announcements distinct | Overlap two occurrences with identical labels but different task IDs. | Each status update maps to exactly one occurrence through settlement. |
