# 33 · Unattended approval

[Project APEX ledger](../README.md) · Autonomous execution

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Unattended turns

**Current state** Unattended turns have request and repeated-failure ceilings and account for provider usage reported across multiple frames. Existing case “that repeats one failing command is stopped at the twentieth in a row, with the loop guard off in config: 20 requests, not 500”.

**Sources** [server/host/unattended-turns.ts](../../../../server/host/unattended-turns.ts) · [server/host/unattended-turns.test.ts](../../../../server/host/unattended-turns.test.ts)

**Dependencies** APEX-01-12

**Risk** Unattended work can spend repeatedly without progress.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/unattended-turns.test.ts`.

**Manual verification** Inspect synthetic provider requests, limits and the final routine card under a stepped clock.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-33-01 | Count a failing-command streak independently of global loop settings | Repeat one harmless failing fixture command with the optional loop guard disabled. | The unattended hard bound stops it at its configured consecutive-failure count. |
| APEX-33-02 | Cap varying tool requests without double-counting usage frames | Emit multiple usage callbacks per request while changing tool arguments. | The run stops on the request count, independent of callback count. |
| APEX-33-03 | Handle providers that omit usage IDs | Alternate one tool result with multiple unkeyed usage reports per model step. | Accounting increments once per actual modeled step. |
| APEX-33-04 | Reset consecutive-failure state after a successful operation | Insert a successful synthetic read between two short failure streaks. | The streak counter resets while the total request counter continues. |
| APEX-33-05 | Show the unattended limit that actually stopped a run | Trigger time and request ceilings in separate fake-clock runs. | Each terminal report names its actual limit and final consumed amount. |

## Approval handling

**Current state** An unattended routine waiting for approval can notify the person and remain open without claiming an answer. Existing case “waits for the person, tells them at once, and stops saying nobody answered the approval when it went unanswered”.

**Sources** [server/host/live-approval.ts](../../../../server/host/live-approval.ts) · [server/routine-unattended-approval.e2e.test.ts](../../../../server/routine-unattended-approval.e2e.test.ts) · [src/components/ApprovalCard.tsx](../../../../src/components/ApprovalCard.tsx)

**Dependencies** APEX-21-01

**Risk** A scheduled action can run without the person's required answer.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-unattended-approval.e2e.test.ts`.

**Manual verification** Pause the synthetic routine on its existing approval card and inspect the inert action sink.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-33-06 | Deliver a waiting approval when the desktop is reopened | Start an approval-bound synthetic routine with the desktop closed, then reopen its owner's profile twice. | Both opens identify the same unanswered card, one actionable item remains, and the schedule never reports a completed operation. |
| APEX-33-07 | Deliver the approval to the intended fixture member | Use a shared bot with a member-owned scheduled operation. | Only the eligible member receives the actionable card. |
| APEX-33-08 | Decline a scheduled operation without replaying it | Deny the pending fixture ask then reconnect the desktop. | No effect occurs and the denial remains terminal after replay. |
| APEX-33-09 | Recover a pending approval through restart | Restart a fixture server with one unanswered routine card. | One actionable card returns for the same run and no effect occurs on boot. |
| APEX-33-10 | Ignore an answer for a cancelled occurrence | Cancel the routine then submit the old card decision. | The old decision cannot cause a downstream action or change a later run. |

## Cloud access level

**Current state** A routine's owner authority depends on the originating chat, speaker history and what was actually approved. Existing case “counts who spoke, not what bots posted there: a skill receipt or a report never makes it someone else's”.

**Sources** [server/cloud-routine-level.ts](../../../../server/cloud-routine-level.ts) · [server/cloud-routine-level.test.ts](../../../../server/cloud-routine-level.test.ts)

**Dependencies** APEX-17-01

**Risk** Ownership inferred from shared activity could elevate an unattended routine.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cloud-routine-level.test.ts`.

**Manual verification** Read grant source, speaker history and action outcomes in the synthetic cloud-policy fixture.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-33-11 | Distinguish owner speech from a bot report | Seed a private chat with one owner line and several bot-generated receipts. | Bot receipts do not change the recorded human speaker set. |
| APEX-33-12 | Remove inherited authority after another person participates | Let a second member answer a card before the scheduled run. | The routine no longer qualifies for owner-only authority. |
| APEX-33-13 | Re-evaluate a routine when its action definition changes | Edit a previously allowed synthetic routine to use a different benign action. | Its old approval shape cannot authorize the edited action. |
| APEX-33-14 | Keep routine authority consistent across sharing changes | Convert a private fixture chat to shared and run the ownership check again. | The effective level follows current sharing and the original provenance is retained. |
| APEX-33-15 | Keep one routine's report from approving another | Insert an unrelated member's routine report before an approval card. | The second routine receives no grant from the first report. |

## Unanswered questions

**Current state** A waiting run records the ask separately from active execution and can yield when its next scheduled occurrence arrives. Existing case “starts the next scheduled run of a routine whose sign-in nobody answered, and stops the old wait”.

**Sources** [server/routine-waits.ts](../../../../server/routine-waits.ts) · [server/routine-unanswered-wait.e2e.test.ts](../../../../server/routine-unanswered-wait.e2e.test.ts)

**Dependencies** APEX-01-12

**Risk** An unanswered sign-in card can suppress all future scheduled occurrences.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-unanswered-wait.e2e.test.ts`.

**Manual verification** Leave one synthetic ask unanswered, advance the schedule, and inspect old and new run IDs.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-33-16 | Close an obsolete wait when the next run becomes due | Leave a fixture sign-in question pending through the next scheduled instant. | The old wait is terminal and a new occurrence can start. |
| APEX-33-17 | Exclude waiting time from active execution accounting | Hold a routine on a question for an hour of fake time. | Active duration excludes the hour and elapsed duration includes it. |
| APEX-33-18 | Settle a question against its original run only | Answer the previous occurrence's card after the next run opens. | The new occurrence's answer state stays unchanged. |
| APEX-33-19 | Restore the pending question's age after reopen | Persist a fixture ask, advance the clock and reload its run. | Reported waiting age is measured from the original ask time. |
| APEX-33-20 | Preserve a real answer just before turnover | Answer the pending card one tick before the next scheduled run. | The first run receives exactly one answer and the next has a distinct occurrence ID. |
