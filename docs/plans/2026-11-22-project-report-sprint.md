# Verified research reports in project conversations

On November 22, 2026, the desktop app completed the original project research request and two controlled public npm comparisons. Each run saved its verified report into the selected conversation and answered a question from that report after a full Electron and server restart. The unchanged fork produced zero attachments in the two controlled objectives. The implementation is on `apex/verified-project-reports` in [draft PR #13](https://github.com/JonaWasTaken/Bot-v2/pull/13).

## Revision and review scope

| Role | Revision | What it establishes |
| --- | --- | --- |
| Canonical upstream at initial audit | [`eda0c38d8`](https://github.com/milind-soni/OpenMausBot/commit/eda0c38d8f16f59a380bac6ef45754a6519c6032) | Source and documentation comparison before implementation. |
| Canonical upstream at review | [`1c27aec5d`](https://github.com/milind-soni/OpenMausBot/commit/1c27aec5da162c0c053c9df406582731bc56be93) | One subsequent Grok sign-in error-reporting change. The fork default and this tip have 37 fork-only and 232 upstream-only commits, with merge base `e5490f70de6b683465fb5b7a7ff43e7aa931c1f9`. |
| Unchanged fork default and PR target | [`21435b724`](https://github.com/JonaWasTaken/Bot-v2/commit/21435b724f3f9d3d864256999c90e6efb9f593b8) | `feat/ultra-reliability`. Includes the Windows baseline, recovery, privacy and memory-durability changes. Both chat comparisons ran here. |
| Work reused | [`fa4ab8509` in PR #9](https://github.com/JonaWasTaken/Bot-v2/pull/9) and `24ff2e41f` | Existing reviewed-plan execution, Mission Control, file verification and project navigation. The merge with the fork default is `1425eccf086d78f7d31a97859d0600f50e63f48d`. |
| Tested application | [`c62fe3eb1`](https://github.com/JonaWasTaken/Bot-v2/commit/c62fe3eb1403fed508103b313c6eaa3a4d1b5d22) | Project posting, verification-state correction and regression fixtures. Both matched native records name this exact commit. |
| Original wording qualification | [`6c0480161`](https://github.com/JonaWasTaken/Bot-v2/commit/6c0480161f4298db61079aefe448f7bfe79ea252) | Adds a fixture for the unchanged application. The full objective and selected project requirements appear in the saved record. |

Review the 22-file application change separately from the inherited Mission Control work. The manifest gives every changed path against the fork default, including earlier work, test evidence and planning files. The feature uses the fork's pinned dependencies and existing stores. The Apache-2.0 license, upstream notices, branding terms and existing OSS adapter boundaries are preserved. All qualifying worktrees excluded the separately licensed enterprise directory. Upstream synchronization is a separate integration decision. [Application diff](https://github.com/JonaWasTaken/Bot-v2/commit/c62fe3eb1403fed508103b313c6eaa3a4d1b5d22) · [Exact PR file inventory](../verification/evidence/project-reports/changed-paths.tsv) · [Licensing boundaries](../../LICENSING.md)

## What existed and what this sprint changed

| Boundary | Findings and evidence |
| --- | --- |
| Provider, harness and event transport | The driver registry selects the configured engine. The harness bus and HTTP/SSE projection already convey turn and assignment events to React. The native fixture used the normal OpenAI-compatible chat driver with a private loopback Qwen instance. Mission Control subscribes to the existing stream and reloads its server snapshot on reopen. [Registry](../../server/harness/registry.ts) · [Bus](../../server/harness/bus.ts) · [Mission Control](../../src/components/missions/MissionControl.tsx) |
| Tasks, rooms, Burst and automations | The coordinator persists assignment dependencies, attempts and results in `runtime.db`. Research uses that coordinator and the existing admission and cancellation paths. Rooms, Burst and scheduled routines retain their own scope and lifecycle. Six offline scenarios exercised coordination, routine deferral, skill visibility and the fixture computer boundary. This sprint did not qualify live cloud machines or all automation triggers. [Coordinator](../../server/runtime-coordinator.ts) · [Burst](../../server/routes/burst.ts) · [Routines](../../server/routines.ts) · [App triggers](../../server/app-triggers.ts) |
| Projects, artifacts and memory | The existing store owns bot project membership and conversation messages. Disk attachments have stable identities. The message database holds both the posted message and the delivery receipt. Optional planning context and an explicitly saved memory note use the existing notebook. An earlier Windows sprint separately measured reviewed deletion and journal durability. [Store](../../server/store.ts) · [Transcript database](../../server/message-db.ts) · [Recall](../../server/recall.ts) · [Windows results](apex-001-windows.md) |
| Desktop, integrations and local capabilities | React renders the project folder menu and uses the existing chat navigation and attachment viewer. Electron owns the native download. Skills, MCP, browser and host-computer controls already have dedicated configuration and tool scopes. The project workflow needs only the fixed package reads and report operations. Broader browser, coding and installed Windows journeys have separate acceptance work. [Folder actions](../../src/components/BotProjects.tsx) · [Tool scopes](../../shared/tool-scope.ts) · [25-system source map](apex-roadmap/systems.md) |

The gap was visible after a successful research run. Mission Control held a verified file, yet the conversation selected for follow-up had no findings to use. In the new flow, open the project folder menu, choose **Mission Control**, select the linked conversation, review the plan and choose **Approve and start**. After verification, **Add report to** names the receiving conversation. **Open conversation** takes the user to the saved Markdown, citations and file. Empty project folders also remain reachable. The mission list and detail both show **Verifying** while the file check is pending. [Workflow and controls](../verification/mission-research.md) · [Reopened conversation](../verification/evidence/project-reports/conversation-report.png)

The posting route accepts only the reviewed revision and derives the file and destination from server-owned records. It checks the active personal-workspace authority and same-bot folder/conversation membership across the asynchronous read. Size and SHA-256 must match the verifier's receipt. An appended message and an ID-only receipt commit together in the conversation database. Repeated submissions return the existing post. Removing the post prevents replay from recreating it. The receipt stores no second copy of the findings. Existing callers can still replay older message commands. [Server contract](../../server/missions/conversation-report.ts) · [Command receipts](../../server/commands.ts) · [HTTP and concurrency tests](../../server/routes/missions.test.ts)

## Matched measurements

Both arms used the same two objectives, three named packages, Qwen3 8B Q4_K_M, configured bot permissions and isolated personal workspaces on macOS 27.2.1 arm64. The baseline used ordinary chat. The new arm used the project Mission Control form, a real model planner, automated owner approval and public registry reads. Time starts at submission and ends at chat settlement, the observation cutoff, or visible verified output. Startup, restart and the subsequent follow-up are outside this interval.

| Criterion | Unchanged fork chat | Project mission | Report delivered after restart |
| --- | --- | --- | --- |
| Fewest direct runtime dependencies | Settled in 90.891 s, 6 transcript tool rows, 0 attachments | Verified in 19.730 s, 8 operations, 1 planner call | 1,101 bytes. Zod, Valibot and Superstruct each declared zero direct runtime dependencies. [Chat](../verification/evidence/project-reports/baseline-dependencies.json) · [Mission](../verification/evidence/project-reports/dependencies/mission.json) · [Report](../verification/evidence/project-reports/dependencies/report.md) |
| Smallest unpacked package | Wait timed out at 121.238 s, 2 transcript tool rows, 0 attachments at cutoff | Verified in 19.169 s, 8 operations, 1 planner call | 1,074 bytes. Superstruct 2.0.2 measured 182,337 bytes, Valibot 1.5.0 measured 1,865,457, and Zod 4.6.7 measured 6,148,944. [Chat](../verification/evidence/project-reports/baseline-size.json) · [Mission](../verification/evidence/project-reports/size/mission.json) · [Report](../verification/evidence/project-reports/size/report.md) |

The eight operations were six HTTPS reads, one file write and one independent read of the saved file. Planning took 17.226 and 17.199 seconds. The execution intervals were 2.405 and 1.894 seconds. The three independent source assignments overlapped for 94 and 104 ms, respectively. The planners reported 174 input tokens each and 474 and 556 output tokens. The settled baseline reported four turns, 47,555 input and 5,459 output tokens. The timed-out baseline had no settled usage entry at the cutoff. Each cell is one observation on one machine, with live network, model cache and host-load variation. The local endpoint supplied no currency price.

All three releases declared MIT and supplied type declarations. Each report cites its versioned npm record and retrieval time, specifies the comparison criterion, and explains the limits of using package metadata to choose a library. The two requests per package reach one publisher. API fit, transitive dependencies, application bundle size and independent corroboration still require separate evidence.

## Desktop acceptance and regressions

The operator entered the following objective without naming any packages.

> Research three suitable open-source tools for a TypeScript application, compare their strengths, choose an appropriate option, create a report, and save the findings to my project.

The operator selected the project conversation and an existing owner-authored fixture note. The note specified a runtime JSON schema validator, permissive licensing, bundled declarations and a preference for smallest published size. The model proposed three candidates and the size criterion. The owner reviewed and approved that plan. The desktop displayed the verified Superstruct recommendation in **30.991 s**. After restart, the model answered a separate question about Zod using the saved size and exact versioned URL. This trial establishes a project-specific recommendation under one explicit criterion. [Reviewed plan](../verification/evidence/project-reports/brief/review.png) · [Full record and owner-selected context](../verification/evidence/project-reports/brief/mission.json) · [Actual report](../verification/evidence/project-reports/brief/report.md)

| Acceptance boundary | Observed result |
| --- | --- |
| Project, objective, scope and owner decision | The fixture created an owned project and conversation through their normal APIs, selected both in the desktop UI, and reviewed the objective, shortlist, specialist and bounded plan. Each mission recorded zero research operations before approval. |
| Activity, provenance and file verification | Five persisted assignments completed in each run. The writer started after all three reads finished. Sources, versions, retrieval times, operation counts, byte length and digest were available from the mission. The native download matched the verified file. |
| Failure, authority and concurrency | In each live run, flipping one byte while preserving file size caused HTTP 409. The conversation contained no report until the intact file was restored. Controlled tests separately covered withdrawn sessions, foreign bots/projects, a moved or archived thread, stale revisions, racing requests, deletion, cancellation and failed verification. |
| Quit, restart, reopen and follow up | Each original Electron process exited. The server reopened the same fixture database and a new Electron process reopened the project. Retrying delivery preserved one message and the exact file. All three real follow-ups returned 6,148,944 bytes and the saved Zod 4.6.7 registry URL. A second empty project could receive its first conversation. |

The Midnight and Daylight screenshots show the same completed dependency objective before and after the conversation action was added. The conversation preview is from the completed size run after relaunch. [Midnight before](../verification/evidence/project-reports/before-midnight.png) · [Midnight after](../verification/evidence/project-reports/after-midnight.png) · [Daylight before](../verification/evidence/project-reports/before-daylight.png) · [Daylight after](../verification/evidence/project-reports/after-daylight.png) · [Conversation preview](../verification/evidence/project-reports/conversation-report.png)

| Command or check | Result on this host |
| --- | --- |
| Baseline `pnpm exec vitest run server/commands.test.ts server/store.test.ts server/tasks.test.ts server/runtime/store.test.ts` | 205 passed in four files, 9.26 s, on the unchanged fork. |
| Scoped application Vitest command below | 959 passed in 37 files, 106.88 s. Includes held-sibling ordering, cancellation, command receipts, route authority, rendering and scope regressions. |
| `pnpm test:electron` | 2,228 passed, 13 skipped, zero failed. |
| `pnpm broker:test` and `pnpm test:packaged-server` | 139 broker tests passed. Packaged server boot, CLI, MCP, encrypted backup export, trust gate and restart smoke passed. |
| `pnpm exec tsc -p evals/tsconfig.json` and `pnpm exec vitest run --config evals/vitest.config.ts` | Typecheck passed. All 103 evaluation tests passed in 18 files. |
| `pnpm eval` and `pnpm eval --golden` | Six offline scenarios and the golden handoff replay passed. The offline scenarios use controlled fixtures. |
| `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check`, `pnpm build` | Passed with Node 26.11.1 and pnpm 10.33.0. Sixteen locale catalogs validated. The renderer build retained a chunk-size warning. |
| `node docs/plans/apex-roadmap/ledger.mjs --check` | Ten programs, 50 chapters, 20 missions each, 1,000 unique stable IDs, 25 product systems and three leads. |

The captured test summaries include the suite counts and all seven evaluation scenario outcomes. [Command output](../verification/evidence/project-reports/checks.txt)

```sh
OMB_VITEST_WORKERS=3 pnpm exec vitest run server/missions server/runtime \
  server/routes/missions.test.ts server/runtime-coordinator.test.ts server/coordinator.test.ts \
  server/side-jobs.test.ts server/wait-probes.test.ts server/commands.test.ts server/store.test.ts \
  server/tasks.test.ts server/bot-projects-api.test.ts server/routes/threads-page-leaf.test.ts \
  server/message-file.test.ts server/bot-attachment.test.ts server/request-auth.test.ts \
  server/permission-proxy.test.ts server/tool-scope.e2e.test.ts server/workspace-backup-team-private.test.ts \
  src/components/missions src/components/BotProjects.test.ts src/state/message-history.test.ts \
  scripts/testing/file-size-ratchet.test.ts src/locales/vocabulary.test.ts
```

For each criterion (`dependencies` and `size`), run the following once per arm in a clean fork checkout with its frozen dependencies installed. Supply a dedicated loopback model endpoint, its installed model name, the absolute Electron executable and a separate baseline checkout at `21435b724`. The native project runner uses the production main process and preload with the isolated development renderer. [Fixture contract and reproduction](../verification/mission-research.md)

```sh
node --experimental-strip-types scripts/verify-mission-research.mjs \
  --metric "$criterion" --endpoint "$endpoint" --model "$model" \
  --baseline "$baseline_checkout" --out "$evidence_root/baseline-$criterion"
node --experimental-strip-types scripts/verify-mission-research.mjs \
  --metric "$criterion" --endpoint "$endpoint" --model "$model" --project \
  --electron "$electron_executable" --out "$evidence_root/project-$criterion"
```

To exercise the original wording, run the second command with `--project-brief` in place of `--metric "$criterion"` and a fresh output directory. The fixture writes the project requirements into the disposable owner's notebook and selects that topic in the mission form.

Two failures informed the implementation. The first macOS fixture downloaded the file but could not prove that its first Electron process exited. The fixture now asks the actual main process to quit and waits for exit before relaunch. A file-size guard also caught modal-state code pushing the existing sidebar past its budget. The folder component now owns that dialog. Both native runs and the sidebar size guard passed on the final application commit.

## Roadmap, release gates and next work

The ledger advanced one row, `APEX-27-02`, after the controlled test held one source open while its sibling finished. The writer remained idle and the list and detail remained in verification until the file check passed. Totals are **14 Verified, 3 Integrated, 1 In progress and 982 Not started**. The 17 verified or integrated missions have identifiable receipts. Each of the 1,000 missions now resolves to a responsible workstream and the appropriate flagship systems. [Mission evidence](apex-roadmap/chapters/27-dependency-ordering.md#dispatch-queue) · [Ledger](apex-roadmap/README.md) · [System ownership](apex-roadmap/systems.md)

The project workflow's acceptance thresholds are zero pre-approval research operations, zero posts for a damaged file, one message per approved report, five verified assignments, and identical bytes plus an accurate cited follow-up after relaunch. Repository-wide P0/P1 triage, dependency reachability, installed backup restoration, and the complete set of Windows critical journeys remain release gates. This sprint supplies scoped evidence for authorization, cancellation, memory opt-in and orderly restart. [Assignment cases](../../server/missions/assignments.test.ts) · [Permission and delivery cases](../../server/routes/missions.test.ts)

| Priority | Risk and next acceptance gate |
| --- | --- |
| **1. Qualify the installed Windows journey** | Install the OSS candidate under a standard account, upgrade a populated disposable profile, reopen the conversation and file, and repeat the post/retry and backup/restore checks. Require the same message ID, SHA-256 and source citation, one posted report and no duplicate effect. This is the next integration gate. |
| **2. Interrupt report delivery at the transaction boundary** | Terminate the installed app immediately before commit and after commit but before the UI acknowledgment. After repair/restart, expect either an uncommitted action that can be retried or the original message and file. Check deletion and explicit retry alongside the existing runtime crash matrix. |
| **3. Qualify a broader TypeScript recommendation** | Add a separately authorized, read-only source for API suitability and independent corroboration. Use matched repeated tasks with known examples, disagreement and missing evidence. Grade correctness, citations, abstention, elapsed time and resource use before expanding scope. |

The scoped regression runs and three native project missions qualify these paths on macOS. This revision has no installed Windows result, signed release or full repository test run. Previous Windows runs recorded platform-specific failures and a pending dependency-reachability review. Those release gates remain open. Broader free-form research, autonomous project selection, cross-device continuity and general model-routing efficacy each require their own measured journey. PR #13 targets the fork and awaits review alongside PR #9. [Windows qualification history](apex-001-windows.md) · [Fork review](https://github.com/JonaWasTaken/Bot-v2/pull/13)
