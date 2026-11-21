# 28 · Child permissions

[Project APEX ledger](../README.md) · Multi-agent collaboration

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Effective level

**Current state** Delegated levels consult the sending chain and the Chief's source conversation, subject to the recipient's existing state. Existing case “allows a live source reader to resolve a notice returning to the Chief's conversation”.

**Sources** [server/host/delegated-level.ts](../../../../server/host/delegated-level.ts) · [server/host/delegated-level.test.ts](../../../../server/host/delegated-level.test.ts) · [server/chief-level-delegation.e2e.test.ts](../../../../server/chief-level-delegation.e2e.test.ts)

**Dependencies** APEX-21-01

**Risk** A worker can inherit the wrong conversation's permission level.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/delegated-level.test.ts`.

**Manual verification** Read effective levels and approval cards from the synthetic Chief and two subordinate chats.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-01 | Trace the effective grant across two handoff hops | Dispatch Chief to writer to checker with deliberately different bot defaults. | The checker's effective authority follows the documented Chief conversation and the trace names its source. |
| APEX-28-02 | Keep an ordinary sender from propagating Chief authority | Send the same task from an ordinary fixture bot. | The recipient receives zero special Chief-derived grants. |
| APEX-28-03 | Preserve the recipient's own explicit thread level | Dispatch into a thread with an explicit established grant different from its bot default. | Any change follows the documented handoff rule and is visible on that thread alone. |
| APEX-28-04 | Handle a missing permission source at resume | Remove the original source conversation before a held child resumes. | No additional authority is inferred and the unresolved source is recorded. |
| APEX-28-05 | Separate sibling grants in concurrent projects | Use one specialist in two projects with different effective levels. | Each call checks the grant of its own root conversation. |

## Shared files

**Current state** The file handoff path enforces per-message, per-assignment and daily budgets and can deduplicate passed files. Existing case “stores a passed file once however often it is passed, and keeps it on the assignment”.

**Sources** [server/host/handoff-files.ts](../../../../server/host/handoff-files.ts) · [server/host/handoff-files.test.ts](../../../../server/host/handoff-files.test.ts) · [server/handoff-files.e2e.test.ts](../../../../server/handoff-files.e2e.test.ts)

**Dependencies** APEX-23-11

**Risk** A child may receive an unrelated or oversized file while the owner thinks only one document was shared.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/handoff-files.test.ts`.

**Manual verification** Inspect the recipient's fixture directory and assignment receipt before opening the attachment.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-06 | Pass only explicitly chosen input documents | Seed three stored files and attach only the middle one to a handoff. | The recipient gets exactly that file's hash. |
| APEX-28-07 | Apply the aggregate file-size cap before dispatch | Supply individually small inputs exceeding the assignment's total limit. | No partial accepted file set is published. |
| APEX-28-08 | Keep parallel file deliveries within the daily limit | Race two deliveries whose combined bytes exceed the same bot's remaining allowance. | Accepted charges never exceed the daily cap. |
| APEX-28-09 | Deduplicate a repeated attachment without losing its assignment links | Pass identical content to two authorized assignments. | Both receipts resolve correctly while underlying storage retains one content copy. |
| APEX-28-10 | Credit bytes only to successful recipients | Deliver to one accepting and one refused teammate. | The daily accounting charges only the accepted recipient and the failed one obtains no readable copy. |

## Browser lending

**Current state** The handoff surface selector treats the built-in browser separately from other computer surfaces. Existing case “lets a hand-off ask only for the built-in browser, auto included”.

**Sources** [server/host/handoff-browser.ts](../../../../server/host/handoff-browser.ts) · [server/host/handoff-browser.test.ts](../../../../server/host/handoff-browser.test.ts)

**Dependencies** APEX-24-11

**Risk** Lending a browser might imply permission for a different computer surface.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/handoff-browser.test.ts`.

**Manual verification** Inspect the fixture's surface selector and inert control counters on the receiving worker.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-11 | Keep a browser-only child off the host desktop | Request a browser handoff then attempt a benign fixture desktop action. | Browser tools remain usable and the desktop adapter sees zero input. |
| APEX-28-12 | Record an abandoned browser handoff accurately | Give up the fixture handoff before its worker outcome arrives. | One stopped result appears and the late outcome cannot replace it. |
| APEX-28-13 | Retain a real browser failure in the child result | Fail the synthetic browser action after a valid handoff. | The parent sees the actual failure and no generic success. |
| APEX-28-14 | Close the browser grant when its assignment ends | Complete the child then request another page action on its old assignment. | The retired scope grants no new work. |
| APEX-28-15 | Keep two borrowed browser contexts isolated | Give two workers different fixture tabs through different assignments. | Each reads only its intended page marker and receives its own action receipt. |

## Refused requests

**Current state** Refused-handoff bookkeeping associates failed named assignments with routine runs and can clear them after success. Existing case “makes the run say so, once, whether the bot was named by id or by name”.

**Sources** [server/host/refused-handoffs.ts](../../../../server/host/refused-handoffs.ts) · [server/host/refused-handoffs.test.ts](../../../../server/host/refused-handoffs.test.ts)

**Dependencies** APEX-21-01

**Risk** Refusal messages can misattribute nonexistent work or conceal a legitimate permissions problem.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/refused-handoffs.test.ts`.

**Manual verification** Review the synthetic routine's result and assignment list beside its refusal notices.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-16 | Report a refused named teammate once | Request the same unavailable worker by ID and display name in one routine. | One refusal appears and no phantom child is created. |
| APEX-28-17 | Exclude typos from permission-denied attribution | Ask for a nonexistent synthetic teammate that resembles a valid name. | The run identifies the unresolved name and does not blame the valid worker. |
| APEX-28-18 | Clear a refusal after a successful later dispatch | Restore the teammate's permitted scope and retry the original task. | The current result reflects the successful assignment without a stale refusal. |
| APEX-28-19 | Scope refusal bookkeeping to the originating run | Cause the same denial in a routine and a separate ordinary chat. | Routine summary includes only its own denial. |
| APEX-28-20 | Keep another person's private bot out of refusal detail | Reference an unavailable synthetic personal bot from a shared routine. | Shared output exposes no private profile detail and creates no child. |
