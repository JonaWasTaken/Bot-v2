# 49 · Native installer testing

[Project APEX ledger](../README.md) · Security, packaging and release

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Windows installer

**Current state** The Windows workflow builds NSIS on a native runner. The sprint's separate native job installed it and checked renderer-ready once. Existing case “builds the Windows Defender check's installer exactly as the release's Windows job does”.

**Sources** [.github/workflows/package-win.yml](../../../../.github/workflows/package-win.yml) · [scripts/ci-workflow.test.ts](../../../../scripts/ci-workflow.test.ts) · [electron-builder.yml](../../../../electron-builder.yml) · [electron/main.mjs](../../../../electron/main.mjs)

**Dependencies** APEX-01-17

**Risk** A green archive build can coexist with a nonfunctional installed Windows desktop.

**Automated verification** On a disposable Windows runner, build with `corepack pnpm package:win`, install NSIS and assert the installed renderer marker. Run the referenced workflow test for recipe parity.

**Manual verification** In a disposable Windows x64 VM launch the installed executable, inspect its bridge, use chat, and preserve the smoke markers.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-01 | Repeat first launch under a non-admin Windows profile | Install the OSS NSIS candidate into a clean user's environment and launch it normally. | The installed renderer reaches ready and its isolated health and owner-capability probes pass. |
| APEX-49-02 | Preserve an existing synthetic workspace on upgrade | Seed the prior supported installer with two chats and install the candidate in the same test VM. | Both task IDs and fixture message hashes survive and a new chat settles. |
| APEX-49-03 | Launch correctly from a path containing spaces and non-ASCII text | Use a supported Windows fixture install/profile path with both features. | The preload, packaged backend and local fixture chat all initialize. |
| APEX-49-04 | Remove only the fixture application on uninstall | Inventory installer-owned files and a neighboring inert marker before uninstalling inside the VM. | Installer-owned output follows the documented cleanup policy and the unrelated marker stays intact. |
| APEX-49-05 | Verify Windows repair after an interrupted first run | Close the installed fixture while the first startup marker is pending and restart normally. | The second launch produces one ready window and one serving child. |

## Linux package

**Current state** The Linux smoke provides isolated X11 and Wayland/XWayland variants and reads the packaged renderer marker.

**Sources** [scripts/smoke-linux-package.mjs](../../../../scripts/smoke-linux-package.mjs) · [scripts/verify-linux-package.mjs](../../../../scripts/verify-linux-package.mjs) · [.github/workflows/package-linux.yml](../../../../.github/workflows/package-linux.yml) · [scripts/run-linux-package-smoke.mjs](../../../../scripts/run-linux-package-smoke.mjs)

**Dependencies** APEX-01-03

**Risk** Linux package smoke on one display backend may conceal a failure on another.

**Automated verification** Build the package on a disposable Linux runner, run `node scripts/verify-linux-package.mjs` on its release directory and exercise `scripts/smoke-linux-package.mjs` with the packaged fixture.

**Manual verification** Start each candidate in a disposable Linux desktop session and inspect the actual packaged window and local response.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-06 | Verify packaged X11 readiness with an empty desktop | Use the Xvfb fixture with no top-level windows and start the packaged renderer through its normal entry point. | The X11 diagnostic distinguishes an empty display from an unavailable renderer and the installed preload and health probes still pass. |
| APEX-49-07 | Verify the packaged Wayland backend handshake | Run the supported Wayland plus XWayland smoke and inspect the fixture CUA invocation log and health report. | The invocation carries the expected Wayland enable flag, the portal/libei fixture probe passes, and the renderer-ready marker belongs to that package. |
| APEX-49-08 | Recover from a packaged Linux child crash | Terminate only the synthetic backend after the renderer is ready. | The package restores a usable connection and exposes the recovered server identity. |
| APEX-49-09 | Verify the package carries its required browser component | Start the browser panel from the clean packaged fixture with system browser discovery controlled. | The declared bundled browser opens a loopback page and reports its expected revision. |
| APEX-49-10 | Retain profile identity after Linux relaunch | Close and reopen the same synthetic installed profile. | Original task and place IDs survive with no second background server. |

## Mac package

**Current state** Mac architecture selection defaults to both targets and requires an explicit partial-build choice for a subset. Existing case “defaults to both packaging targets”.

**Sources** [scripts/cua-mac-arches.mjs](../../../../scripts/cua-mac-arches.mjs) · [scripts/cua-mac-arches.test.mjs](../../../../scripts/cua-mac-arches.test.mjs) · [electron-builder.yml](../../../../electron-builder.yml) · [.github/workflows/release.yml](../../../../.github/workflows/release.yml) · [scripts/mac-thin.mjs](../../../../scripts/mac-thin.mjs)

**Dependencies** APEX-01-03

**Risk** A Mac package can be valid for one architecture while advertising support for both.

**Automated verification** Run `corepack pnpm exec vitest run scripts/cua-mac-arches.test.mjs` and run the row on a disposable Mac of each required architecture with the matching packaged binary.

**Manual verification** Launch the matching staged app on disposable Intel and Apple Silicon runners and inspect each executable's architecture.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-11 | Boot the Apple Silicon package natively | Launch the arm64 candidate from its installed app bundle and open fixture chat. | App, packaged server and required helpers run for the expected architecture and the renderer settles. |
| APEX-49-12 | Boot the Intel package on its target | Repeat the installed workflow on an x64 Mac fixture. | The x64 renderer, preload and backend serve one synthetic turn. |
| APEX-49-13 | Distinguish partial-architecture builds from release candidates | Build one declared partial fixture and one complete target matrix. | Only the complete matrix is eligible for a dual-architecture release record. |
| APEX-49-14 | Verify staged app signatures without publishing | Inspect the candidate's required signatures on a disposable Mac runner using the intended release-signing evidence. | The report ties signature verification results to the exact app hash and identifies any unavailable signing evidence. |
| APEX-49-15 | Exercise the installed app from a relocated Applications path | Copy the fixture app through its supported install flow and reopen an existing profile. | Helper resolution stays within the installed bundle and the profile opens without a missing executable. |

## Update handoff

**Current state** The updater coordinator distinguishes automatic and manual check failures, staged versions and installer handoff outcomes. Existing case “elevated-install wording survives terminal handoff and its staged card”.

**Sources** [electron/updater-coordinator.mjs](../../../../electron/updater-coordinator.mjs) · [electron/updater-coordinator.node-test.mjs](../../../../electron/updater-coordinator.node-test.mjs) · [electron/updater-test-fixture.mjs](../../../../electron/updater-test-fixture.mjs)

**Dependencies** APEX-01-17

**Risk** An updater can mark a candidate installed before the replacement desktop starts.

**Automated verification** Extend the fixture and run `node --test electron/updater-coordinator.node-test.mjs`.

**Manual verification** Use the updater fixture with a synthetic local feed and compare states on both sides of the handoff.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-16 | Preserve the staged version through an update handoff | Stage a local test update then simulate the installer taking over. | The presented version and expected artifact digest match the staged package. |
| APEX-49-17 | Reject a corrupt local update before install | Supply a disposable update whose bytes differ from its declared digest. | No installation starts and the previous fixture app remains usable. |
| APEX-49-18 | Make a failed manual check visible | Fail a user-triggered local-feed request and allow the next one. | The initial error is visible and the later successful check clears it. |
| APEX-49-19 | Keep automatic failures quiet until their configured threshold | Fail consecutive background fixture checks under the documented policy. | Notices follow the threshold and retries create no duplicate staged cards. |
| APEX-49-20 | Confirm update completion with the replacement app | Launch the updated disposable profile with a preserved synthetic thread and a fresh readiness marker. | The new version opens that thread and the old update stops appearing as pending. |
