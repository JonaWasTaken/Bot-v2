# 46 · Electron boundaries

[Project APEX ledger](../README.md) · Security, packaging and release

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Bridge contract

**Current state** The preload contract preserves function keys used by older pages and distinguishes local and remote surfaces. Existing case “the bridge keeps every function a page of the last two releases calls”.

**Sources** [electron/preload.cjs](../../../../electron/preload.cjs) · [electron/preload-contract.node-test.mjs](../../../../electron/preload-contract.node-test.mjs) · [electron/bridge-contract.json](../../../../electron/bridge-contract.json)

**Dependencies** APEX-01-17

**Risk** A desktop upgrade can break the preload API used by a saved older workspace.

**Automated verification** Extend the fixture and run `node --test electron/preload-contract.node-test.mjs`.

**Manual verification** Open fixture pages representing current and prior releases and inspect the actual preload keys and return types.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-01 | Preserve the bridge functions used by two earlier releases | Compare the fixture preload object with both recorded historical contracts. | Every required historical function is present on its intended surface. |
| APEX-46-02 | Keep remote workspace bridge access narrower than local home | Read the supported keys from a local and a remote fixture page. | Both key sets exactly match their declared contracts. |
| APEX-46-03 | Return consistent errors for an unavailable bridge capability | Call a supported but unavailable fixture operation through its public API. | The caller receives one documented error and the renderer stays responsive. |
| APEX-46-04 | Remove duplicate bridge subscriptions on remount | Subscribe, unmount and remount a fixture listener before main emits one event. | The renderer receives one callback and teardown leaves zero listeners for the retired page. |
| APEX-46-05 | Version a proposed desktop bridge change explicitly | Compare a candidate contract containing one optional field to the stored release fixtures. | Older callers still decode the response and the new field has a contract test. |

## Frame messages

**Current state** The app-frame guard restricts document navigation and handles a child frame that disappears mid-check. Existing case “an app frame may load its own document”.

**Sources** [electron/app-frame-guard.mjs](../../../../electron/app-frame-guard.mjs) · [electron/app-frame-guard.node-test.mjs](../../../../electron/app-frame-guard.node-test.mjs)

**Dependencies** APEX-01-17

**Risk** Navigation in an embedded project frame can confuse app and document authority.

**Automated verification** Extend the fixture and run `node --test electron/app-frame-guard.node-test.mjs`.

**Manual verification** Open two local fixture documents in embedded frames and inspect their navigation outcomes.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-06 | Allow an app frame to reload its own document | Reload the same fixture document while its parent chat stays active. | The child reloads and the parent's selected conversation stays unchanged. |
| APEX-46-07 | Keep unrelated navigation out of a document frame | Use a normal link to a separate fixture document from the first app frame. | The navigation guard applies the documented refusal and keeps the original document active. |
| APEX-46-08 | Handle a frame destroyed during policy evaluation | Remove the disposable child before its navigation callback completes. | The operation ends safely with zero uncaught renderer errors. |
| APEX-46-09 | Keep top-level navigation independent of app-frame rules | Navigate the fixture main window through its approved workspace selector. | The approved navigation succeeds without applying the child-document restriction. |
| APEX-46-10 | Retain frame identity across parent refresh | Reload the parent with two legitimate app frames open. | Each recreated frame can load its own document and has no stale identity from the other. |

## Origin recognition

**Current state** Local-only bridge decisions depend on a registered origin and distinguish main from child frame identity. Existing case “nothing is local until the origin is known, then only that origin is”.

**Sources** [electron/local-origin.cjs](../../../../electron/local-origin.cjs) · [electron/local-origin.node-test.mjs](../../../../electron/local-origin.node-test.mjs)

**Dependencies** APEX-01-17

**Risk** Treating an unknown frame as local can expose privileged desktop actions.

**Automated verification** Extend the fixture and run `node --test electron/local-origin.node-test.mjs`.

**Manual verification** Compare outcomes of a harmless fixture-only local bridge probe from main and child contexts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-11 | Keep local-only operations unavailable before origin setup | Invoke the fixture probe before registering its loopback origin. | Zero local-only operations are accepted. |
| APEX-46-12 | Match the exact registered origin after startup | Probe the registered origin and a different fixture origin on another port. | Only the registered origin is accepted. |
| APEX-46-13 | Handle an empty native main-frame URL during navigation | Trigger the documented transient empty URL in the registered fixture main frame. | Its intended local behavior is preserved for that frame alone. |
| APEX-46-14 | Keep an empty child frame unprivileged | Exercise the same empty-URL state from a fixture child frame. | Its local-only probe is refused and the parent remains usable. |
| APEX-46-15 | Clear outdated origin authority on place change | Rebind main to a different isolated server and repeat the old-origin probe. | The new target can use its supported calls and the retired origin cannot. |

## Navigation policy

**Current state** Main navigation distinguishes deliberate navigation from the initial recovery's own navigation.

**Sources** [electron/main.mjs](../../../../electron/main.mjs) · [electron/main-navigation.node-test.mjs](../../../../electron/main-navigation.node-test.mjs) · [electron/server-supervisor.mjs](../../../../electron/server-supervisor.mjs)

**Dependencies** APEX-01-17

**Risk** Launch recovery can clear a working window or reopen a superseded destination.

**Automated verification** Extend the fixture and run `node --test electron/main-navigation.node-test.mjs`.

**Manual verification** Inspect the disposable desktop's navigation and recovery state while moving between two fixture places.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-46-16 | Retire a recovery attempt after deliberate user navigation | Move to B while A's launch recovery remains pending. | A's delayed recovery result never navigates away from B. |
| APEX-46-17 | Keep recovery-owned navigation from cancelling itself | Make a recovery navigate the fixture to its verified landing page. | One recovery succeeds and does not schedule another recovery cycle. |
| APEX-46-18 | Leave the current window usable after a refused destination | Return an unavailable response for the selected fixture place. | The current place remains interactive and the failure names the requested destination. |
| APEX-46-19 | Ignore a late navigation acknowledgment for a closed window | Close the fixture window while its request is pending then open a new one. | The late acknowledgment changes zero state in the new window. |
| APEX-46-20 | Restore clean local navigation after recovery exhausts | Fail a fixture recovery then select a healthy local workspace from the menu. | The local workspace opens once and stale failure UI is cleared. |
