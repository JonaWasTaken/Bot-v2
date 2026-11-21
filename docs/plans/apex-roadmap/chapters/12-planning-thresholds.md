# 12 · Planning thresholds

[Project APEX ledger](../README.md) · Core intelligence

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Goal contract

**Current state** The goal coordinator parses private decision envelopes, retains a bound turn identity and caps its control loop. Existing case “strips and validates a coordinator decision”.

**Sources** [server/group-goal-run.ts](../../../../server/group-goal-run.ts) · [server/group-goal-run.test.ts](../../../../server/group-goal-run.test.ts)

**Dependencies** APEX-01-13

**Risk** A malformed model decision can schedule work the person never requested.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/group-goal-run.test.ts`.

**Manual verification** Drive a scripted goal from desktop and compare its visible state with the parsed coordinator decision.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-12-01 | Recognize a complete structured goal decision | Split a valid two-step goal envelope across response chunks. | One validated decision is applied after closure and no private envelope appears in chat. |
| APEX-12-02 | Reject a malformed terminal decision | Supply a completed marker missing its required decision fields. | No new worker starts and the goal records an actionable invalid-decision outcome. |
| APEX-12-03 | Use the last complete decision in a noisy response | Place two complete envelopes around an unfinished third. | Exactly the intended last complete decision controls the run. |
| APEX-12-04 | Separate actionable goals from ordinary direct answers | Pair ten one-step asks with ten dependent two-step asks using a scripted chooser. | The fixture reports goal starts per class and zero starts for direct-answer controls. |
| APEX-12-05 | Keep the goal bound to the turn that started it | Reuse a provider session for a new turn before an old decision arrives. | The late decision changes no state on the new goal. |

## One-to-one goals

**Current state** One-to-one goals reserve a turn, share a wait deadline across retries and inspect the done marker. Existing case “shares one wait cap between a lost slot and the busy wait after it”.

**Sources** [server/host/one-on-one-goals.ts](../../../../server/host/one-on-one-goals.ts) · [server/host/one-on-one-goals.test.ts](../../../../server/host/one-on-one-goals.test.ts)

**Dependencies** APEX-01-13

**Risk** A busy wait or lost slot can consume the full planning budget twice.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/one-on-one-goals.test.ts`.

**Manual verification** Hold and free the synthetic bot while watching its one-to-one goal and attempt timestamps.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-12-06 | Share one deadline across slot loss and wait | Lose a reservation just before entering the busy wait. | Total waiting time never exceeds the configured cap plus one timer tick. |
| APEX-12-07 | Start a goal that becomes eligible at the deadline edge | Release the busy fixture one tick before the cap. | One goal turn starts and no timed-out duplicate follows. |
| APEX-12-08 | Return a blocked reason when a direct goal cannot start | Hold the fixture slot for the entire cap. | One blocked outcome is visible with zero provider turns launched. |
| APEX-12-09 | Bound retries for a lost reservation | Make two consecutive start attempts lose the same synthetic slot. | The recorded attempts stop at the policy limit and show the reason. |
| APEX-12-10 | Keep a finished one-to-one goal closed on retry events | Deliver a done marker then repeat the last availability notification. | The completion count stays one and no new planning turn opens. |

## Waiting decisions

**Current state** The goal host waits for leads and workers, retries a failed provider within policy and can reassign a stalled worker. Existing case “reassigns through the lead when a worker stays busy past the cap, and still completes”.

**Sources** [server/host/goal-turns.ts](../../../../server/host/goal-turns.ts) · [server/group-goal-wait-cap.e2e.test.ts](../../../../server/group-goal-wait-cap.e2e.test.ts) · [server/host/goal-cards.ts](../../../../server/host/goal-cards.ts)

**Dependencies** APEX-01-13

**Risk** A permanently busy worker can occupy a planner indefinitely.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/group-goal-wait-cap.e2e.test.ts`.

**Manual verification** Reproduce the named wait with scripted lead and worker chats and inspect the resulting handoff tree.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-12-11 | Reassign one unavailable specialist | Hold the first worker past the wait cap and release a second. | One replacement receives the task and one child delivers the result. |
| APEX-12-12 | Mark a blocked lead differently from a failed worker | Hold only the coordinator unavailable. | The final goal says blocked and contains zero invented worker failures. |
| APEX-12-13 | Cap provider-death recovery in a goal | Terminate the scripted lead on two consecutive attempts. | One retry runs and the second death closes the goal with one failure. |
| APEX-12-14 | Preserve independent work during one stalled dependency | Start two independent child steps and block just one. | The ready child's output survives while the blocked branch records its wait reason. |
| APEX-12-15 | Prevent an expired worker response from replacing reassigned work | Finish the original worker after its replacement has settled. | Only the accepted worker's result advances the goal. |

## Goal card

**Current state** A goal card renders compact live progress and exposes Stop while an eligible run is working. Existing case “shows live goal progress without expanding into a run log”.

**Sources** [src/components/GoalRunCard.tsx](../../../../src/components/GoalRunCard.tsx) · [src/components/GoalRunCard.test.ts](../../../../src/components/GoalRunCard.test.ts)

**Dependencies** APEX-01-11

**Risk** A compact goal card can imply completion while dependencies are pending.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/GoalRunCard.test.ts`.

**Manual verification** Watch the fixture goal card with keyboard focus and compare it with the backend state.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-12-16 | Show the current next step without expanding history | Start a three-step scripted goal with one pending dependency. | The collapsed card names the active step and its true state. |
| APEX-12-17 | Hide Stop after a final goal outcome | Settle the run while focus is on Stop. | The action becomes unavailable and focus lands on a usable control. |
| APEX-12-18 | Render a partial goal payload after reconnect | Omit the optional worker and step summary from a replayed card. | The card remains readable, names the known status and invents no progress. |
| APEX-12-19 | Distinguish a blocked goal from a completed one | Render identical progress counts with blocked and completed outcomes. | Accessible status text distinguishes both without relying on color. |
| APEX-12-20 | Restore a goal card on task return | Leave the chat during step two and return after step three. | Exactly one card shows the stored terminal outcome and final count. |
