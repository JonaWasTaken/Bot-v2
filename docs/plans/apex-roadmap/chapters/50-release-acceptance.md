# 50 · Release acceptance

[Project APEX ledger](../README.md) · Security, packaging and release

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Check matrix

**Current state** CI builds a platform and shard matrix with path filters and a separate aggregate verdict. Existing case “supersedes old PR checks but never cancels a running main or merge-queue run”.

**Sources** [.github/workflows/ci.yml](../../../../.github/workflows/ci.yml) · [scripts/ci-workflow.test.ts](../../../../scripts/ci-workflow.test.ts) · [server/data/charts.e2e.test.ts](../../../../server/data/charts.e2e.test.ts) · [server/data/chart-compiler.test.ts](../../../../server/data/chart-compiler.test.ts)

**Dependencies** APEX-01-01

**Risk** A path-filtered green check can omit an entire release-critical journey.

**Risk level** High

**Automated verification** Run `corepack pnpm exec vitest run scripts/ci-workflow.test.ts` for matrix construction. Evaluate the row against copied check results, and run the identified runtime fixture in each specified environment when a cell needs behavioral proof.

**Manual verification** Read the synthetic CI matrix beside the candidate revision, required platforms and executed job list.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-50-01 | Build a release coverage matrix by platform and user journey | Map startup, chat, file work, memory, approvals and recovery to their concrete fixture jobs. | Every journey/platform cell has passing evidence or a named exclusion that blocks an unconditional release claim. |
| APEX-50-02 | Distinguish skipped suites from successful gates | Feed a run missing one required shard to the report. | It shows incomplete coverage and never labels the full matrix green. |
| APEX-50-03 | Reconcile aggregate status with individual shard results | Simulate one failed shard beneath otherwise successful platform jobs. | The report names the failed shard and withholds a passing aggregate. |
| APEX-50-04 | Record environment-sensitive failures reproducibly | Repeat the sprint's weekly data-chart fixture in UTC and Europe/Copenhagen using identical source. | The report preserves both outcomes with timezone, runtime and expected versus actual intervals. |
| APEX-50-05 | Keep baseline regressions distinct from existing failures | Run the same failing fixture against pinned baseline and candidate commits. | Each failure is classified by paired evidence and neither arm's exclusions are hidden. |

## Windows packaged backend isolation

**Current state** The Windows workflow builds NSIS and the packaged-server smoke launches an extracted backend outside repository dependency lookup. The original sprint recorded one installed Windows renderer-ready marker.

**Sources** [.github/workflows/package-win.yml](../../../../.github/workflows/package-win.yml) · [electron-builder.yml](../../../../electron-builder.yml) · [electron/main.mjs](../../../../electron/main.mjs) · [scripts/bundle-server.mjs](../../../../scripts/bundle-server.mjs) · [scripts/smoke-packaged-server.mjs](../../../../scripts/smoke-packaged-server.mjs)

**Dependencies** APEX-01-03

**Risk** A Windows installer can appear healthy while running a development backend, missing a native module or binding the wrong profile.

**Risk level** High

**Automated verification** Build the OSS NSIS candidate in a disposable Windows x64 runner, stage and install it, then run the packaged-server checks and compare process paths, package hashes and readiness fields.

**Manual verification** From Start launch the installed fixture executable and inspect its actual child path, health marker, fresh profile and one ordinary local chat.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-50-06 | Verify the server binary belongs to the installed Windows package | Hide the source checkout from runtime lookup and launch through the candidate's Start entry. | The serving child resolves inside the installed product tree and its build identity matches the NSIS artifact. |
| APEX-50-07 | Load native modules from the Windows package payload | Open a known fixture dataset and render a chart with developer modules absent. | Both operations complete using the staged Windows native dependencies and return their expected data. |
| APEX-50-08 | Keep a second Windows test profile separate | Launch two supported isolated profiles alternately with distinct fixture chat markers. | Each installed-app launch reads its intended data root and no profile reports the other's marker. |
| APEX-50-09 | Restore a Windows backup into a clean installed profile | Back up a fixture note and conversation through the installed backend, then restore to a different temporary profile. | The restored client reads the exact note hash and original task ID and settles a new synthetic chat. |
| APEX-50-10 | Check edition identity from the installed executable | Compare OSS source, extracted server and installed renderer health for the exact Windows candidate. | All three identify the tested version and OSS feature set; a mismatched control fails packaging acceptance. |

## Promotion decision

**Current state** Release CI distinguishes complete green, partial coverage, missing runners and failing tests. Existing case “is green only when the gate passed and every platform's every vitest shard ran and passed”.

**Sources** [scripts/release-ci.mjs](../../../../scripts/release-ci.mjs) · [scripts/release-ci.test.ts](../../../../scripts/release-ci.test.ts) · [.github/workflows/promote-stable.yml](../../../../.github/workflows/promote-stable.yml) · [SECURITY.md](../../../../SECURITY.md) · [docs/plans/2026-11-21-oss-baseline.md](../../../../docs/plans/2026-11-21-oss-baseline.md)

**Dependencies** APEX-49-01, APEX-49-06, APEX-49-11

**Risk** A release decision based on a partial run can promote an untested desktop.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run scripts/release-ci.test.ts`.

**Manual verification** Review a dry-run release decision for the exact commit and fixture evidence without promoting any build.

**APEX-50-12 Risk level** Medium

**APEX-50-12 Risk** Misclassifying a missing runner delays triage while both measured outcomes already prevent release.

**APEX-50-14 Risk** A release could ship with a known cross-member disclosure or unrecoverable user-data loss.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-50-11 | Reject incomplete cross-platform CI evidence | Present a passing gate with only a subset of required platform shards. | The decision is partial and identifies every missing platform/shard. |
| APEX-50-12 | Distinguish runner unavailability from a product failure | Compare a fixture job that never ran with one reporting failed tests. | Both prevent full acceptance but carry different actionable reasons. |
| APEX-50-13 | Bind all release evidence to one candidate revision | Supply green fixture results for two different commits with similar metadata. | No mixed-commit set qualifies for acceptance. |
| APEX-50-14 | Require evidence for unresolved critical authorization and data-loss cases | Assemble the candidate's isolated auth, recovery and storage scenarios with their exact outcomes. | Any unresolved critical failure keeps the dry-run decision blocked and links the failed case. |
| APEX-50-15 | Investigate material renderer growth before acceptance | Compare candidate and pinned baseline gzip bundles built with identical dependencies and flags. | Any increase above the sprint's 2 percent threshold has a recorded investigation before the decision is approved. |

## Release notes

**Current state** The release feed validates its schema, orders versions, bounds retained entries and limits serialized size. Existing case “are valid, with their JSON Schema up to date”.

**Sources** [scripts/release-notes-feed.mjs](../../../../scripts/release-notes-feed.mjs) · [scripts/release-notes-feed.test.mjs](../../../../scripts/release-notes-feed.test.mjs) · [SECURITY.md](../../../../SECURITY.md)

**Dependencies** APEX-01-01

**Risk** Release notes can announce an unverified capability or omit a known shipping limitation.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run scripts/release-notes-feed.test.mjs`.

**Manual verification** Read the fixture release feed as a desktop user and match every candidate claim with its scoped evidence.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-50-16 | Reject malformed release entries in the local feed | Insert a candidate note missing one required schema field. | Validation names the field and leaves the existing valid feed unchanged. |
| APEX-50-17 | Keep the newest release and its update timestamp consistent | Insert, replace and reorder synthetic versions with controlled timestamps. | One entry per version remains and the newest valid version leads. |
| APEX-50-18 | Bound release metadata without dropping a current candidate | Add enough historical fixture notes to exceed count and size limits. | Only the oldest eligible entries are removed and the candidate remains readable. |
| APEX-50-19 | Tie user-visible claims to accepted release evidence | Draft notes for a feature with a passing isolated fixture and an unsupported-platform exclusion. | Each claim identifies the tested behavior and the exclusion is visible before release review. |
| APEX-50-20 | Publish a local release decision packet for independent review | Assemble test SHA, artifact hashes, install matrix, open risks and signed-off exclusions in a disposable report. | An independent reviewer can recompute the dry-run verdict from the packet without credentials, deployment or live data. |
