# 24 · Computer ownership

[Project APEX ledger](../README.md) · Tools and computer interaction

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Lazy claims

**Current state** Lazy VM claims belong to a dispatch generation and fire on the first screen action. Existing case “fires a thread's claim exactly once, even across repeated gate polls”.

**Sources** [server/auto-vm-claims.ts](../../../../server/auto-vm-claims.ts) · [server/auto-vm-claims.test.ts](../../../../server/auto-vm-claims.test.ts) · [evals/scenarios/lazy-claim-rejection.json](../../../../evals/scenarios/lazy-claim-rejection.json) · [evals/scenarios/lazy-claim-screenless.json](../../../../evals/scenarios/lazy-claim-screenless.json)

**Dependencies** APEX-01-12

**Risk** Screenless work can unnecessarily occupy a scarce computer.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/auto-vm-claims.test.ts`.

**Manual verification** Use the fake desktop with two tasks, observe lease ownership, and count claim calls.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-24-01 | Defer claiming until the first real screen action | Run a file-only turn beside a task holding the fixture display. | The file turn completes with zero claim attempts. |
| APEX-24-02 | Coalesce simultaneous first screen calls | Issue two first screen requests from one synthetic dispatch generation. | Exactly one claim reaches the gate and both requests share its decision. |
| APEX-24-03 | Keep a declined claim terminal for its generation | Answer No then issue three more screen calls from that turn. | All are refused without a second question or claim. |
| APEX-24-04 | Discard a claim from an obsolete dispatch | Hold a screen request, restart the fixture turn and release the old request. | The new generation receives no borrowed permission. |
| APEX-24-05 | Distinguish a dead computer from a busy one | Stop the synthetic VM before the first screen request. | The outcome names unavailability once and contains no misleading waiting-on-another-task state. |

## VM leases

**Current state** VM leases serialize different tasks, renew on owner activity and expire when an owner is wedged. Existing case “serializes different threads while letting the owner renew”.

**Sources** [server/local-vm-lease.ts](../../../../server/local-vm-lease.ts) · [server/local-vm-lease.test.ts](../../../../server/local-vm-lease.test.ts)

**Dependencies** APEX-01-12

**Risk** A wedged lease can block later work or let concurrent inputs interleave.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/local-vm-lease.test.ts`.

**Manual verification** Inspect the synthetic lease owner and the inert display event log as clocks and tasks advance.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-24-06 | Renew a lease only for its current owner | Alternate heartbeat traffic from the owning and waiting tasks. | Only the owner's activity extends the stored deadline. |
| APEX-24-07 | Release a stale lease at its exact boundary | Advance a fake clock to either side of an unrenewed deadline. | A waiting task acquires the display only after expiry. |
| APEX-24-08 | Release ownership on normal settlement | End the owning turn before the next lease timeout. | A queued task can acquire immediately without waiting for expiry. |
| APEX-24-09 | Keep a late release from clearing a successor's lease | Rotate ownership from A to B then deliver A's delayed cleanup. | B remains owner and continues recording its own input. |
| APEX-24-10 | Recover ownership after a fixture process replacement | Reopen the lease pool for a terminated synthetic owner. | Only one new owner may claim and no overlapping input intervals appear. |

## Computer asks

**Current state** Computer asks track sharing readiness, unanswered requests and per-conversation decline cooldowns. Existing case “says it is ready at once, with no card, when the computer lends what is needed”.

**Sources** [server/computer-asks.ts](../../../../server/computer-asks.ts) · [server/computer-asks.test.ts](../../../../server/computer-asks.test.ts)

**Dependencies** APEX-01-12

**Risk** Repeated computer requests can nag the person or resume without an answer.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/computer-asks.test.ts`.

**Manual verification** Use the existing desktop sharing controls in a fixture and compare each card with the waiting request.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-24-11 | Reuse a ready lent computer without asking again | Mark the synthetic desktop already able to supply the requested surface. | The request becomes ready immediately with zero new cards. |
| APEX-24-12 | Attach an outstanding request to its visible card | Hold one computer request for longer than the provider call timeout then enable sharing. | The original outstanding request resumes once. |
| APEX-24-13 | Honor the decline cooldown per conversation | Decline in chat A, ask there again and then ask in eligible chat B. | A gets no duplicate card during cooldown and B is evaluated on its own scope. |
| APEX-24-14 | Describe the requested action without exposing typed text | Ask for synthetic input containing a unique private marker. | The card identifies the action class and contains zero copies of the marker. |
| APEX-24-15 | Handle a sharing preference change mid-request | Disable fixture sharing before a previously queued request resumes. | The request cannot act until current sharing conditions allow it. |

## Lent sessions

**Current state** Cloud lending tests distinguish owner-device conversations from API, guest and bot-started work. Existing case “the owner's own conversation from one of their devices may”.

**Sources** [server/cloud-lending.ts](../../../../server/cloud-lending.ts) · [server/cloud-lending.test.ts](../../../../server/cloud-lending.test.ts)

**Dependencies** APEX-01-13

**Risk** A delegated turn can borrow the owner's desktop in an ineligible context.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cloud-lending.test.ts`.

**Manual verification** Compare fixture ownership markers, requesting audience and the synthetic lender log.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-24-16 | Recognize a person-initiated eligible loan | Start an owner conversation on a paired fixture device with the loan enabled. | Exactly the expected owner session can request that loan. |
| APEX-24-17 | Keep an API-started conversation out of owner lending | Submit equivalent text through the fixture's bot API. | The API-origin turn receives zero owner-computer grants. |
| APEX-24-18 | Recheck a loan after chat sharing changes | Make a previously private fixture conversation shared before its next turn. | The lending decision reflects its updated audience before any input. |
| APEX-24-19 | Prevent a bot-authored line from conferring owner authority | Deliver an owner-looking synthetic instruction as a bot post. | The loan check retains bot origin and the display remains untouched. |
| APEX-24-20 | End a borrowed session when its source loses eligibility | Revoke the synthetic loan while the turn is parked. | Later screen requests fail closed and a fresh eligible request can acquire normally. |
