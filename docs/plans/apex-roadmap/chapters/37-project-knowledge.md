# 37 · Project knowledge

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Bot folder

**Current state** The bot folder keeps a private SOUL mirror and compares its hash with the saved instructions. Existing case “lives under DATA_DIR/bots/<id>”.

**Sources** [server/bot-folder.ts](../../../../server/bot-folder.ts) · [server/bot-folder.test.ts](../../../../server/bot-folder.test.ts) · [src/components/bot-settings/SoulSection.tsx](../../../../src/components/bot-settings/SoulSection.tsx) · [src/lib/soul.ts](../../../../src/lib/soul.ts)

**Dependencies** APEX-04-01

**Risk** A project's editable instructions and its on-disk bot mirror can drift.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/bot-folder.test.ts`.

**Manual verification** Open the fixture bot folder and compare the instruction editor, mirror and next turn context.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-01 | Surface instruction mirror drift in project settings | Change only the disposable SOUL file after the bot profile was saved. | The inspector identifies the divergent revision before the next reviewed edit. |
| APEX-37-02 | Repair a missing instruction mirror from the saved profile | Delete the mirror in a fixture and reopen project settings. | The recovered file matches the profile hash and no unrelated file changes. |
| APEX-37-03 | Retain meaningful empty instructions | Clear a project's instruction field then restart its fixture server. | The empty state persists and an older instruction cannot reappear in context. |
| APEX-37-04 | Keep project instruction copies private on disk | Create two member-owned project bots using synthetic instructions. | Each folder retains the documented private file modes on a supporting filesystem. |
| APEX-37-05 | Show the instruction revision used by a project run | Save an instruction edit while an earlier turn remains open. | Its receipt distinguishes the earlier instruction hash from the next turn's hash. |

## Room folder

**Current state** Room work can fail with a specific missing-folder error rather than silently using another bot folder. Existing case “a room whose folder was deleted names that folder when work handed there fails, not the bot's settings”.

**Sources** [server/room-folder.ts](../../../../server/room-folder.ts) · [server/room-missing-folder.e2e.test.ts](../../../../server/room-missing-folder.e2e.test.ts)

**Dependencies** APEX-23-11

**Risk** A room task without its designated project folder can accidentally use another working directory.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/room-missing-folder.e2e.test.ts`.

**Manual verification** Run a room task from the fixture desktop and inspect its resolved folder and result.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-06 | Identify a removed project working folder by room | Move the fixture room folder aside before dispatching a file read. | The error names the room folder and no read uses the bot's default folder. |
| APEX-37-07 | Recover a room after selecting a replacement folder | Rebind a broken room to a new fixture directory with a known marker. | The next task reads that marker and the previous failure remains attributable. |
| APEX-37-08 | Keep similarly named project folders distinct | Give two rooms different folders both ending in Reports. | Each room's task reads its own distinct fixture file hash. |
| APEX-37-09 | Prevent an unrelated chat from inheriting room folder context | Alternate a room turn and private turn on the same bot. | Only the room turn gets the room-specific working directory. |
| APEX-37-10 | Recognize a project folder restored at the same path | Restore the missing fixture directory, then retry the room task. | The room becomes usable without changing bot-wide settings. |

## Project notes

**Current state** Project topics retain corrected history, alias indexing and a bounded active passage for recall. Existing case “reconciles a correction in a two-entry project topic, retaining the old version in the file”.

**Sources** [server/memory-topics.ts](../../../../server/memory-topics.ts) · [server/memory-topic-corrections.test.ts](../../../../server/memory-topic-corrections.test.ts)

**Dependencies** APEX-18-01

**Risk** A team can rely on an obsolete project decision after a correction.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-topic-corrections.test.ts`.

**Manual verification** Ask the fixture project bot for the current decision and inspect the linked source topic and preserved history.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-11 | Maintain a project decision's current and superseded values | Record two conflicting delivery dates with a clear correction. | The project answer uses the later date while the old value remains identifiable as historical. |
| APEX-37-12 | Resolve project aliases in context | Give a synthetic project a long name and an internal short name. | Both queries retrieve the same authoritative topic and current fact. |
| APEX-37-13 | Keep project scope on similarly named topics | Create two distinct projects with matching memo titles and different owners. | Each project answer cites only the intended project's fact. |
| APEX-37-14 | Expose a project note that contributed to an answer | Ask a specific decision question with a stored source topic. | The resulting disclosure or inspection record points to the actual topic and revision. |
| APEX-37-15 | Distinguish missing project knowledge from a confident guess | Remove the only source for a synthetic deadline then ask again. | The answer or retrieval evidence marks the deadline unavailable and cites no unrelated project. |

## Folder pages

**Current state** Folder pages can serve scoped data and range-read video to the embedded viewer with separate publication behavior. Existing case “shows a dashboard folder inline, serves its Parquet to the frame by token only, keeps other bots out, and gives the card its link on publish”.

**Sources** [server/pages/access.ts](../../../../server/pages/access.ts) · [server/folder-pages.e2e.test.ts](../../../../server/folder-pages.e2e.test.ts) · [server/page-files.ts](../../../../server/page-files.ts) · [server/pages/bundle.ts](../../../../server/pages/bundle.ts)

**Dependencies** APEX-23-11

**Risk** An embedded project page can show data from the wrong project or publish a private local file.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/folder-pages.e2e.test.ts`.

**Manual verification** Open the synthetic project dashboard and compare embedded data, linked files and its disposable preview bundle.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-16 | Display a dashboard against its own Parquet data | Seed two same-named datasets in distinct project folders. | The chart reflects its project's known rows and never serves the other dataset. |
| APEX-37-17 | Refresh a page viewer after project membership changes | Remove a fixture viewer with a dashboard already open. | Its next protected data read is refused and a current member still sees the chart. |
| APEX-37-18 | Keep local-only video out of a proposed publish bundle | Embed a synthetic project clip and stage the page for local inspection. | The inline page can read its clip and the staged publish inventory excludes its bytes. |
| APEX-37-19 | Invalidate a replaced dashboard file reference | Replace a project data file after its frame received the original link. | The old identity cannot serve the replacement silently. |
| APEX-37-20 | Carry project page provenance into the preview record | Build a disposable page preview from a committed fixture dataset. | The preview manifest associates its page, project and expected dataset hash without uploading anything. |
