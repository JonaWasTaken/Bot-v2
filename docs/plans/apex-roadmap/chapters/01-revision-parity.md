# 01 · Revision parity

[Project APEX ledger](../README.md) · Architecture and infrastructure

The twenty mission numbers and goals follow the [original chapter](../../2026-11-21-revision-parity.md). Evidence below comes from the [recorded sprint](../../2026-11-21-first-cycle.md), its two trial files and the native Windows job. “Verified” applies to the historical measurement described in that row. “Integrated” also requires the implementation commit in the ancestry of the planning baseline.

## Revision identity

**Current state** The sprint recorded release 0.1.175, its upstream ancestor, the starting fork revision and the upstream tip of that audit.

**Sources** [package.json](../../../../package.json) · [docs/plans/2026-11-21-oss-baseline.md](../../../../docs/plans/2026-11-21-oss-baseline.md) · [docs/plans/2026-11-21-first-cycle.md](../../../../docs/plans/2026-11-21-first-cycle.md)

**Dependencies** None

**Risk** A mutable branch name makes later comparisons irreproducible.

**Automated verification** Resolve the recorded objects with git rev-parse or the recorded upstream tag/ref in a disposable comparison checkout. Compare package version to the release record.

**Manual verification** Read the revision and architecture section and match every compared run to its revision before interpreting a result.

**Completion evidence** The sprint records e5490f70 as ancestor, e99ea7af as fork start, 1abccdef as upstream-at-audit and 7a3d80c9 as the release commit. The full IDs are in the linked sprint record. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-01 | Identify the four revisions used in the sprint comparison | Resolve the release tag, merge base, fork start and upstream-at-audit commit, retaining the full SHAs. | Four distinct roles resolve to full revision identifiers and each paired result names its arm. |

## OSS identity

**Current state** The OSS entrypoint defaults to the open-source edition and an empty optional-feature list.

**Sources** [server/enterprise.ts](../../../../server/enterprise.ts) · [server/enterprise.test.ts](../../../../server/enterprise.test.ts) · [scripts/control-omb.ts](../../../../scripts/control-omb.ts)

**Dependencies** APEX-01-01

**Risk** Edition-dependent behavior invalidates a comparison if the two arms load different adapters.

**Automated verification** Query the edition state from the explicit URL of each isolated OSS launcher and assert the edition and feature list.

**Manual verification** Read the returned fixture URL and edition payload together in the sprint record.

**Completion evidence** The disposable sprint fixture returned {"edition":"oss","features":[]}. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-02 | Prove the edition of the comparison fixture | Launch an OSS-only checkout with a fresh home and inspect its edition response. | The fixture returns edition oss and zero optional features. |

## Packaged boot

**Current state** The packaged smoke exercises an extracted server outside repository dependency lookup.

**Sources** [scripts/bundle-server.mjs](../../../../scripts/bundle-server.mjs) · [scripts/smoke-packaged-server.mjs](../../../../scripts/smoke-packaged-server.mjs) · [package.json](../../../../package.json)

**Dependencies** APEX-01-02

**Risk** A developer-only dependency can make a source launch succeed while the installed backend fails.

**Automated verification** Run corepack pnpm test:packaged-server from each built OSS checkout with the pinned pnpm available to nested scripts.

**Manual verification** Inspect the extracted launch path, command result and local-trust probe in each smoke log.

**Completion evidence** The first run stopped at a missing nested pnpm executable. The recorded shim-assisted reruns passed on fork and combined bundles. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-03 | Establish production bundle boot on both comparison builds | Build each OSS bundle and exercise CLI, MCP, backup and local trust in a new profile. | Both extracted bundles pass their public entry-point checks using only their shipped runtime. |

## Tool-effect baseline

**Current state** The loopback chat fixture connects a structured write_file call to one fixed disposable artifact.

**Sources** [server/drivers/openai-chat.ts](../../../../server/drivers/openai-chat.ts) · [server/openai-tools.e2e.test.ts](../../../../server/openai-tools.e2e.test.ts)

**Dependencies** APEX-01-02

**Risk** Counting success prose as a write can certify a nonexistent artifact.

**Automated verification** Run corepack pnpm exec vitest run server/openai-tools.e2e.test.ts at both historical source points.

**Manual verification** Inspect the disposable file and the corresponding terminal tool record in each branch of the fixture.

**Completion evidence** The workflow suite was among the six files passing 37 cases on both upstream ancestor and fork baseline. The sprint records the grouped result, without a separate per-file count. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-04 | Establish approved, denied and cancelled tool effects | Compare the actual fixture file with the tool card and final turn in the same scripted branch. | An allowed write produces the expected bytes. Denial, cancellation before dispatch and text-only replies produce no write. |

## Data analysis baseline

**Current state** The data e2e fixture covers loading, querying, paging, rendering and exporting a synthetic dataset.

**Sources** [server/data/tools.ts](../../../../server/data/tools.ts) · [server/data/data.e2e.test.ts](../../../../server/data/data.e2e.test.ts) · [shared/data-surface.ts](../../../../shared/data-surface.ts)

**Dependencies** APEX-01-02

**Risk** A rendered table alone can mask a broken query or unusable file export.

**Automated verification** Run corepack pnpm exec vitest run server/data/data.e2e.test.ts against both arms with the scoped fixture capability.

**Manual verification** Open the fixture export and compare its values with the rendered table and expected dataset.

**Completion evidence** The data e2e fixture passed within the same paired 37-case workflow run recorded in the sprint. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-05 | Establish a reproducible file-analysis result | Run the same fixture dataset on both revisions and compare query values and exported content. | Each arm returns the expected fixture values and the export can be read independently. |

## Local answer format

**Current state** The recorded chat driver trials use fresh conversations and the same loopback Qwen3 8B model.

**Sources** [evals/runners/local-answer-comparison.mjs](../../../../evals/runners/local-answer-comparison.mjs) · [docs/plans/2026-11-21-local-answer-trials.csv](../../../../docs/plans/2026-11-21-local-answer-trials.csv)

**Dependencies** APEX-01-02

**Risk** Treating a correct time as format obedience hides an instruction-following limitation.

**Automated verification** Run the local-answer comparison runner with a pinned local model, explicit loopback endpoint and three repetitions per arm. Score the general task rows.

**Manual verification** Read the six general replies and compare the requested answer-only format with the literal answer.

**Completion evidence** All six arithmetic answers included the correct 11:15 and extra text. The measurement passed its recording criterion, with zero exact-format passes for this task. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-06 | Establish direct-answer content and format baselines | Ask the fixed meeting-end arithmetic question three times on each arm with tools and paid fallback disabled. | All six observations record correct-content and exact-format verdicts separately. |

## Source reconciliation

**Current state** The same local-answer runner supplies an immutable evidence packet containing a superseding amendment.

**Sources** [evals/runners/local-answer-comparison.mjs](../../../../evals/runners/local-answer-comparison.mjs) · [docs/plans/2026-11-21-local-answer-trials.csv](../../../../docs/plans/2026-11-21-local-answer-trials.csv)

**Dependencies** APEX-01-06

**Risk** A plausible carrier or price can come from an obsolete amendment.

**Automated verification** Score the source-reconciliation rows emitted by the local-answer comparison runner against the pinned BETA 222 A1 B2 target.

**Manual verification** Compare each output with the fixed packet and amendment, including both cited record IDs.

**Completion evidence** All six reconciliation responses selected the current carrier and total and met the exact format. The individual outputs are in the sprint CSV. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-07 | Establish source-reconciliation accuracy | Compare three fresh local conversations per arm using the identical source packet and grading rule. | Record the selected carrier, price and source IDs and an exact-format verdict in all six trials. |

## Code-review baseline

**Current state** The code-review prompt asks for the appropriate comparison operator without running generated code.

**Sources** [evals/runners/local-answer-comparison.mjs](../../../../evals/runners/local-answer-comparison.mjs) · [docs/plans/2026-11-21-local-answer-trials.csv](../../../../docs/plans/2026-11-21-local-answer-trials.csv)

**Dependencies** APEX-01-06

**Risk** An explanation can conceal noncompliance with a required machine-readable answer.

**Automated verification** Use the local-answer comparison runner's code-review case and compare the exact-answer flags with the stored reply strings.

**Manual verification** Review the six operators and the additional surrounding text in the raw CSV.

**Completion evidence** Six of six identified strict equality and six added explanation. The sprint identified a format issue on both revisions. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-08 | Establish non-mutating code-review accuracy | Run the strict-equality question in three fresh chats per revision and compare answer-only output with substantive correctness. | Six trials report both operator correctness and format compliance without executing model output. |

## Notebook provenance

**Current state** The combined branch pairs search matches with their notebook rather than treating a filename as globally unique.

**Sources** [server/recall.ts](../../../../server/recall.ts) · [server/recall.test.ts](../../../../server/recall.test.ts) · [server/cloud-team-private.e2e.test.ts](../../../../server/cloud-team-private.e2e.test.ts) · [evals/runners/notebook-reader.mjs](../../../../evals/runners/notebook-reader.mjs) · [docs/plans/2026-11-21-notebook-reader-trials.jsonl](../../../../docs/plans/2026-11-21-notebook-reader-trials.jsonl)

**Dependencies** APEX-01-02

**Risk** Misattribution can omit a relevant fact or reveal another member's personal memory.

**Automated verification** Run the recall and team-private fixture suites and the independent loopback reader's collision, distinct-file and member-only cases.

**Manual verification** Compare the actual driver supplement and labeled personal/team answers on both revisions.

**Completion evidence** The independent reader improved from 0/6 to 6/6 on same-path topics. Both controls remained 6/6 per arm. Combined implementation 985d0fdd5 is an ancestor of the ledger base via PR 4. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #2](https://github.com/JonaWasTaken/Bot-v2/pull/2) · [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Integrated

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-09 | Establish same-path recall provenance across notebooks | Exercise same-name personal and team topics, alias collisions, a member-only control and global recall limits. | Both authorized facts appear exactly once, other-member content stays absent and the four-note ceiling holds. |

## Reviewed deletion

**Current state** The reviewed memory route accepts a content digest and the desktop reloads replacements when it receives a conflict.

**Sources** [server/memory-store.ts](../../../../server/memory-store.ts) · [server/routes/bot-memory.ts](../../../../server/routes/bot-memory.ts) · [server/memory-routes.test.ts](../../../../server/memory-routes.test.ts) · [src/components/bot-panel/MemoryPage.team.test.ts](../../../../src/components/bot-panel/MemoryPage.team.test.ts)

**Dependencies** APEX-01-02

**Risk** An unconditional delete can destroy another editor's later content.

**Automated verification** Run corepack pnpm exec vitest run server/memory-routes.test.ts src/components/bot-panel/MemoryPage.team.test.ts against the original and combined branches.

**Manual verification** Inspect the changed fixture note and journal before and after reviewing the replacement.

**Completion evidence** Two old-shape reproductions deleted newer content. Guarded requests returned 409 and reviewed retries returned 200. Combined implementation 70001de68 is an ancestor of the ledger base via PR 4. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #1](https://github.com/JonaWasTaken/Bot-v2/pull/1) · [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Integrated

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-10 | Establish concurrent-delete behavior for topics and logs | Race the reviewed digest against a later write, inspect the journal, then retry after re-reading the replacement. | Stale requests return 409 without byte or journal loss and a newly reviewed retry returns success with a deletion record. |

## Connection identity

**Current state** The desktop connection sheet associates a probe with its reviewed address and pairing code.

**Sources** [src/components/PlaceAddSheet.tsx](../../../../src/components/PlaceAddSheet.tsx) · [src/components/PlacesRail.test.ts](../../../../src/components/PlacesRail.test.ts) · [scripts/verify-server-connection.mjs](../../../../scripts/verify-server-connection.mjs)

**Dependencies** APEX-01-02

**Risk** A healthy first target can incorrectly authorize a different second target.

**Automated verification** Run the PlaceAddSheet regression cases in src/components/PlacesRail.test.ts and count mock IPC calls in an isolated Electron profile.

**Manual verification** Change the fixture address and code independently while the spinner is visible, then inspect the displayed target and dispatch count.

**Completion evidence** The sprint's synthetic IPC run dispatched zero while pending and one after success. The combined change a766671c1 and the PR 3 feature head are both ancestors of the ledger base. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #3](https://github.com/JonaWasTaken/Bot-v2/pull/3) · [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Integrated

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-11 | Establish identity of the target approved for connection | Delay an Electron probe while changing each field and compare the submitted inputs with the successful probe. | Pending changed fields dispatch zero connections and a matching successful check permits exactly one. |

## Automation baseline

**Current state** The offline coordination world holds a worker busy and snapshots the deferred occurrence before release.

**Sources** [server/routine-execution.ts](../../../../server/routine-execution.ts) · [evals/scenarios/routine-deferral.json](../../../../evals/scenarios/routine-deferral.json) · [evals/runners/coordination-world.ts](../../../../evals/runners/coordination-world.ts)

**Dependencies** APEX-01-02

**Risk** An early wake can execute twice or hide a lost run behind a busy worker.

**Automated verification** Run corepack pnpm eval --scenario routine-deferral for each recorded revision and inspect the frozen run snapshot.

**Manual verification** Confirm the queued state, deferred flag and final completion in that order.

**Completion evidence** All six offline behavior scenarios, including routine-deferral, passed on each of the three source revisions. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-12 | Establish ordinary automation behind a busy target | Run the routine-deferral scenario on upstream ancestor, fork baseline and combined code. | The queued run has a visible deferred stamp and completes after the worker is released on all three arms. |

## Handoff baseline

**Current state** The dispatch scenario sends a new message while the Chief already has an outstanding assignment.

**Sources** [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [evals/scenarios/dispatch-supersede.json](../../../../evals/scenarios/dispatch-supersede.json) · [evals/runners/coordination-world.ts](../../../../evals/runners/coordination-world.ts)

**Dependencies** APEX-01-02

**Risk** Conflating an independent message with cancellation can abandon accepted work.

**Automated verification** Run corepack pnpm eval --scenario dispatch-supersede against each comparison revision.

**Manual verification** Inspect run IDs, turn order and retained handoff edges in the offline report.

**Completion evidence** The dispatch scenario passed in the six-case offline suite on all three recorded revisions. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-13 | Establish handoff lineage during an independent new turn | Replay the scripted dispatch and inspect the parent assignment, new turn and handoff tree. | The new turn runs without cancelling the outstanding assignment or becoming its queued follow-up. |

## Browser baseline

**Current state** The real-CDP action suite drives fixture pages in a temporary browser profile.

**Sources** [server/browser/cdp/actions.ts](../../../../server/browser/cdp/actions.ts) · [server/browser/cdp/s4-actions.e2e.test.ts](../../../../server/browser/cdp/s4-actions.e2e.test.ts)

**Dependencies** APEX-01-02

**Risk** A browser acknowledgment without a page observation can falsely report success.

**Automated verification** Set OMB_CDP_CHROME to the fixture Chrome executable and run corepack pnpm exec vitest run server/browser/cdp/s4-actions.e2e.test.ts.

**Manual verification** Compare the resulting page state with the selected control and action in the fixture output.

**Completion evidence** The sprint includes the real-CDP suite in its combined 261 passing cases across 18 files. It records no separate count for this suite. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-14 | Establish a baseline for actual browser actions | Run the real-CDP conformance fixture with an explicit local Chrome executable. | Targeted fixture actions and resulting page observations agree in the isolated profile. |

## Desktop baseline

**Current state** The desktop benchmark records visible chat, reload and renderer RSS from synthetic browser profiles.

**Sources** [scripts/bench-desktop.ts](../../../../scripts/bench-desktop.ts) · [scripts/testing/bench-desktop-page.ts](../../../../scripts/testing/bench-desktop-page.ts) · [docs/plans/2026-11-21-first-cycle.md](../../../../docs/plans/2026-11-21-first-cycle.md)

**Dependencies** APEX-01-02

**Risk** Host load, model inference and a single large-profile run can distort apparent performance.

**Automated verification** Use corepack pnpm bench:desktop --only bundle,start with an explicit fixture browser and a fresh JSON output on each alternating run.

**Manual verification** Inspect the interleaving order and report host load alongside the measured ranges.

**Completion evidence** Median first useful conversation was 215 ms before and 207 ms combined. Median reload was 79 ms on both. The host still had concurrent baseline tests, limiting inference. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-15 | Establish comparable startup and reload budgets | Alternate three fresh launches per revision after local inference ends and collect two reloads per launch. | Record machine, seed, median and range for three starts and six reloads per revision. |

## Interrupted effect

**Current state** The recorded Electron smoke expects idle while the runtime can start a continuation after child replacement.

**Sources** [electron/server-supervisor.mjs](../../../../electron/server-supervisor.mjs) · [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [scripts/verify-server-recovery.mjs](../../../../scripts/verify-server-recovery.mjs)

**Dependencies** APEX-01-03, APEX-01-04

**Risk** An interrupted turn can repeat a write or appear idle while unfinished work resumes.

**Automated verification** Extend and run node scripts/verify-server-recovery.mjs with an inert receipt sink and assert effect count and terminal state at each fault boundary.

**Manual verification** Inspect the isolated Electron transcript across the crash, then exercise the explicit retry and compare its receipt with the original.

**Completion evidence** The sprint reproduced the busy-state assertion failure at line 194 on the combined tree and recorded failure on both earlier source points. The counted-effect acceptance is outstanding. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** Unfiled

**Status** Failed or requires rework

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-16 | Establish working restart semantics for an interrupted effect | Hold a counted fixture write between effect and settlement, replace the child and reconcile retry or continuation with durable evidence. | Exactly one consequential effect, one intelligible final state and a demonstrated explicit retry survive recovery. |

## Windows installed startup

**Current state** The sprint used a native Windows runner to install NSIS and check the installed renderer's smoke marker.

**Sources** [.github/workflows/package-win.yml](../../../../.github/workflows/package-win.yml) · [electron/main.mjs](../../../../electron/main.mjs) · [electron-builder.yml](../../../../electron-builder.yml) · [scripts/smoke-packaged-server.mjs](../../../../scripts/smoke-packaged-server.mjs)

**Dependencies** APEX-01-03

**Risk** Package extraction or backend boot alone misses installer and preload faults.

**Automated verification** Run the native packaging recipe and assert the installed executable's renderer-ready marker after a silent fixture installation.

**Manual verification** Inspect the executable path and the marker's actual preload, location, health and capability fields in the native job.

**Completion evidence** One native Windows x64 install and first launch passed in the linked sprint job. Keyboard layouts, in-place update and soak remain separate missions. [Native job](https://github.com/JonaWasTaken/Bot-v2/actions/runs/44916689536/job/136883724865) [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** [Fork PR #4](https://github.com/JonaWasTaken/Bot-v2/pull/4)

**Status** Verified

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-17 | Establish native installed Windows startup | Build OSS-only on Windows x64, install into a clean runner and launch the installed binary in a fresh profile. | The actual renderer confirms preload, loopback health, owner capability and installed location. |

## First useful answer

**Current state** The sprint captured submit-to-settlement durations, including generation and polling, without first-visible-answer timing.

**Sources** [src/lib/live-events.ts](../../../../src/lib/live-events.ts) · [evals/runners/local-answer-comparison.mjs](../../../../evals/runners/local-answer-comparison.mjs) · [docs/plans/2026-11-21-local-answer-trials.csv](../../../../docs/plans/2026-11-21-local-answer-trials.csv)

**Dependencies** APEX-01-06

**Risk** Treating a heartbeat, reasoning indicator or polling completion as answer text skews latency.

**Automated verification** Add a first-visible-text observation to the loopback runner and check scripted empty and interrupted streams against its timing output.

**Manual verification** Compare the marked event against a recording of the first visible answer in the same fixture window.

**Completion evidence** No first-useful-text evidence is recorded. The sprint's 22.4 s versus 24.6 s medians refer to settlement only. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** Unfiled

**Status** Not started

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-18 | Establish time to first useful ordinary-chat text | Timestamp first nonempty visible answer via SSE and final settlement in at least three matched trial pairs. | Every pair includes both times, model, tokens or missing reason, empty-delta count and interruption status. |

## Optional delegation

**Current state** The existing live lane requests delegation explicitly and the offline dispatch scenarios establish mechanics.

**Sources** [evals/live/scenarios/live-delegation-lane.json](../../../../evals/live/scenarios/live-delegation-lane.json) · [evals/live/live-suite.ts](../../../../evals/live/live-suite.ts) · [evals/scorers/assertions.ts](../../../../evals/scorers/assertions.ts)

**Dependencies** APEX-01-13

**Risk** Unequal budgets or telling the model to delegate can create an artificial team advantage.

**Automated verification** Score frozen paired artifacts and dispatch receipts. Run the model comparison only with equivalent approved fixture providers and a recorded budget.

**Manual verification** Blind-grade the outputs before inspecting team labels and reconcile the resulting score and cost with raw traces.

**Completion evidence** The recorded sprint contains coordination-mechanics evidence only. No matched optional-team quality or cost result is available. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** Unfiled

**Status** Not started

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-19 | Establish the value of optional delegation | Compare solo and optional team on identical artifacts using matched model, tool and total token budgets and blinded grading. | Report accepted artifacts, costs, cancelled and wasted dispatches, elapsed times and variation together. |

## Release authorization

**Current state** The sprint ran targeted request-auth, permission, unattended, cloud-computer and server-list checks.

**Sources** [server/request-auth.ts](../../../../server/request-auth.ts) · [server/request-auth.test.ts](../../../../server/request-auth.test.ts) · [server/routine-unattended-approval.e2e.test.ts](../../../../server/routine-unattended-approval.e2e.test.ts) · [server/cloud-computer-tools.test.ts](../../../../server/cloud-computer-tools.test.ts) · [SECURITY.md](../../../../SECURITY.md)

**Dependencies** APEX-01-02, APEX-01-04

**Risk** Focused green tests can miss a cross-member exposure or an unreviewed consequential operation.

**Automated verification** Run the mapped tests on disposable identities and inert sinks, collecting both allowed and denied outcomes for each required cell.

**Manual verification** Use the isolated desktop as two synthetic members and review the coverage matrix and SECURITY.md with an independent release reviewer.

**Completion evidence** The sprint recorded 136 passing focused tests across five files. The cross-journey release gate and independent risk review remain open. [Sprint evidence](../../2026-11-21-first-cycle.md)

**GitHub** Unfiled

**Status** Not started

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-01-20 | Establish authorization confidence across release-critical journeys | Enumerate desktop, hosted-session fixture and unattended boundaries, map every blocking case to a reproducible test and review the recorded risks. | Every enumerated blocker passes for the tested revision and excluded environments and remaining risks are visible. |
