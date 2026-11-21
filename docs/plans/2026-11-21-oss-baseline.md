# Desktop agent baseline and first memory upgrades

## Checkout and scope

The destination had an unborn main branch and no working files. The local feature branch starts at upstream main `e5490f70de6b683465fb5b7a7ff43e7aa931c1f9`, 24 commits beyond the release tag. Both identify themselves as package version 0.1.175. The release already shipped a redesigned composer, model-provider recovery work and improvements to room-member fallback. This baseline uses the main revision. [Release notes](https://github.com/milind-soni/OpenMausBot/releases/tag/v0.1.175)

The working tree uses Git sparse checkout to omit `enterprise/`. Both baseline and upgraded source servers answered `{"edition":"oss","features":[]}`. The original remote remains `origin`, with the foundation tracked as `upstream/main`. Sparse checkout is local configuration. A fresh checkout of this branch includes the upstream enterprise directory unless its build also excludes it. A public OSS distribution needs an explicit OSS packaging step and independent product branding. The Apache license, notices, enterprise boundary and upstream trademarks are preserved. [Licensing](../../LICENSING.md)

## Architecture worth preserving

| Area | Existing capability | Evidence and scope |
| --- | --- | --- |
| Agent and model drivers | Driver contract, registry and common event bus under `server/drivers/` and `server/harness/`. The UI consumes HTTP and SSE. | A scripted Claude driver completed an actual turn through the harness. Model switching and fallback have separate provider-specific paths. |
| Memory | Per-bot Markdown, a searchable index, topic recall, a redacted journal and hash-checked editor saves. | Isolated HTTP fixtures exercise file CRUD, conflicting saves, journal history and undo. People can inspect the original file after a correction. |
| Teams and automation | Coordination nodes, pinned tasks, routine deferral, bounded computer ownership and cancellation. | Six offline behavior scenarios cover dispatch during outstanding work, deferral, skill visibility, screenless execution, contention and failed computer claims. |
| Desktop and tools | Existing React shell, model picker, keyboard support, preload isolation, permission broker, tool grants and connection health. | `electron/main.mjs` configures isolation and sandboxing for the main window. `server/mcp-health.ts` and `src/components/McpServersPanel.tsx` already provide integration diagnostics. |
| Extensibility and recovery | Pluggable drivers, MCP and skills, scoped capabilities, persisted events, fixture engines and real subprocess tests. | The packaged OSS server ran from a directory outside the repository. The deterministic harness and restartable test server supplied the boundaries for both changes. |

## Ranked work

Scores are triage judgments on a 1–5 scale. The five inputs, in order, are user impact (30%), reliability/security (25%), agent capability (20%), implementation feasibility (15%) and maintenance/upstream fit (10%). Multiplying the weighted mean by 20 gives the score out of 100. Directly observed failures support the first two selections. Other rows identify the evidence still needed before changing production behavior.

| Rank · score · inputs | Current behavior and evidence | Change and likely files | Risk and verification | User benefit |
| --- | --- | --- | --- | --- |
| 1 · 96 · 5/5/4/5/5 | An old Undo discarded later corrections or resurrected deleted text. Four stale edit sequences returned 200 on upstream. | **Implemented.** Check the journaled post-change state against disk in `server/memory-journal.ts`. | Low. Exercise create, edit, delete, empty versus absent, valid Undo and restart. | A person can undo a change without losing a newer correction. |
| 2 · 95 · 5/4/5/5/5 | Two obsolete depot locations and their replacement reached the driver in one system prompt. The search filter also missed the generated supersession marker on handwritten notes. | **Implemented.** Reuse supersession filtering before prompt truncation in `server/workspace.ts` and recognize the supported note forms in `server/memory-entries.ts`. | Low to medium. Check prompts, exact persisted Markdown, topic/index search, unrelated queries and ordinary Markdown strikethrough. | The agent receives the current location while the person keeps the history. |
| 3 · 88 · 5/5/4/3/4 | The Electron crash-recovery fixture observes a replacement server but fails its wait assertion for an interrupted turn. | Reconcile the visible interrupted-turn state and the recovery contract in `scripts/verify-server-recovery.mjs`, `electron/server-supervisor.mjs` and the restart instructions in `server/runtime/tree.ts`. | Medium. Inspect both transcripts and the fixture prompt ledger. Prove the interrupted action runs once, then separately exercise quit during backoff and retry exhaustion. | A person can tell what finished and whether retrying is safe. |
| 4 · 85 · 5/5/4/2/4 | A user reported unexpected cloud computer behavior at Ask on 0.1.169. Current live Boat behavior was not exercised. [Issue 6859](https://github.com/milind-soni/OpenMausBot/issues/6859) | Check the documented approval contract against a recording adapter and review `server/cloud-computer-tools.ts` and `server/permission-proxy.ts`. | High. Verify approval, denial, cancellation and unattended pause against an inert action sink before a live compatibility check. | Approval settings give predictable control over consequential actions. |
| 5 · 82 · 4/5/4/3/4 | Shared Hermes gateway reportedly exits when one chat idles. The idle policy explicitly distinguishes per-chat and shared processes. [Issue 6898](https://github.com/milind-soni/OpenMausBot/issues/6898) | Verify process ownership at cleanup in `server/drivers/session-idle.ts` and `server/drivers/acp/hermes.ts`. | Medium to high. Two sessions on one synthetic shared service, one idle and one active. Check active completion, final cleanup and failed-run history. | One chat closing should not interrupt another bot's work. |
| 6 · 80 · 4/4/4/4/4 | The routine check calls the Gmail-oriented reader. A separate Outlook reader exists. A user reported an empty check despite unread Outlook mail. [Issue 6895](https://github.com/milind-soni/OpenMausBot/issues/6895) | Review upstream work on the issue, then distinguish unsupported source, disconnected account and empty results in `server/host/routine-checks.ts` and `server/connected-reads.ts`. | Medium. Replay Outlook-only, Gmail-only, both, denied and empty accounts. Verify account ownership and cursor advancement. | Routine history explains what was actually checked. |
| 7 · 76 · 4/4/3/4/4 | PUT uses an optional expected hash. Both memory-panel file deletion paths issue unconditional DELETEs, even where the panel already holds a revision. This is separate from journal Undo. | Extend conditional deletes through `server/routes/bot-memory.ts`, `server/memory-store.ts`, `src/lib/memory.ts` and both memory panels. | Medium. Test stale and fresh confirmations, logs, team-personal memory and existing API callers. | A delete confirmation protects a note edited by someone else in the meantime. |
| 8 · 72 · 4/3/4/3/4 | OpenCode can remain in a waiting state for over a minute with no reply. A report identifies the symptom but supplies no deterministic provider trace. [Issue 6905](https://github.com/milind-soni/OpenMausBot/issues/6905) | Distinguish slow progress, disconnected transport and a pending question in `server/drivers/acp/quiet-status.ts` and its driver tests. | Medium. Script each state and verify Stop, late replies and terminal outcomes before changing timeouts. | Users can choose a recovery action without repeating a still-running task. |
| 9 · 69 · 3/3/4/4/4 | The live delegation fixture explicitly instructs the chief to delegate a one-word task. That fixture cannot measure whether delegation was a better decision. | Add paired solo/team research, planning, implementation and verification cases beside `evals/live/scenarios/live-delegation-lane.json`, using the existing runner. | Medium. Same input, model, budget, tools and grader. Measure accepted deliverable, cost, elapsed time and cancellations over repeated trials. | Evidence for when to use a team and when to keep a task with one bot. |
| 10 · 63 · 3/3/2/4/5 | Both checkouts render “Connect to a server”, while the desktop connection smoke waits for an inline “Connect” button. It stops before the remaining assertions. | Follow the current Settings flow in `scripts/verify-server-connection.mjs` and the fixture, using `src/components/ConnectedWorkspacesSettings.tsx` as the contract. | Low to medium. Run the disposable Electron test to completion, retaining its cancellation, persistence and permission assertions. | Detect real regressions in desktop connection setup before release. |

## Measured behavior

| Identical task or assertion | Upstream | Upgraded |
| --- | --- | --- |
| Stale Undo of creation, edit, deletion, and edit to empty followed by deletion | Four accepted stale requests | Four HTTP 409 conflicts. Current state and journal retained in every case. |
| Correct a dated note, handwritten bullet or paragraph. Keep the new fact, omit the old one, allow unrelated queries to return nothing | 0/3 passed the prompt assertion | 3/3 passed the full prompt, search and on-disk assertions |
| Send “Where is our depot?” with two obsolete locations in the notebook | Scripted driver received 2 obsolete and 1 current locations | Scripted driver received 0 obsolete and 1 current locations |
| Offline behavior evals | 6/6 | 6/6 |

The prompt measurement inspects what the driver receives. It does not measure a model's answer quality. On a separate real process restart with the same private fixture data, the corrected note survived and reverting its old creation returned 409. The revisions use the existing nullable journal hash to distinguish deletion from a file with zero bytes. The check runs synchronously with the undo inside the server. A separate program writing at the same instant is outside an application-level transaction.

## Reproduction

Run from the repository root with the pinned package manager. The Vitest setup and verification launcher use temporary data. The undo cases run through the public memory API. The correction cases write notes through the existing memory-update implementation and evaluate the resulting prompt and search.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm exec vitest run server/memory-routes.test.ts -t 'stale change'
corepack pnpm exec vitest run server/memory-entries.test.ts -t 'only recalls'
corepack pnpm eval
```

To compare with the pinned base, apply just the two new regression test blocks to a disposable baseline checkout and run these same commands. For a driver-level check, launch the isolated fixture, save a notebook with two superseded entries and a current entry, send the query to a fresh bot, wait for settlement and inspect only `systemPrompt` in the fixture's `fake-claude-dump.json`. The initial server check used `control:omb doctor` with the launcher's explicit URL.

## Verification record

Tests ran on macOS arm64, Node 26.11.1, pnpm 10.33.0. The install used the upstream frozen lockfile. The baseline source fixture reported connected with one scripted engine. On upstream, typecheck, the frontend build, lint and the 84 existing memory store/journal/HTTP checks passed. The seven new regression cases failed on the original implementation.

| Command or suite | Result |
| --- | --- |
| `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm build` | All passed on the upgraded checkout. Vite emitted its chunk-size warning on both revisions. |
| `OMB_VITEST_WORKERS=2 corepack pnpm exec vitest run server/memory-*.test.ts server/workspace.test.ts server/recall.test.ts server/enterprise.test.ts server/brand.test.ts server/request-auth.test.ts server/cloud-computer-tools.test.ts server/routine-unattended-approval.e2e.test.ts` | 472 passed in 30 files on the final implementation. An earlier run overlapped the Markdown parser edit and failed three inline-strikethrough assertions. The rerun used fixed source throughout. |
| `corepack pnpm exec vitest run server/mcp-health.test.ts server/mcp-restart.e2e.test.ts server/mcp-strict-handshake.test.ts server/drivers/session-idle.test.ts server/recall-disclosure.test.ts server/recall.test.ts server/connected-reads.test.ts src/components/ConnectedWorkspacesSettings.test.ts` | 104 passed in eight files. The recall suite also appears in the preceding command. |
| `corepack pnpm broker:test` | 139 passed. |
| `corepack pnpm check:electron` and `corepack pnpm test:electron` | Syntax checked 464 modules. The Node tests passed 2,228 cases with 13 skipped. |
| `corepack pnpm build:server` then `node scripts/smoke-packaged-server.mjs` | Passed. The isolated bundle booted, its 14 proxy paths resolved, and CLI, MCP, backup, service trust, launcher and desktop entry checks passed. |
| `node scripts/verify-server-connection.mjs` | Failed on both revisions at “hosted workspace settings rendered”. The captured window had the saved workspace and the “Connect to a server” action. Later assertions did not execute. |
| `node scripts/verify-server-recovery.mjs` after building each revision's server | Failed on both revisions at the same busy-state assertion. The supervisor restarted the child, the runtime started a continuation, and the fixture expected the bot to be idle. Later assertions did not execute. |

The full cross-platform CI matrix and monolithic test command were outside this focused macOS run. Native installer acceptance, live provider accounts, real mailboxes, hardware control and live single-agent/team comparisons remain unverified.

**Recommended next slice.** Resolve the crash-recovery contract. The runtime explicitly asks a bot to verify an interrupted task before continuing it. The Electron smoke expects an idle bot and an unchanged prompt ledger. Establish which user-visible state applies, then use a counted synthetic side effect to verify that a crash and continuation cannot execute the same action twice. Keep the remainder of the smoke's authorization and retry-limit checks.

## Compatibility and release limits

Both implementation slices change core server behavior and use the existing request routes, journal rows, memory syntax and permission paths. Each has a separate local commit. There are no migrations or new dependencies. A later upstream change to memory parsing or rollback should be reconciled against the new regression cases. Direct file access still exposes the person's historical notes to authorized readers. Filtering the active prompt is not erasure.

This work does not establish cross-platform desktop acceptance, external MCP interoperability, live model performance or a product-wide security rating. The production frontend build warned about existing large chunks; the baseline and upgraded App chunk were both 2,451.78 kB (745.84 kB gzip). Startup, CPU, RSS and model latency were not benchmarked. Any performance work should start with the existing desktop benchmark and a fixed conversation dataset.
