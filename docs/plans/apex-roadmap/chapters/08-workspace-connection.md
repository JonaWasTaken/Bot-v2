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

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run electron/workspace-credentials.test.mjs`.

**Manual verification** Inspect the disposable config and fake credential-store keys from two named fixture environments.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-08-11 | Migrate keys independently for equal server labels | Seed two profiles with the same label and different synthetic key markers. | Each adapter receives its own marker after migration. |
| APEX-08-12 | Retain provider settings when a key moves | Migrate a custom endpoint with an explicit protocol and model. | Address, protocol and model are unchanged and the cleartext key is absent from saved config. |
| APEX-08-13 | Retry an interrupted credential migration | Fail the fake store on the first write then reopen the profile. | The key is recoverable and the second successful migration leaves one usable stored entry. |
| APEX-08-14 | Keep an empty credential from replacing a valid entry | Re-read config with an empty migrated field beside a valid fake store record. | Subsequent connection still retrieves the original marker. |
| APEX-08-15 | Remove only the chosen place's credential | Forget one of two saved fixture places then reopen the remaining one. | Only the forgotten store key disappears and the surviving place still authenticates. |

## Place switch

**Current state** Main receives a place ID from the rail. The renderer immediately marks a click pending and also supports older page frames.

**Sources** [src/components/PlacesRail.tsx](../../../../src/components/PlacesRail.tsx) · [src/components/PlacesRail.test.ts](../../../../src/components/PlacesRail.test.ts) · [src/components/PlacesRail.frame.test.ts](../../../../src/components/PlacesRail.frame.test.ts)

**Dependencies** APEX-01-11

**Risk** A pending workspace switch can mislabel where a message will be sent.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/PlacesRail.test.ts`.

**Manual verification** Alternate between two fixture places in one desktop window and inspect the rail and chat header.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-08-16 | Revert a pending selection when main refuses to switch | Delay then reject a click on B while A is open. | Both active rail and chat header return to A and its input remains usable. |
| APEX-08-17 | Suppress duplicate loads of the active place | Click the current rail tile ten times. | Main receives no workspace-open request and draft text stays present. |
| APEX-08-18 | Prevent a delayed place switch from stealing selection | Click B then C and resolve their IPC calls in reverse order. | The final place indicator, header and active transport all identify C. |
| APEX-08-19 | Keep an unavailable place visibly distinct from an active one | Seed a setting-up tile next to a connected place. | Only one tile announces itself as current and the pending one opens no chat. |
| APEX-08-20 | Preserve rail placement across frame versions | Switch between fixtures serving old and current page frames on Windows and macOS. | Every rail tile stays reachable and none overlaps the native window controls. |
