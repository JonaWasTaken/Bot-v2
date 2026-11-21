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

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/delegated-level.test.ts`.

**Manual verification** Read effective levels and approval cards from the synthetic Chief and two subordinate chats.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-01 | Trace the effective grant across two handoff hops | Dispatch Chief to writer to checker with deliberately different bot defaults. | The checker's effective authority follows the documented Chief conversation and the trace names its source. |
| APEX-28-02 | Keep an ordinary sender from propagating Chief authority | Send the same task from an ordinary fixture bot. | The recipient receives zero special Chief-derived grants. |
| APEX-28-03 | Preserve the recipient's own explicit thread level | Dispatch into a thread with an explicit established grant different from its bot default. | Any change follows the documented handoff rule and is visible on that thread alone. |
| APEX-28-04 | Handle a missing permission source at resume | Remove the original source conversation before a held child resumes. | No additional authority is inferred and the unresolved source is recorded. |
| APEX-28-05 | Separate sibling grants in concurrent projects | Use one specialist in two projects with different effective levels. | Each call checks the grant of its own root conversation. |

## Coding assignments and source bundles

**Current state** Passed files belong to an assignment, with per-message and per-assignment budgets. The checker fixture already proves byte-exact attachment delivery.

**Sources** [server/host/handoff-files.ts](../../../../server/host/handoff-files.ts) · [server/host/handoff-files.test.ts](../../../../server/host/handoff-files.test.ts) · [server/handoff-files.e2e.test.ts](../../../../server/handoff-files.e2e.test.ts) · [server/checked-handoff.e2e.test.ts](../../../../server/checked-handoff.e2e.test.ts)

**Dependencies** APEX-23-11

**Risk** A coding worker may patch the wrong revision when a source bundle is incomplete or two module names collide.

**Risk level** High

**Automated verification** Pass a two-module synthetic coding task through the handoff e2e fixture. Reconstruct and compare inputs and outputs by repository-relative path, assignment ID and hash.

**Manual verification** Open the worker's brief and returned files. Apply the resulting patch in a disposable fixture checkout and run the named failing test before and after.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-06 | Deliver the failing test alongside the implicated source | Dispatch one fixture test and one module while leaving an unrelated source unselected. | The worker gets exactly the two agreed hashes and can reproduce the stated failing assertion. |
| APEX-28-07 | Preserve module paths when handing off duplicate basenames | Assign two index.ts modules under different fixture packages. | The worker's bundle maps both paths to distinct bytes and the returned patch changes only the requested package. |
| APEX-28-08 | Detect a code task whose reference revision changed | Advance the fixture source after dispatch but before the worker returns a patch. | Review reports the base mismatch and does not silently apply the patch to the newer bytes. |
| APEX-28-09 | Refuse a partial coding brief when its required files exceed budget | Include two required modules exceeding the shared limit together. | The assignment names the missing inputs and records zero accepted incomplete source bundles. |
| APEX-28-10 | Retain the reviewer’s test instructions through a resumed handoff | Restart after a source bundle and exact test command have been accepted but before the worker replies. | The resumed assignment lists the original hashes and command once and its result points to the same task. |

## Frontend coding acceptance

**Current state** A worker can receive a browser-only handoff and the CDP fixture asserts resulting DOM state. A stopped handoff has a distinct terminal outcome.

**Sources** [server/host/handoff-browser.ts](../../../../server/host/handoff-browser.ts) · [server/host/handoff-browser.test.ts](../../../../server/host/handoff-browser.test.ts) · [server/browser/cdp/s4-actions.e2e.test.ts](../../../../server/browser/cdp/s4-actions.e2e.test.ts) · [server/browser/cdp/s4-pages.e2e.test.ts](../../../../server/browser/cdp/s4-pages.e2e.test.ts)

**Dependencies** APEX-01-14

**Risk** A frontend coding task can claim success from a compile or screenshot while the requested interaction still fails.

**Risk level** High

**Automated verification** Have a deterministic fixture worker edit a local demonstration page; run its before/after browser assertions against the served fixture and correlate them with its accepted diff.

**Manual verification** Open the patched fixture page at the displayed revision, repeat the user action and compare the result with the recorded browser proof.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-11 | Prove a UI behavior fix through its normal entry point | Change a fixture form whose Save button previously left the result unchanged. | The original build fails the interaction check and the patched build shows the expected saved value after one click. |
| APEX-28-12 | Run the regression on the built frontend artifact | Rebuild the fixture after a source edit and run the checker against the output directory. | Served build hash matches the patch receipt and contains its intended UI change. |
| APEX-28-13 | Reject a frontend pass from a stale preview | Leave a passing fixture server running on A's port while a second build contains a deliberate failing control. | The checker identifies the expected build marker and refuses to credit A's page for B. |
| APEX-28-14 | Keep browser-only coding checks within the delegated surface | Give the frontend reviewer a synthetic app URL and a browser-only assignment. | Its verification reaches the intended control with zero calls to host desktop input. |
| APEX-28-15 | Preserve a failed interaction beside an otherwise green build | Return a successful compile and a failing browser assertion for the same revision. | The coding result retains both outcomes and reports the requested behavior as unverified. |

## Unavailable specialists and fallback

**Current state** The host records a denied handoff once for its routine and clears that refusal when the assignment later succeeds. Roles and actual bot identities are separate inputs.

**Sources** [server/host/refused-handoffs.ts](../../../../server/host/refused-handoffs.ts) · [server/host/refused-handoffs.test.ts](../../../../server/host/refused-handoffs.test.ts) · [src/lib/bot-roles.ts](../../../../src/lib/bot-roles.ts) · [server/team-refused-handoff.e2e.test.ts](../../../../server/team-refused-handoff.e2e.test.ts)

**Dependencies** APEX-21-01

**Risk** A fallback can silently bypass the specialist's permission boundary or falsely claim that a specialist checked a result.

**Risk level** High

**Automated verification** Use the refused-handoff suite and the synthetic team e2e to record proposed, refused and successful specialist assignments. Verify the receiving actor's ID before crediting work.

**Manual verification** Read the fixture parent summary beside the requested specialist's own task list; verify who actually had access and who completed the work.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-28-16 | Name an unavailable specialist once in a run result | Request an out-of-scope specialist by display name and then by its ID. | One refusal names the intended role without claiming a completed specialist turn. |
| APEX-28-17 | Distinguish an unknown specialty from a known but busy worker | Request a nonexistent role and then a known specialist held on a fixture gate. | The two outcomes distinguish missing capability from temporary availability. |
| APEX-28-18 | Reassign a refused specialist task without duplicating success | Restore the original specialist's access after a permitted replacement has already delivered. | The root counts one accepted specialist result and explains which bot provided it. |
| APEX-28-19 | Keep specialist fallback inside the project audience | Offer a qualified bot outside the fixture team's audience and a less specialized allowed bot. | Private inputs never reach the outside bot and the parent explicitly identifies the fallback's missing capability. |
| APEX-28-20 | Withdraw a stale specialist refusal after a legitimate retry | Grant the intended specialist project access and rerun a previously refused brief. | Its current assignment succeeds once and the result no longer presents the earlier refusal as current. |
