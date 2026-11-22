# Mission Control for TypeScript package research

From a bot's project folder, open the actions menu and choose **Mission Control**. Select a project conversation while preparing the mission. After approval, the source specialist reads the selected releases and the coordinator writes and verifies the report. Choose **Add report to** the named conversation to save its findings and file together. **Open conversation** takes you to the transcript, where the report opens as Markdown and its sources are available to follow-up questions.

Adding a report is an owner action on a completed mission. The server checks the saved revision, current project and conversation, reads the attachment and compares its byte length and SHA-256 with the verification receipt. It checks authority and membership again before appending. The message and its ID-only delivery receipt commit together in the conversation database. A retry reuses the original post. Removing the posted message leaves the mission's own report accessible in Mission Control. Archived or moved conversations cannot receive a new post from their former project.

Open a personal workspace, select a bot, open its profile, and choose **Details → Mission Control**. Enter an objective and choose **Prepare plan**. The planner can choose a shortlist, or the owner can enter package names explicitly. Review the packages, criterion, specialist and tool budget before choosing **Approve and start**. A bot can handle the complete mission itself.

The first workflow compares public npm releases for a TypeScript application, produces a Markdown recommendation, reads the attachment back, and checks the evidence. The two supported criteria are direct runtime dependency count and published unpacked size. Each candidate needs bundled type declarations and an eligible declared license to win. Ties stay visible.

## What landed in the fork

The baseline was the unchanged fork at `f0bf6f7cd2a85d0e25270be73dd69bef1799ebc1`, including its earlier reliability and desktop changes. Upstream's consolidation issue includes a September triage, later integration reports and unresolved proposals. We checked PR merge state, commit ancestry and the actual files in this checkout. [Upstream consolidation issue](https://github.com/milind-soni/OpenMausBot/issues/1559)

| Area | Finding in the baseline | Integration |
| --- | --- | --- |
| Tasks and boards | Bot projects and conversation tasks live in `Store`. The dated JSON board, proposed SQLite task core, alternate board UI, project check runner and routine graph PRs were closed without merging their branches. | A mission belongs to a bot and optionally one of its projects. Its execution uses existing assignments. [Dated board](https://github.com/milind-soni/OpenMausBot/pull/1202) · [Task core](https://github.com/milind-soni/OpenMausBot/pull/1288) · [Board UI](https://github.com/milind-soni/OpenMausBot/pull/1332) · [Project checks](https://github.com/milind-soni/OpenMausBot/pull/1331) · [Routine graphs](https://github.com/milind-soni/OpenMausBot/pull/1340) |
| Coordination and rooms | `RuntimeCoordinator` uses the assignment tree, inbox, receipts and event log in `runtime.db`. Existing room goals and chat handoffs have their own presentation. | Mission roots and children use the same enqueue, tick, report, settlement and cancellation paths. Private mission threads stay out of the chat handoff list. |
| Automation and recovery | Routine triggers, run health, handoff ticks, SQLite restart reconciliation and per-turn file checkpoints already exist. The schedule deduplication and runtime repair merge commits are ancestors of the baseline. | Existing ticks advance work only while the server is running. Workspace file checkpoints remain available to their original callers. [Schedule fix](https://github.com/milind-soni/OpenMausBot/pull/1558) · [Runtime repair](https://github.com/milind-soni/OpenMausBot/pull/1584) |
| Providers and permissions | The engine registry, one-off side jobs, spend gate, tool scopes, session enforcement and bot holds already exist. | A tool-free planner uses the selected bot's configured provider. Execution uses fixed, separately authorized operations. The owner approves the exact plan. |
| Desktop, files and memory | React consumes authenticated HTTP and a shared SSE stream. Electron exposes a restricted preload. Attachments and journaled bot memory have existing stores and controls. | Mission Control is a native bot-panel destination. It consumes real snapshots and events, downloads existing attachments and saves an owner-reviewed memory note through the existing journal. |

## Execution contract

The root assignment owns the original objective, effective objective, project, specialist, limits, approved plan version, request hash, stable attachment ID and sanitized state. A revision number fences stale owner commands. Each package has a logical step key stable across plan revisions. The write and verification steps have version-specific keys. Every admitted attempt receives its own assignment ID and links to the parent. The projection includes timestamps, prerequisites, attempt counts, measured calls, source observations, error messages and artifact receipts.

| Observable state | Condition and owner controls |
| --- | --- |
| Planning | A tool-free call can propose at most eight public names and one criterion. Explicit shortlists skip inference. |
| Awaiting approval | A validated plan is parked in the runtime. Approve, decline, revise or cancel. Approval authorizes the named registry reads and the single workspace attachment. |
| Running or verifying | Source reads can overlap. The report waits for every required source. The verifier waits for the saved report. Pause stops new admissions. Cancellation aborts supported operations and discards late results. |
| Paused | Resume continues from durable assignments. A changed plan requires another approval. |
| Partially completed or failed | An unmet condition retains its evidence. Retry an eligible failed step or revise the plan and limits. Prior verified source observations can be reused. |
| Completed | Every required step has a completed receipt, including the independent read of the stored artifact. |
| Cancelled | Declining or cancelling records the decision. A stale command cannot restart the mission. |

Each source worker fetches the latest package record and its version-pinned release over the existing public-page probe. The host fixes the destination, rejects redirects, caps response bytes, validates identity and compares the two observations. Counts include optional runtime dependencies without double counting. Source bodies, model reasoning, integration credentials and conversation histories stay out of mission records.

A single writer saves the report through the existing attachment mechanism. The verifier opens the file through its approved directory, compares its bytes to the comparison computed from retrieved observations, checks the citations and compares the digest with the write receipt. Downloads recheck the stored digest. A separate Markdown export captures partial progress, attempts, evidence and errors. The two registry requests corroborate release metadata from one publisher. The report states its measurement and eligibility limits.

The backend accepts only the supported operations in non-hosted personal workspaces without an active managed policy. It checks the owner or admin session, bot visibility, provider tool capability, current bot holds and each operation's tool scope. Read-only source assignments cannot choose command lines, file destinations or external services. The only optional planner context is the owner's named memory topic from the coordinator bot. At most 1,200 redacted characters enter the planner prompt. A proposed memory note requires a separate user save and uses the memory journal's conditional write.

Default limits are eight steps, dependency depth three, two participating bots, three concurrent children, one eligible retry per step, twelve tool calls, one planner call and a 60-second step deadline. The server bounds every configurable limit and allows up to five plan versions. The spend ledger records reported tokens and costs under the planning operation ID. The UI labels attempted calls separately from verified outputs.

On restart, completed children and pending approvals retain their state. A registered read may be repeated after interruption. Retrying an attachment write uses the same upload identity. An interrupted planner call parks for manual reconciliation. SQLite busy or locked settlement retries the receipt without invoking the external operation again. A retry approval identifies the failed assignment that it may replace.

## Live comparison on 21 November 2026

Both paths ran in disposable homes with the same model, objective, bots and configured permissions. The coordinator had three permitted tools, coordination, waiting and attachments. The research specialist could only use the waiting tool. The baseline used the ordinary chat entry point. The upgrade used the desktop form, a real planning inference, an owner approval and live registry retrieval. The elapsed times below end at chat settlement or verified output in the desktop UI. Automated approval and view reopening are included in the mission timings. Fixture startup, model download and the subsequent restart check are excluded.

| Objective and path | Observed outcome | Elapsed | Tool receipts or operations | Input / output tokens |
| --- | --- | ---: | ---: | ---: |
| Fewest dependencies, baseline chat | Settled, zero attachments | 15.234 s | 0 | 5,384 / 55 |
| Fewest dependencies, Mission Control | Verified report, 5 of 5 steps | 5.092 s | 8 | 193 / 27 |
| Smallest unpacked size, baseline chat | Failed, zero attachments | 28.342 s | 2 | 26,008 / 138 |
| Smallest unpacked size, Mission Control | Verified report, 5 of 5 steps | 3.457 s | 8 | 193 / 31 |

Baseline tool counts are transcript tool rows. Mission counts are six HTTPS reads, one attachment write and one independent file read. Baseline chat may make several provider turns. The provider reported cached tokens and no currency price. Each cell is one run with a local Qwen2.5-1.5B-Instruct Q4_K_M model, eight CPU threads, an 8,192-token context and one inference slot. Prompt caching and live network latency varied. These measurements describe the two tested objectives. Broader model-quality, speed and usability rankings require other workloads and repeated trials.

The dependency report found zero direct runtime dependencies for Zod 4.6.7, Valibot 1.5.0 and Superstruct 2.0.2. The size report recommended Superstruct at 182,337 unpacked bytes. Three source assignments overlapped for at least 404 ms and 255 ms respectively. Both UI workflows closed and reopened the panel, restarted the server, compared the entire restored mission and downloaded the same bytes again. The memory note appeared only after a separate owner confirmation. [Dependency report](evidence/mission-research/report.md) · [Size report](evidence/mission-research/size/report.md)

The raw records include operation IDs, timestamps, reported tokens, receipts and SHA-256 digests. [Chat baseline](evidence/mission-research/baseline.json) · [Verified mission](evidence/mission-research/mission.json) · [Size baseline](evidence/mission-research/size/baseline.json) · [Verified size mission](evidence/mission-research/size/mission.json)

The desktop evidence shows the plan before approval, the verified attachment and the narrow layout after reopening. [Plan review](evidence/mission-research/review.png) · [Completed mission](evidence/mission-research/completed.png) · [Narrow layout](evidence/mission-research/narrow.png)

A separate Windows qualification used the application's Electron 43.7.9 main process and preload. It clicked the native download link, checked the file in the disposable Downloads folder, exited Electron, restarted the runtime on the same database, launched a new Electron process and opened the verified report. The fixture suppresses Explorer's download notification and isolates Electron's profile and OS paths. [Native execution record](evidence/mission-research/electron/mission.json) ? [Report after relaunch](evidence/mission-research/electron/report-preview.png)

## Reproduction

Use Node 24, the repository's pinned pnpm dependencies, an explicit Chromium executable in `OMB_CDP_CHROME` and a dedicated OpenAI-compatible inference server on loopback. The example endpoint is a placeholder for the test model's port. The fixture creates and removes a separate runtime home, browser profile, bots and accounts for each run. It reaches the public npm registry and the explicitly supplied local model.

```sh
node --experimental-strip-types scripts/verify-mission-research.mjs --endpoint http://127.0.0.1:61095/v1 --model qwen-mission --out evidence/mission
node --experimental-strip-types scripts/verify-mission-research.mjs --endpoint http://127.0.0.1:61095/v1 --model qwen-mission --baseline /path/to/unchanged-checkout --out evidence/mission
```

Add `--metric size` for the alternate criterion. To exercise the full Electron main process on Windows, pass `--electron node_modules/electron/dist/electron.exe` to the mission command. This mode uses the actual installed Electron dependency and requires no separate Chromium executable. Both checkouts need their own installed dependencies. The model file used here had SHA-256 `6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e`. The llama.cpp container image digest was `sha256:ae28f5c2046de51dfd00c9116a36fe44b5e8703ef730d0aea69082781eecb1f7`.

## Test coverage and release boundary

The deterministic tests cover creation idempotency, all phase pairs, graph size and depth limits, cycles, invalid names, fabricated permissions, cross-bot access, service and guest requests, revocation during a request, genuine parallel admission, specialist confinement, dependency ordering, bounded memory context, usage, cancellation, approval rejection, budget exhaustion, retries, revised objectives, corrupt output, retained receipts and restart recovery. A separate React test delivers real shared-stream frames and missed-cursor notifications to the mounted dialog. Chat and automation regression tests run on isolated servers.

Before implementation, the unchanged chat, routine-delegation and runtime-scenarios selection passed 74 tests in 83.85 seconds. The same selection on the upgrade passed all 74 in 72.65 seconds. These are two host-level suite durations. The final release selection passed all **655 tests in 25 files** in 198.46 seconds, including the bot panel and an on-disk crash fixture that checks the attachment's file identity, byte size and modification timestamp. TypeScript, repository lint and the 16-catalog locale check passed. The production renderer build succeeded with the existing CSS highlight, dependency annotation and bundle-size warnings. The signed installer and a human usability study remain unqualified.

```sh
corepack pnpm exec vitest run server/missions/ server/routes/missions.test.ts src/components/missions/MissionControl.dom.test.ts server/runtime/ server/runtime-coordinator.test.ts server/checked-handoff.e2e.test.ts server/routine-delegation.e2e.test.ts server/side-jobs.test.ts server/request-auth.test.ts server/wait-probes.test.ts server/attachments.test.ts server/tool-scope.e2e.test.ts scripts/testing/file-size-ratchet.test.ts scripts/testing/index-route-ratchet.test.ts src/components/bot-panel/PanelShell.dom.test.ts --maxWorkers=3
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run i18n:check
corepack pnpm exec vite build
```

The acceptance thresholds for these cases are zero unapproved operations, zero duplicate durable artifacts in the tested restart window, zero completed missions with a failed verifier, every state-pair expectation satisfied, and identical downloaded bytes after restart. Clock times are measurements and have no fixed CI threshold. The fixture injects SQLite lock contention at settlement and a crash after the attachment commit. Arbitrary disk corruption, power loss and cross-filesystem behavior remain unqualified.

This release supports one research workflow, two ranking criteria and one optional research specialist. Arbitrary web research, repository builds, open-ended coding missions, shared-account missions, automatic long-term memory promotion and retrospective human usability scoring are outside its tested scope. The price field is available only when a provider reports one. General project quality still requires criteria beyond package metadata. The next implementation slice should add a read-only verifier for an explicitly selected existing project test receipt, with a fixture for missing, failing and stale evidence before exposing any project execution control.

## Changed files

The implementation, tests and checked-in evidence change these 49 paths relative to the baseline.

```text
docs/verification/README.md
docs/verification/evidence/mission-research/.gitattributes
docs/verification/evidence/mission-research/baseline.json
docs/verification/evidence/mission-research/completed.png
docs/verification/evidence/mission-research/electron/mission.json
docs/verification/evidence/mission-research/electron/report-preview.png
docs/verification/evidence/mission-research/electron/report.md
docs/verification/evidence/mission-research/mission.json
docs/verification/evidence/mission-research/narrow.png
docs/verification/evidence/mission-research/report.md
docs/verification/evidence/mission-research/review.png
docs/verification/evidence/mission-research/size/baseline.json
docs/verification/evidence/mission-research/size/mission.json
docs/verification/evidence/mission-research/size/report.md
docs/verification/mission-research.md
packages/phone-protocol/src/wire.ts
scripts/testing/headless-chrome.ts
scripts/testing/mission-desktop.cjs
scripts/verify-mission-research.mjs
server/admission.ts
server/coordinator.ts
server/index.ts
server/missions/assignments.test.ts
server/missions/assignments.ts
server/missions/control.ts
server/missions/host.ts
server/missions/plan.ts
server/missions/research.test.ts
server/missions/research.ts
server/missions/summary.ts
server/missions/view.ts
server/routes/missions.test.ts
server/routes/missions.ts
server/runtime-coordinator.ts
server/runtime/runtime.ts
server/runtime/store.ts
server/runtime/types.ts
server/side-jobs.ts
server/wait-probes.ts
shared/mission.ts
src/components/bot-panel/DetailsTab.tsx
src/components/missions/MissionControl.dom.test.ts
src/components/missions/MissionControl.tsx
src/components/missions/MissionDetail.tsx
src/components/missions/MissionForm.tsx
src/components/missions/MissionMemory.tsx
src/lib/config-status-frame.ts
src/locales/en.json
src/state/config-status.ts
```
