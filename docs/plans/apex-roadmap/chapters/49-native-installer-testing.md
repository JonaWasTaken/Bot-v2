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

**Risk level** High

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

**Current state** The Ubuntu 24.04 workflow builds DEB, RPM and AppImage from staged CUA, checks packaged smoke logs and prepares six versioned and stable artifact names with SHA-256 digests.

**Sources** [scripts/smoke-linux-package.mjs](../../../../scripts/smoke-linux-package.mjs) · [scripts/verify-linux-package.mjs](../../../../scripts/verify-linux-package.mjs) · [.github/workflows/package-linux.yml](../../../../.github/workflows/package-linux.yml) · [scripts/run-linux-package-smoke.mjs](../../../../scripts/run-linux-package-smoke.mjs)

**Dependencies** APEX-01-03

**Risk** An incomplete build lane can hand off a mislabeled Linux package or conceal a display backend that failed its smoke.

**Risk level** High

**Automated verification** Build the package on a disposable Linux runner, run `node scripts/verify-linux-package.mjs` on its release directory and exercise `scripts/smoke-linux-package.mjs` with the packaged fixture.

**Manual verification** Start each candidate in a disposable Linux desktop session and inspect the actual packaged window and local response.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-06 | Verify packaged X11 readiness with an empty desktop | Use the Xvfb fixture with no top-level windows and start the packaged renderer through its normal entry point. | The X11 diagnostic distinguishes an empty display from an unavailable renderer and the installed preload and health probes still pass. |
| APEX-49-07 | Verify the packaged Wayland backend handshake | Run the supported Wayland plus XWayland smoke and inspect the fixture CUA invocation log and health report. | The invocation carries the expected Wayland enable flag, the portal/libei fixture probe passes, and the renderer-ready marker belongs to that package. |
| APEX-49-08 | Keep Linux package failures diagnosable after CI cleanup | Inject one fixture renderer launch failure after package verification and collect the failure-only diagnostic artifact under the workflow's configured glob. | The retained archive includes the failing launch marker and fixture log from that run. The candidate is ineligible for handoff. |
| APEX-49-09 | Verify the bundled browser from the installed Linux build | Run the package-linux browser check under the supported Ubuntu sandbox using the installed DEB resource path and a loopback target. | The browser reports the reviewed bundle from that package. Removing it makes the build gate fail before handoff. |
| APEX-49-10 | Reconcile the Linux build's stable and versioned file names | Generate the DEB, RPM and AppImage with the release workflow's stable aliases and compare the six-entry SHA-256 manifest with those bytes. | Each of the three stable artifacts has its matching versioned digest and the accepted bundle identifies the checked-out commit. |

## Mac package

**Current state** Mac architecture selection defaults to both targets and requires an explicit partial-build choice for a subset. Existing case “defaults to both packaging targets”.

**Sources** [scripts/cua-mac-arches.mjs](../../../../scripts/cua-mac-arches.mjs) · [scripts/cua-mac-arches.test.mjs](../../../../scripts/cua-mac-arches.test.mjs) · [electron-builder.yml](../../../../electron-builder.yml) · [.github/workflows/release.yml](../../../../.github/workflows/release.yml) · [scripts/mac-thin.mjs](../../../../scripts/mac-thin.mjs)

**Dependencies** APEX-01-03

**Risk** A Mac package can be valid for one architecture while advertising support for both.

**Risk level** High

**Automated verification** Run `corepack pnpm exec vitest run scripts/cua-mac-arches.test.mjs` and run the row on a disposable Mac of each required architecture with the matching packaged binary.

**Manual verification** Launch the matching staged app on disposable Intel and Apple Silicon runners and inspect each executable's architecture.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-11 | Boot the Apple Silicon package natively | Launch the arm64 candidate from its installed app bundle and open fixture chat. | App, packaged server and required helpers run for the expected architecture and the renderer settles. |
| APEX-49-12 | Boot the Intel package on its target | Repeat the installed workflow on an x64 Mac fixture. | The x64 renderer, preload and backend serve one synthetic turn. |
| APEX-49-13 | Distinguish partial-architecture builds from release candidates | Build one declared partial fixture and one complete target matrix. | Only the complete matrix is eligible for a dual-architecture release record. |
| APEX-49-14 | Verify staged app signatures without publishing | Inspect the candidate's required signatures on a disposable Mac runner using the intended release-signing evidence. | The report ties signature verification results to the exact app hash and identifies any unavailable signing evidence. |
| APEX-49-15 | Exercise the installed app from a relocated Applications path | Copy the fixture app through its supported install flow and reopen an existing profile. | Helper resolution stays within the installed bundle and the profile opens without a missing executable. |

## Windows update and repair handoff

**Current state** The updater distinguishes staged packages, automatic checks and explicit install outcomes. The Windows release workflow creates an NSIS installer on a native runner.

**Sources** [electron/updater-coordinator.mjs](../../../../electron/updater-coordinator.mjs) · [electron/updater-coordinator.node-test.mjs](../../../../electron/updater-coordinator.node-test.mjs) · [electron/updater-test-fixture.mjs](../../../../electron/updater-test-fixture.mjs) · [.github/workflows/package-win.yml](../../../../.github/workflows/package-win.yml) · [electron-builder.yml](../../../../electron-builder.yml)

**Dependencies** APEX-01-17

**Risk** Treating a staged update as installed can leave the Windows user on a broken or unexpected version.

**Risk level** High

**Automated verification** Use the updater coordinator fixtures and a local-only update feed on a disposable Windows x64 runner. Collect the staged installer hash, attempt record and actual replacement executable version.

**Manual verification** Stage two synthetic Windows versions. Observe the installed desktop before, during and after the installer handoff; reopen an existing synthetic profile afterward.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-49-16 | Bind the Windows staged card to the intended NSIS installer | Stage a fixture update and inspect its expected hash before invoking install. | The displayed version, staged installer digest and requested install target all agree. |
| APEX-49-17 | Reject corrupt Windows update bytes before launch | Change one byte in the local test installer after its metadata has been accepted. | The installer process never starts and the previous desktop still opens its fixture chat. |
| APEX-49-18 | Keep a cancelled Windows install recoverable | Simulate the documented Windows installer refusal or cancellation after the desktop requests handoff. | The old version remains launchable and the update UI reports the correct interrupted state. |
| APEX-49-19 | Detect an old Windows executable after an apparent update | Return a completed handoff while deliberately starting the original fixture executable. | The version/ready check detects the old build and cannot mark the update successful. |
| APEX-49-20 | Preserve the same Windows workspace after a successful update | Upgrade the disposable installed profile across two synthetic versions and reopen a stored note. | The new executable reports its expected version and opens the original task ID and unchanged note bytes. |
