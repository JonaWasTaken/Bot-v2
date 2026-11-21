# 48 · Dependency and attribution review

[Project APEX ledger](../README.md) · Security, packaging and release

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## CUA notices

**Current state** The CUA generator merges root-scoped dependency graphs and reconciles license texts, checksums and CycloneDX components.

**Sources** [scripts/generate-cua-sbom.mjs](../../../../scripts/generate-cua-sbom.mjs) · [scripts/cua-linux-release.test.mjs](../../../../scripts/cua-linux-release.test.mjs) · [NOTICE](../../../../NOTICE) · [LICENSING.md](../../../../LICENSING.md) · [third_party/cua-driver/SBOM.cdx.json](../../../../third_party/cua-driver/SBOM.cdx.json) · [third_party/cua-driver/THIRD_PARTY_NOTICES.md](../../../../third_party/cua-driver/THIRD_PARTY_NOTICES.md)

**Dependencies** APEX-01-01

**Risk** A shipped binary can be absent from the notice inventory or attributed to the wrong revision.

**Risk level** High

**Automated verification** In a disposable copy, run `scripts/generate-cua-sbom.mjs` with its required reviewed CUA graphs, metadata and license inputs. Diff the generated inventory and notices and run `corepack pnpm exec vitest run scripts/cua-linux-release.test.mjs` for archive integrity.

**Manual verification** Compare the pinned CUA source, synthetic package inventory and generated notices in an offline review directory.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-48-01 | Reconcile the CUA package set across notices and SBOM | Join generated CycloneDX components to the licensed registry package table by package and version. | Every shipped registry package has one matching license record and discrepancies are listed. |
| APEX-48-02 | Check source and license hashes independently | Compare the pinned upstream CUA license and Inter font text against the reviewed inputs. | Both checksums match and one changed-byte control is detected. |
| APEX-48-03 | Distinguish build dependencies from unrelated workspace crates | Compare the two root-scoped graphs with the package inventory selected for the executable. | The report identifies build dependencies and contains no dependency solely enabled by another workspace root. |
| APEX-48-04 | Verify complete notice text in staged desktop output | Inspect a disposable installer payload and open its bundled notices offline. | All referenced license texts are readable and their versions agree with the SBOM. |
| APEX-48-05 | Trace a CUA version bump through all inventory outputs | Simulate a proposed upstream version change in a disposable review copy. | The report identifies every stale version across source pins, notices and component metadata. |

## Windows browser bundle

**Current state** The Windows browser vendor builder pins source, patch, toolchain and target and verifies staged output identity. Existing case “pins the released base, toolchain, vendor revision and exact patch bytes”.

**Sources** [scripts/build-windows-browser-vendor.mjs](../../../../scripts/build-windows-browser-vendor.mjs) · [scripts/build-windows-browser-vendor.test.mjs](../../../../scripts/build-windows-browser-vendor.test.mjs) · [.github/workflows/browser-vendor-windows.yml](../../../../.github/workflows/browser-vendor-windows.yml)

**Dependencies** APEX-01-01

**Risk** A vendor binary that matches a filename can still differ from its reviewed source or patch.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run scripts/build-windows-browser-vendor.test.mjs`.

**Manual verification** Compare staged fixture metadata with the pinned Windows vendor source and expected output manifest.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-48-06 | Check the reviewed source archive before building | Change one byte of a disposable archive copy while retaining its name. | Verification refuses it before producing a staged browser. |
| APEX-48-07 | Match the patch digest to the reviewed vendor tag | Compare clean and deliberately outdated local patch metadata. | Only the expected patch bytes satisfy the pinned vendor revision. |
| APEX-48-08 | Record the exact Windows browser build inputs | Produce an offline comparison manifest of the pinned toolchain, source tag, target and patch hash. | Two identical inputs yield the same four provenance fields. |
| APEX-48-09 | Reject a candidate with stale provenance beside correct binary bytes | Pair a copied candidate with metadata from another fixture revision. | Verification refuses staging and names the mismatched identity. |
| APEX-48-10 | Keep partial output out of the reviewed vendor directory | Interrupt a disposable vendor preparation before final validation. | The reviewed directory retains its previous complete inventory and no partial candidate is accepted. |

## Native dependencies

**Current state** The packaged-native test compares bundled server loads, npm manifest pins and staged native package trees. Existing case “finds the Data engine, chart rendering and 1Password loads in the server”.

**Sources** [scripts/bundle-server.mjs](../../../../scripts/bundle-server.mjs) · [scripts/packaged-native-modules.test.mjs](../../../../scripts/packaged-native-modules.test.mjs) · [pnpm-lock.yaml](../../../../pnpm-lock.yaml)

**Dependencies** APEX-01-03

**Risk** Development dependencies can mask missing native modules in the redistributed desktop package.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run scripts/packaged-native-modules.test.mjs`.

**Manual verification** Open the extracted OSS package manifest and match its native module tree to the frozen lockfile.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-48-11 | Match each dynamically required native package to its runtime pin | Enumerate native loads from the bundled server and compare with staged metadata. | Each required package has one compatible declared exact version. |
| APEX-48-12 | Identify an architecture-mismatched native module | Place a known different-architecture fixture binary in a disposable package copy. | The packaging gate flags the specific module and target before launch acceptance. |
| APEX-48-13 | Verify chart and data natives outside developer resolution | Launch the extracted fixture package with repository module lookup unavailable. | A synthetic chart and data query both produce their expected outputs. |
| APEX-48-14 | Account for optional platform-specific natives | Produce manifests for two desktop targets from their staged trees. | Each has its target's required modules and explicitly identifies legitimate platform differences. |
| APEX-48-15 | Keep lockfile changes attributable to shipped payloads | Compare a controlled lockfile update with the extracted runtime inventories. | The report identifies changed shipped module versions separately from development-only changes. |

## Mac architecture

**Current state** Mac thinning reads Mach-O headers and stages a requested architecture without altering the source binary. Existing case “stages one slice of a universal source and leaves the source whole”.

**Sources** [scripts/mac-thin.mjs](../../../../scripts/mac-thin.mjs) · [scripts/mac-thin.test.mjs](../../../../scripts/mac-thin.test.mjs)

**Dependencies** APEX-01-17

**Risk** A universal source binary can be overwritten while staging a single-architecture package.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run scripts/mac-thin.test.mjs`.

**Manual verification** Inspect the Mach-O headers and hashes in a disposable Mac staging directory.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-48-16 | Preserve the universal source while extracting arm64 | Stage an arm64 package from a two-slice fixture binary. | The staged binary has only arm64 and the source hash remains identical. |
| APEX-48-17 | Pass through a correct single-architecture input | Stage an x64-only fixture for its matching target. | Output bytes match the source and its executable mode is retained. |
| APEX-48-18 | Reject a missing requested slice before producing a candidate | Request arm64 from an x64-only fixture. | The check identifies the missing architecture and leaves no accepted staged file. |
| APEX-48-19 | Identify native files by header rather than extension | Mix a Mach-O helper without an extension and a text file named like a binary. | Only the actual Mach-O receives architecture processing. |
| APEX-48-20 | Reconcile nested helpers with the package target | Inspect the staged app executable, browser helper and CUA helper together. | Every required native executable contains the package's target architecture. |
