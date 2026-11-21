# 08 · Workspace connection

[Project APEX ledger](../README.md) · Desktop experience

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Probe identity

**Current state** The add-place sheet probes the address and code before passing a reviewed target to Electron. Existing case “Connect to a server takes an address and a code typed apart: a code pasted alone moves to its field, and main names the server it found”.

**Sources** [src/components/PlaceAddSheet.tsx](../../../../src/components/PlaceAddSheet.tsx) · [src/components/PlacesRail.test.ts](../../../../src/components/PlacesRail.test.ts)

**Dependencies** APEX-01-11

**Risk** A stale successful probe can pair a different destination.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/PlacesRail.test.ts`.

**Manual verification** Hold fake IPC responses in the isolated Electron sheet and inspect submitted address/code pairs.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-08-01 | Handle out-of-order successful probes | Resolve B's successful check before an older A check. | Only B's label and reviewed address can be submitted. |
| APEX-08-02 | Require a new result after editing just the pairing code | Change the code while retaining a previously healthy address. | Submit remains disabled until the new result and the adapter receives only the new code. |
| APEX-08-03 | Clear trust feedback when a probe times out | Probe a working target then switch to a stalled target. | The old success label disappears and timeout creates zero connect calls. |
| APEX-08-04 | Coalesce duplicate Connect activation | Immediately click and press Enter on one successfully checked fixture target. | One IPC request reaches the pairing adapter while it is pending. |
| APEX-08-05 | Discard a probe after the sheet closes | Dismiss the sheet mid-check and reopen for a different server. | The old response changes no field, status or submission count. |

## Saved places

**Current state** Settings distinguishes local environments from saved servers. The sprint's connection smoke stopped at an obsolete Settings expectation. Existing case “lists the servers, then local environments (Advanced) with their folders, marking a missing one”.

**Sources** [src/components/ConnectedWorkspacesSettings.tsx](../../../../src/components/ConnectedWorkspacesSettings.tsx) · [src/components/ConnectedWorkspacesSettings.test.ts](../../../../src/components/ConnectedWorkspacesSettings.test.ts) · [scripts/verify-server-connection.mjs](../../../../scripts/verify-server-connection.mjs)

**Dependencies** APEX-01-11

**Risk** Broken settings navigation can hide persistence or trust failures.

**Risk level** High

**Automated verification** Run `corepack pnpm exec vitest run src/components/ConnectedWorkspacesSettings.test.ts` for Settings interactions. Extend `node scripts/verify-server-connection.mjs` in isolated Electron for persistence, cancellation and trust.

**Manual verification** Use Settings in an isolated Electron profile, relaunch it, then compare the saved place inventory.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-08-06 | List local and added servers with distinct identities | Give a local environment and remote place the same display name. | Each row opens the correct ID and only the local row exposes its folder. |
| APEX-08-07 | Cancel the folder picker without a partial environment | Start local-environment creation and cancel the native directory picker. | No environment is persisted merely by opening and cancelling the picker. |
| APEX-08-08 | Retain a missing folder as a recoverable row | Move a synthetic environment folder aside before relaunch. | Settings identifies that environment as missing and leaves other places usable. |
| APEX-08-09 | Verify connection persistence through current Settings | Drive the existing connection smoke via the server-add entry and reopen Settings after restart. | The final trusted server appears once and the cancelled server appears zero times. |
| APEX-08-10 | Report an unsuccessful local environment creation | Refuse the fixture folder creation after a name was entered. | The form retains the name, reports the failure and creates no saved row. |

## Connection secrets

**Current state** The credential migration removes secret fields from workspace configuration while retaining ordinary provider settings. Existing case “stores the router key separately while keeping provider settings”.

**Sources** [electron/workspace-credentials.mjs](../../../../electron/workspace-credentials.mjs) · [electron/workspace-credentials.test.mjs](../../../../electron/workspace-credentials.test.mjs) · [electron/workspace-credentials-save.node-test.mjs](../../../../electron/workspace-credentials-save.node-test.mjs)

**Dependencies** APEX-01-11

**Risk** Migration can attach a synthetic credential to the wrong workspace.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run electron/workspace-credentials.test.mjs`.

**Manual verification** Inspect the disposable config and fake credential-store keys from two named fixture environments.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-08-11 | Migrate keys independently for equal server labels | Seed two profiles with the same label and different synthetic key markers. | Each adapter receives its own marker after migration. |
| APEX-08-12 | Retain provider settings when a key moves | Migrate a custom endpoint with an explicit protocol and model. | Address, protocol and model are unchanged and the cleartext key is absent from saved config. |
| APEX-08-13 | Retry an interrupted credential migration | Fail the fake store on the first write then reopen the profile. | The key is recoverable and the second successful migration leaves one usable stored entry. |
| APEX-08-14 | Keep an empty credential from replacing a valid entry | Re-read config with an empty migrated field beside a valid fake store record. | Subsequent connection still retrieves the original marker. |
| APEX-08-15 | Remove only the chosen place's credential | Forget one of two saved fixture places then reopen the remaining one. | Only the forgotten store key disappears and the surviving place still authenticates. |

## Frame geometry and rail states

**Current state** Frame tests cover native-window spacing and the old/new page frame contract. The place rail draws separate current, hovered and pending indicators.

**Sources** [src/components/PlacesRail.tsx](../../../../src/components/PlacesRail.tsx) · [src/components/PlacesRail.frame.test.ts](../../../../src/components/PlacesRail.frame.test.ts) · [src/components/PlacesRail.test.ts](../../../../src/components/PlacesRail.test.ts) · [src/rail.theme.test.ts](../../../../src/rail.theme.test.ts) · [DESIGN.md](../../../../DESIGN.md)

**Dependencies** APEX-01-11

**Risk** A mismatched frame inset can obscure native controls or visually select the wrong workspace.

**Risk level** Medium

**Automated verification** Extend the rail's frame and theme fixtures to compare native insets, semantic tokens and state-specific accessible attributes on both desktop platforms.

**Manual verification** Switch two fixture places across old and new page frames on macOS and Windows. Check the top rail, selected marker and window buttons at two zoom settings.

**APEX-08-18 Risk level** Low

**APEX-08-18 Risk** A mismatched rail surface can leave a visible seam even when selection and navigation are correct.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-08-16 | Align the rail inset with each window frame | Compare an old macOS page frame, a new frame and a Windows frame at 100 and 125 percent. | The first place tile never overlaps window controls and follows the prescribed inset for all six combinations. |
| APEX-08-17 | Separate active, pending and hover rail markers | Snapshot each state on adjacent places under a single theme and then with color removed. | Each state remains distinguishable by shape or text and only the active place announces current. |
| APEX-08-18 | Share the sidebar surface token with the rail | Apply a contrasting custom theme and toggle between legacy and current frame layouts. | The rail and sidebar use their designated semantic surface in both layouts with no fallback-color seam. |
| APEX-08-19 | Keep rail hit areas stable during optimistic navigation | Measure tile hit rectangles between pointer hover, pending and confirmed selection. | Selection decoration changes without shifting a neighboring hit area by more than one CSS pixel. |
| APEX-08-20 | Keep status rings visible when platform contrast changes | Switch theme while one fixture place is provisioning and one needs attention. | Both status treatments remain identifiable at the same icon size without changing which tile opens. |
