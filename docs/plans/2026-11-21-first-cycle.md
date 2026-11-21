# First desktop agent engineering cycle

## Revision and architecture

The fork's default branch, `feat/ultra-reliability`, started this sprint at `e99ea7af1ea8cf671b712bfa216bf1e9df82c872`. Its upstream ancestor is `e5490f70de6b683465fb5b7a7ff43e7aa931c1f9`. Upstream main at audit time was `1abccdef1f0a2ae694f40b4220e5cfb7a6c09cf1`, 14 commits beyond that ancestor. Version 0.1.175 is common to the checkout and latest published release. The release tag points to `7a3d80c9630de264e0df7d3df534b99afd841f19`. The three workstreams used separate branches from the fork default. Nothing in this cycle updates that default branch. [Release](https://github.com/milind-soni/OpenMausBot/releases/tag/v0.1.175)

The renderer in `src/` submits HTTP commands and consumes server events; the server owns driver sessions, tool grants and pending approvals. The shared wire types, driver registry and harness remain the right integration points for agent work. Markdown files hold bot knowledge, the memory journal records edits, and recall constructs a bounded supplement to a turn. Filename identity is local to each notebook. The desktop preload exposes explicit workspace operations to the renderer. A successful probe belongs to the precise address and pairing code that produced it. The three fixes enforce these existing contracts at their point of use.

The earlier fork commits already guarded journal Undo and removed superseded notes from active context. The six offline harness scenarios also establish existing delegation, scheduling, computer contention and skill-assignment behavior. The newer upstream includes optional checked answers, desktop browser panes and Grok lifecycle work. Evaluate those implementations before adding another reviewer, browser surface or orchestration layer. The OSS fixture returned `{"edition":"oss","features":[]}`. The public product name, mascot, optional enterprise adapters and redistribution terms remain governed by upstream's licensing file. [Earlier measurements](2026-11-21-oss-baseline.md) · [Licensing](../../LICENSING.md)

## Three reviewable changes

The runnable review branch on the fork is `sprint/first-cycle-evidence`. It combines the three application changes and this evidence. Each PR still has an independent base at the original fork revision. [Combined branch](https://github.com/JonaWasTaken/Bot-v2/tree/sprint/first-cycle-evidence)

| User journey | Reproduction and acceptance evidence | Scope and remaining risk |
| --- | --- | --- |
| Delete a memory file that changed during review | Topic and dated-log deletes using the old UI request shape removed newer content. Two HTTP reproductions returned 200. The guarded requests now return 409, preserve disk and journal, then return 200 with a deletion entry after review. The mounted personal-notes panel reloads the replacement note before retry. [PR 1](https://github.com/JonaWasTaken/Bot-v2/pull/1) | The client places the path and hash in the body. An old server cannot interpret that as an unconditional delete. The older query-path API still accepts its existing callers. The hash check and unlink run synchronously in the server. An external writer racing inside that interval has no filesystem transaction. |
| Recall two relevant notes with the same filename | A personal and a team notebook each contained `memory/travel.md`. The real harness supplied Birch twice to its scripted driver. It now supplies Birch and Cedar once each. Three tests failed before the change; 35 targeted tests passed after it, including alias collisions, member isolation and the existing four-note ceiling. [PR 2](https://github.com/JonaWasTaken/Bot-v2/pull/2) | Search matches and named topics are paired inside each authorized notebook. Existing notebook order and global budget still apply. Display labels show relative filenames. This directly measures the prompt sent to the driver. |
| Change a server address or pairing code while connecting | A held probe allowed the form to advertise Office and submit Studio. An isolated Electron run submitted Studio while its new check was pending, then a second time after the response. After the fix it dispatched zero connections while pending and one after success. Two new cases failed on baseline; 54 focused renderer checks passed after the fix. [PR 3](https://github.com/JonaWasTaken/Bot-v2/pull/3) | The form binds each result to its checked inputs and keeps its existing debounce. The fixture used the production renderer and preload with synthetic IPC responses. A real hosted account was outside this test. |

The Windows zoom issue was investigated first. Both source revisions use Electron's native roles, and this host runs macOS arm64. The connection defect had an observable reproduction and a normal-entry-point fix, which made it a better choice for this sprint. [Windows report](https://github.com/milind-soni/OpenMausBot/issues/6861)

## Ranked work and acceptance gates

Ranks reflect confidence in a reproduction, potential user harm, independence and whether this host can verify the fix. Rows 1–3 are implemented. Rows 4–10 are proposed missions. Their evidence column describes the outstanding proof required for completion.

| Rank and objective | Source and assessment | Proposed change, dependency and acceptance evidence |
| --- | --- | --- |
| 1. Protect memory deletion | `server/routes/bot-memory.ts`, `server/memory-store.ts`, both memory panels. Unconditional deletion reproduced. | Preserve reviewed contents across competing writes. Reuse the file digest, authorization and journal. PR 1 contains the HTTP and renderer regressions. |
| 2. Recall facts from each permitted notebook | `server/recall.ts`. Flattened matches lost notebook identity. | Resolve matches within their source. PR 2 records the prompt, limit and unrelated-member controls. |
| 3. Connect only to the reviewed target | `src/components/PlaceAddSheet.tsx`. Edits could keep stale approval to submit. | Tie readiness to current fields. PR 3 records two failed baseline tests and the post-fix Electron dispatch count. |
| 4. Resolve interrupted-turn recovery | `electron/server-supervisor.mjs`, `server/runtime/tree.ts`, `scripts/verify-server-recovery.mjs`. The smoke expects idle while the runtime starts a continuation. | Establish the supported restart contract first. Use a counted, disposable write, kill the child after the effect and before settlement, verify one effect, one visible terminal outcome and safe cancellation. |
| 5. Verify cloud computer approval at the adapter boundary | `server/cloud-computer-tools.ts`, `server/permission-proxy.ts`. The user report concerns the actual cloud adapter. | Use a recording action sink for allow, deny, interrupt and unattended cases. Require zero effects before approval and at most one matching effect afterward. A live check needs an authorized test account. [Issue 6859](https://github.com/milind-soni/OpenMausBot/issues/6859) |
| 6. Keep a shared gateway alive while a sibling chat is active | `server/drivers/session-idle.ts`, `server/drivers/acp/hermes.ts`. Shared process ownership is reported to outlive idle cleanup. | Two bots, one synthetic gateway, two session leases. Expire one lease, finish the other, then verify a single final cleanup. Preserve both conversation histories. [Issue 6898](https://github.com/milind-soni/OpenMausBot/issues/6898) |
| 7. Explain actual mail coverage of scheduled checks | `server/host/routine-checks.ts`, `server/connected-reads.ts`. An Outlook-only owner reported an empty run. | Exercise Outlook-only, Gmail-only, disconnected and denied accounts. Require source-specific outcomes, correct account scoping and no cursor movement on failure. Check newer upstream work before implementation. [Issue 6895](https://github.com/milind-soni/OpenMausBot/issues/6895) |
| 8. Restore desktop connection smoke coverage | `scripts/verify-server-connection.mjs`, `src/components/ConnectedWorkspacesSettings.tsx`. The prior smoke stops at an outdated Settings expectation. | Drive current navigation in an isolated Electron profile. Preserve assertions for cancellation, trust and persistence and reach the final assertion. |
| 9. Verify Windows zoom recovery | Electron menu roles and the packaged Windows app. A user could zoom out and could not restore the scale. | On Windows x64, record scale before and after Ctrl+minus, plus, equals and zero, including after restart. Test a second keyboard layout before replacing native shortcuts. [Issue 6861](https://github.com/milind-soni/OpenMausBot/issues/6861) |
| 10. Measure whether delegation earns its cost | `evals/live/scenarios/live-delegation-lane.json`. The task explicitly asks for delegation. | Run the same deliverable solo and with an optional specialist, under identical model, tool and token limits. Blind-grade artifacts, report correctness, elapsed time, usage, cancelled children and variation. |

## Roadmap

The planning unit is a chapter with twenty independently accepted missions. The ten programs below reserve the requested fifty chapters. The table above is the actionable backlog. Before scheduling further missions, record the observed behavior, source owner, change, dependency, authorization boundary, acceptance test and measured result. Expand each chapter as evidence accumulates.

| Program | Five chapters, in order |
| --- | --- |
| Architecture and infrastructure | Revision parity; driver contracts; HTTP/SSE event continuity; persisted task state; fixture reproducibility |
| Desktop experience | Composer and stream; conversation navigation; workspace connection; model selection; keyboard and accessibility |
| Core intelligence | Intent and model policy; planning thresholds; context allocation; action verification; controlled comparisons |
| Advanced memory | Durable formation and consent; notebook boundaries; retrieval evaluation; corrections and forgetting; retention and inspection |
| Tools and computer interaction | Capability grants; browser action confirmation; workspace file changes; computer ownership; tool interoperability |
| Multi-agent collaboration | Delegation economics; dependency ordering; child permissions; cancellation and recovery; result verification |
| Autonomous execution | Trigger and timezone semantics; receipts and idempotency; unattended approval; restart handling; history and result delivery |
| Projects and productivity | Workspace membership; project knowledge; artifact provenance; reviewed workflows; health summaries |
| Multimodal, performance and reliability | File and image fidelity; voice interaction; startup and navigation; large transcripts; sustained-process profiling |
| Security, packaging and release | Electron boundaries; credential and member isolation; dependency and attribution review; native installer testing; release acceptance |

## Release decision

These are draft changes. A release requires passing critical user journeys on supported systems, all release-blocking authorization cases, no unresolved reproducible data loss or cross-user exposure, and triage of existing high-severity findings. Two successful capability fixes and a desktop reproduction are insufficient to certify the platform. Record at least three controlled runs for performance comparisons; the measurements in this sprint include load from concurrent test processes. Use the initial gzip bundle size as a reproducible gate: investigate more than 2% growth for these changes. Establish stable machine-specific latency percentiles before setting a shipping latency budget.

## Reproducing the measurements

The implementation heads are `0333ded96df9dab52f67420c0404a337be083b8b` (delete), `27cb25f8c4d93c37aee93ab811de7f977f8b6e02` (recall) and `fb5fff8eb5a88dffa5aa864f5cf34b57fb26e444` (connection). The disposable, combined code revision is `a766671c1a9fb51a76381b20166f8fb90310ef31`. All runs below used the project's pinned pnpm 10.33.0; local Node was 26.11.1 on macOS arm64. Existing tests and new tests use temporary profiles and databases.

| Check | Observed result |
| --- | --- |
| `corepack pnpm eval` on the upstream ancestor, fork default and combined changes | All six offline behavior scenarios passed on each revision. |
| OpenAI-compatible tool use, file analysis, attachment handling, browser session control, live-suite scoring and turn routing | The same six Vitest files passed 37 cases on both upstream ancestor and fork default. File analysis includes loading a dataset, querying it and exporting actual results. |
| Three changes together, including browser/CDP, data analysis and the brokered tool workflow | 261 tests passed in 18 files on the combined OSS revision. The delete workstream also passed 108 targeted cases in five files. |
| Request auth, permission proxy, unattended routine approval, cloud computer tools, server list | 136 tests passed in five files on the combined revision. |
| Three feature commits plus the 14 newer upstream commits | A disposable merge-tree had no textual conflicts. All 100 targeted tests passed in six files. |
| `corepack pnpm typecheck`, `lint`, `build`, `check:electron` | Passed on the combined revision. The Electron check covered 464 modules. Vite warned about large chunks. |
| `corepack pnpm broker:test` and `test:electron` on the fork baseline | 139 broker tests passed. Electron Node tests passed 2,228, with 13 skipped. |
| `corepack pnpm test:packaged-server` | The first fork run stopped because a nested script could not find `pnpm`. Reran with a temporary Corepack shim on PATH. Both fork and combined OSS bundles booted independently and passed CLI, MCP, backup and trust checks. |
| Final check from the primary checkout on the combined review branch, Node 24.22.0 | Typecheck, lint, build, Electron syntax, packaged-server smoke and all 100 cases in six feature test files passed. Both local-model runners also passed Node syntax checks. |
| `node scripts/verify-server-recovery.mjs` | Failed again on the combined checkout, at the busy-state assertion on line 194. The prior report records this failure on both the upstream ancestor and fork default. |

Representative commands, run in the indicated OSS checkout:

```sh
corepack pnpm eval
corepack pnpm exec vitest run server/data/data.e2e.test.ts server/openai-tools.e2e.test.ts server/browser/session-control.test.ts server/host/turn-attachments.test.ts evals/live/live-suite.test.ts evals/turn-routing
corepack pnpm exec vitest run server/memory-routes.test.ts server/recall.test.ts server/memory-topic-corrections.test.ts server/cloud-team-private.e2e.test.ts src/components/PlacesRail.test.ts src/components/bot-panel/MemoryPage.team.test.ts
OMB_CDP_CHROME="/absolute/path/to/chrome" corepack pnpm exec vitest run server/browser/cdp/s4-actions.e2e.test.ts
corepack pnpm bench:desktop --only bundle,start --chrome "/absolute/path/to/chrome" --out /tmp/desktop-bench.json
```

The local-model runner is opt-in and takes a loopback OpenAI-compatible endpoint. Run it from the checkout under test. It uses that checkout's normal chat and provider paths, a new synthetic bot for each task, disabled tools and a disposable fixture. Its JSON lines include the settled answer, exact-answer verdict, time from submit through settlement, and available usage. It reports failures as data. The research case supplies two sources and a superseding amendment; the coding case asks for a non-mutating comparison operator without evaluating model-generated code. Browser and file-tool execution are exercised separately by the real browser and dataset tests.

```sh
node --experimental-strip-types /absolute/path/to/evals/runners/local-answer-comparison.mjs \
  --endpoint http://127.0.0.1:PORT/v1 --model qwen3:8b --repeats 3
```

### Desktop observations

| macOS headless Chrome, Simple mode | Fork before | Combined |
| --- | ---: | ---: |
| Initial JavaScript, gzip KiB | 1,159.6 | 1,159.6 |
| Source server ready, ms | 2,284 | 5,758 |
| First useful conversation visible, ms | 231 | 805 |
| Two reloads, ms | 84, 71 | 280, 197 |
| Renderer RSS at end, MiB | 258 | 255 |

The automatic Chrome lookup initially failed; the rerun used installed Chrome for Testing with a disposable profile. These timings were collected during different concurrent test workloads, including local inference during the combined run. The first-load bundle passed the proposed 2% size gate. After inference ended, a second measurement interleaved six separate benchmark launches in before–after, after–before, before–after order. Each launch opened a fresh fixture and browser profile and performed two reloads. The baseline suite continued running for both arms.

| Interleaved observations, median (range) | Before | Combined |
| --- | ---: | ---: |
| First useful conversation, three starts, ms | 215 (202–224) | 207 (202–223) |
| Reload, six observations, ms | 79 (66–87) | 79 (67–86) |
| Source server ready, three starts, ms | 1,749 (1,664–2,073) | 1,707 (1,701–1,849) |
| End-of-run renderer RSS, MiB | 256 (255–256) | 256 (254–257) |

For a comparable machine, investigate a median first useful conversation over 260 ms or a median reload over 100 ms across at least three paired fixture launches. These proposed investigation thresholds leave about 20–25% headroom over the fork's observed medians. Both revisions met them in the interleaved run.

Both revisions were also profiled once with 150 bots, 300 threads and 2,000 seeded messages. On the fork baseline, the conversation appeared in 200 ms and the 95th-percentile scroll frame took 17.3 ms. On the combined revision those observations were 213 ms and 18.0 ms. Server CPU over the ten-second idle interval was 1.54% and 1.07% respectively. In both runs the stream settled and its reply was drawn. The React profiling build exceeded Node's default heap on both revisions; the recorded runs allowed an 8 GiB heap. That build limit is distinct from installed app memory use. One run per revision cannot establish a performance trend or characterize prolonged idle behavior.

```sh
node --max-old-space-size=8192 --experimental-strip-types scripts/bench-desktop.ts \
  --only big,idle,stream --idle-seconds 10 --bots 150 --threads 300 --messages 2000 \
  --chrome "/absolute/path/to/chrome" --out /tmp/desktop-load.json
```

### Local-model results

The notebook change also improved a narrowly defined answer-quality measure. An independent Qwen3 8B reader received the actual output of each revision's `buildRecall` and the same question. Three synthetic personal/team terminal pairs were each measured twice, in before–after–after–before revision order. Each trial used a fresh notebook and a stateless local reader request with temperature zero. A pass required the right value under both the personal and team labels, after trimming per-line whitespace and folding case. An initial pilot exposed a grader that counted Markdown trailing spaces as a failure. The controls and the full paired runs below used the corrected grader.

| Reader task | Fork before | Combined |
| --- | ---: | ---: |
| Two readable notebooks, identical filenames | 0/6 | 6/6 |
| Two readable notebooks, distinct filenames | 6/6 | 6/6 |
| Only the member notebook selected, team answer must be unknown | 6/6 | 6/6 |

Every baseline collision omitted the team's value from the passages, and the reader answered “unknown” for that value. This measures the recall-to-answer step with one local model. The separate Team Cloud HTTP test exercises actual audience selection and prompt delivery. The raw trials include the synthetic context and each visible answer. [Reader trials](2026-11-21-notebook-reader-trials.jsonl)

```sh
node --experimental-strip-types /absolute/path/to/evals/runners/notebook-reader.mjs \
  --endpoint http://127.0.0.1:PORT --model qwen3:8b
```

A private, loopback Ollama process used a filesystem copy of the installed Qwen3 8B model. Eighteen turns used the production OpenAI-compatible chat driver. Each revision ran three fresh conversations per task, with the same task order and permissions. The three targets were 11:15, Beta 222 A1 B2, and JavaScript's strict equality operator. Both revisions reached all nine substantive answers on manual inspection. Both met the requested output format on only three of nine turns. All six arithmetic and code-review responses added explanation despite an explicit instruction to give only the answer. All source reconciliation responses selected the current amendment and correct price. This is a reproducible instruction-following limitation and a candidate for a future comparison. [Individual trials and responses](2026-11-21-local-answer-trials.csv)

| Live measure | Upstream ancestor | Combined changes |
| --- | ---: | ---: |
| Reached settled | 9/9 | 9/9 |
| Correct content on inspection | 9/9 | 9/9 |
| Exact answer after trimming backticks and case-folding | 3/9 | 3/9 |
| Median submit-to-settlement time | 22.4 s | 24.6 s |
| Range | 19.5–50.7 s | 22.1–78.8 s |

The local endpoint incurred no provider API fee. Electricity and machine time were unpriced. The baseline usage lookup missed the ledger's bot-key prefix, so its per-trial columns are blank. A later ledger snapshot had entries for eight of nine bots, one of which included two turns. It cannot provide a comparable per-turn total. The corrected runner recorded 9,186 input and 3,875 output tokens across the combined trial snapshots. Counters refer to whatever the ledger had booked for that bot when the turn settled. Time to first model token was not instrumented. Fixed execution order, varying host load and nine observations per arm preclude a throughput or general model-quality superiority claim.

### Changed source and tests

| PR | Production files | Regression files |
| --- | --- | --- |
| 1 | `server/routes/bot-memory.ts`, `server/memory-store.ts`, `server/memory-journal.ts`, `src/lib/memory.ts`, `src/components/bot-settings/MemorySection.tsx`, `src/components/bot-panel/pages.tsx` | `server/memory-routes.test.ts`, `src/components/bot-panel/MemoryPage.team.test.ts` |
| 2 | `server/recall.ts` | `server/recall.test.ts`, `server/memory-topic-corrections.test.ts`, `server/cloud-team-private.e2e.test.ts` |
| 3 | `src/components/PlaceAddSheet.tsx` | `src/components/PlacesRail.test.ts` |

### Restart and broad regression gates

All three draft PRs passed the fork's aggregate GitHub CI check at the implementation heads above. All eight Ubuntu Vitest shards, typecheck/build and renderer smoke passed on each. The repository's path filters skipped additional jobs on the renderer-only PR. The macOS full-suite and recovery observations below are independent checks.

The full fork baseline command was `OMB_VITEST_WORKERS=3 corepack pnpm test` on the pre-sprint application code at `e99ea7af1`, with Node 26.11.1 and the OSS-only worktree. Vitest finished in 3,639.96 s and exited 1. Across 3,276 files, 3,182 passed, 18 failed and 76 were skipped. Across 42,988 cases, 42,589 passed, 60 failed, 336 were skipped and three were marked todo. One of the 18 files failed during import. Because the script chains stages with `&&`, the broker, Electron and packaged-server results in the verification table came from separate invocations.

| Failing files on the fork baseline (grouped by observation) | Tests failed |
| --- | ---: |
| Shard weights, verification docs, bot-box environment inventory, worker-port inventory and dependency scan refer to omitted enterprise paths | 5 plus one file that failed to load |
| Hosted access, cloud credit, hosted model policy and one-home trial-key expectations | 18 |
| Composer context menu, page tools, remembered side panel, sidebar pinned rows and chat automation | 33 |
| Container-image version lookup, weekly DuckDB chart, plain-text Unicode preview and no-AI Team Cloud fixture | 4 |

The combined-tree full Vitest invocation with six workers and `--bail 1` stopped on `server/index.test.ts` after 944 passes. The unanswered-provider-question restart test exceeded 30 s. Its isolated rerun passed on both the upstream ancestor and combined code. The separate Electron recovery smoke failed its busy-state assertion reproducibly and remains a release blocker for recovery claims.

The broad macOS baseline exposed environment-sensitive checks in the unmodified fork. On the upstream ancestor, the shard fixture expected the weight of an omitted enterprise test and the bot-box inventory tried to open the omitted enterprise entrypoint. Hosted-access fixtures also import that optional adapter. The container-image expectation resolved newer engine versions than its fixed reference. On Node 24.22.0 the upstream composer and page-tools suites passed all 27 cases, and the combined composer and connection-rail suites passed all 61 cases. The macOS DuckDB weekly chart test observed 608,400,000 ms versus the expected 604,800,000 ms in Europe/Copenhagen. Under UTC all 17 chart tests passed on the same upstream code. These results identify conditions that change the baseline and do not certify other failing files.

### Native Windows acceptance

A read-only verification branch combined the three code heads and exercised the fork's existing Windows packaging steps with an OSS-only checkout. GitHub Actions ran the frozen install, `pnpm package:win`, bundled-browser check, packaged-server smoke and executable-tree verification. It then silently installed the NSIS package on the disposable Windows runner, launched the installed executable with a fresh profile and data directory, and required the desktop's own `renderer-ready` marker. That marker checks the actual preload bridge, loopback health response, owner mutation capability and renderer location. All steps passed. This establishes one native installation and startup. It leaves keyboard layout behavior, update-from-previous-version and soak testing open. [Windows install and launch job](https://github.com/JonaWasTaken/Bot-v2/actions/runs/44916689536/job/136883724865)

The first chapter's twenty missions have individual source and acceptance records. The next sprint should start with crash recovery and a counted side effect. Then close the Windows zoom reproduction and compare the new upstream answer checker with the single-agent path on a bounded deliverable. [Chapter 1 mission ledger](2026-11-21-revision-parity.md)
