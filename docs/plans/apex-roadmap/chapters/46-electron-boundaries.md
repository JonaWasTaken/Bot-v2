# 46 · Electron boundaries

[Project APEX ledger](../README.md) · Security, packaging and release

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Preload tool capability contracts

**Current state** Desktop preload provides separate bridge contracts for local and remote surfaces and checks compatibility with older clients. Tool permission audits observe actual fixture capability decisions.

**Sources** [electron/preload.cjs](../../../../electron/preload.cjs) · [electron/preload-contract.node-test.mjs](../../../../electron/preload-contract.node-test.mjs) · [electron/bridge-contract.json](../../../../electron/bridge-contract.json) · [electron/local-origin.cjs](../../../../electron/local-origin.cjs) · [server/tool-permission-audit.e2e.test.ts](../../../../server/tool-permission-audit.e2e.test.ts)

**Dependencies** APEX-01-17

**Risk** A remote workspace renderer can receive a native tool capability intended only for the local owner.

**Risk level** Critical

**Automated verification** Run the preload contract tests for local and remote fixture pages and record harmless native tool-probe calls through an inert main-process adapter. Verify IPC capability outcomes as well as exposed keys.

**Manual verification** Open the local and remote tool surfaces in separate fixture windows and compare the available controls with what their bridge calls can actually do.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-01 | Preserve only authorized native tool methods for older renderers | Load prior-release fixture contracts alongside the current local and remote bridges. | Each authorized legacy call remains usable only in its documented surface and no additional privileged call appears. |
| APEX-46-02 | Keep remote tool discovery aligned with actual preload authority | Compare the visible native-tool inventory and a harmless probe from a remote fixture page. | The announced set equals the permitted set and no local-only adapter invocation is recorded. |
| APEX-46-03 | Return a bounded failure for a disabled native capability | Invoke an unavailable fixture-only tool and inspect the renderer error and main-process counters. | The caller receives one useful refusal, the adapter count stays zero and the desktop remains responsive. |
| APEX-46-04 | Retire a pending tool subscription on workspace remount | Replace a fixture renderer while it is subscribed to one tool-result channel. | A later result reaches only the eligible replacement listener and never the retired page. |
| APEX-46-05 | Validate a proposed native tool contract extension | Add an optional synthetic capability to the fixture contract and exercise a caller from each supported release. | Current local callers can discover it, older callers decode their expected response and remote suites show no authority growth. |

## Tool authority in embedded pages

**Current state** The app-frame navigation guard confines an embedded document to its intended navigation. Frame messages and native local-only operations have distinct bridge contracts.

**Sources** [electron/app-frame-guard.mjs](../../../../electron/app-frame-guard.mjs) · [electron/app-frame-guard.node-test.mjs](../../../../electron/app-frame-guard.node-test.mjs) · [shared/app-frame/bridge.ts](../../../../shared/app-frame/bridge.ts) · [shared/app-frame/bridge.test.ts](../../../../shared/app-frame/bridge.test.ts) · [electron/local-origin.node-test.mjs](../../../../electron/local-origin.node-test.mjs)

**Dependencies** APEX-01-17

**Risk** Granting a project document a parent window's tool authority can expose workspace data or execute an unapproved native action.

**Risk level** Critical

**Automated verification** Use the frame-guard, app-frame bridge and local-origin fixtures with inert parent and child counters. Exercise only documented frame operations and a harmless denied native probe.

**Manual verification** Open a fixture document with a supported page action, then reload, switch documents and close it; inspect which origin received each recorded callback.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-06 | Keep a document tool request tied to its presenting frame | Send the same documented page operation from two fixture documents with separate owners. | Each response returns only to its original live frame and carries its intended page identity. |
| APEX-46-07 | Preserve allowed page operations after a document reload | Reload the source document while the parent chat remains active. | The recreated frame can use its supported bridge and receives no local-only native capability. |
| APEX-46-08 | Refuse parent-only workspace actions from an embedded view | Try a harmless owner-only fixture probe from the document and from its eligible local parent. | Exactly the parent invocation reaches the inert tool sink. |
| APEX-46-09 | Discard an in-flight page response after frame disposal | Close the document before its fixture operation finishes and open a sibling view. | No completion is delivered to the sibling and the parent retains its own state. |
| APEX-46-10 | Re-evaluate embedded tool eligibility after a document switch | Replace one project document with another under the same desktop window. | The old document's capability is ineligible and the new view obtains only its own declared bridge methods. |

## Origin recognition

**Current state** Local-only bridge decisions depend on a registered origin and distinguish main from child frame identity. Existing case “nothing is local until the origin is known, then only that origin is”.

**Sources** [electron/local-origin.cjs](../../../../electron/local-origin.cjs) · [electron/local-origin.node-test.mjs](../../../../electron/local-origin.node-test.mjs)

**Dependencies** APEX-01-17

**Risk** Treating an unknown frame as local can expose privileged desktop actions.

**Risk level** Critical

**Automated verification** Extend the fixture and run `node --test electron/local-origin.node-test.mjs`.

**Manual verification** Compare outcomes of a harmless fixture-only local bridge probe from main and child contexts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-11 | Keep local-only operations unavailable before origin setup | Invoke the fixture probe before registering its loopback origin. | Zero local-only operations are accepted. |
| APEX-46-12 | Match the exact registered origin after startup | Probe the registered origin and a different fixture origin on another port. | Only the registered origin is accepted. |
| APEX-46-13 | Handle an empty native main-frame URL during navigation | Trigger the documented transient empty URL in the registered fixture main frame. | Its intended local behavior is preserved for that frame alone. |
| APEX-46-14 | Keep an empty child frame unprivileged | Exercise the same empty-URL state from a fixture child frame. | Its local-only probe is refused and the parent remains usable. |
| APEX-46-15 | Clear outdated origin authority on place change | Rebind main to a different isolated server and repeat the old-origin probe. | The new target can use its supported calls and the retired origin cannot. |

## Browser tab navigation and recovery

**Current state** The CDP page fixture observes readiness, tabs, downloads and page failures. Desktop navigation separately retires a launch recovery when a person deliberately changes destination.

**Sources** [server/browser/cdp/navigations.ts](../../../../server/browser/cdp/navigations.ts) · [server/browser/cdp/s4-pages.e2e.test.ts](../../../../server/browser/cdp/s4-pages.e2e.test.ts) · [server/browser/session-control.test.ts](../../../../server/browser/session-control.test.ts) · [electron/main-navigation.node-test.mjs](../../../../electron/main-navigation.node-test.mjs)

**Dependencies** APEX-01-14

**Risk** A stale browser navigation can replace the active tab or attribute a result to the page the person just left.

**Risk level** High

**Automated verification** Drive the real CDP page suite against local fixture origins. Compare target ID, active tab, final document and navigation mark through redirects, cancellation and recovery.

**Manual verification** Use the fixture Browser panel to open two tabs, follow their back/forward histories and inspect the shown page after controlled failures and delayed loads.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-16 | Keep the most recent deliberate tab navigation active | Start a slow navigation in fixture tab A, request another destination there and release the old response. | A ends on the newest requested document and the old callback cannot replace its title or URL. |
| APEX-46-17 | Preserve an unrelated tab during navigation recovery | Fail a load in tab A while B holds an edited fixture form. | A reports its own failure while B retains its URL, form value and tab ID. |
| APEX-46-18 | Keep back and forward bound to the selected browser tab | Visit two documents in each of two fixture tabs and alternate history actions. | Each visible document follows its own tab history and the other tab receives zero navigation events. |
| APEX-46-19 | Resolve a blocked popup as an explicit browser outcome | Exercise a fixture link that opens a child target and a control whose popup is refused. | The allowed action yields the correctly attributed child ID and the refusal produces zero phantom tabs. |
| APEX-46-20 | Retire navigation observers when a browser tab closes | Close a fixture tab during a slow load and open another with the same starting URL. | Late progress or completion from the closed target never changes the new tab. |
