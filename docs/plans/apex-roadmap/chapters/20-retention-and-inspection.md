# 20 · Retention and inspection

[Project APEX ledger](../README.md) · Advanced memory

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Notebook storage

**Current state** The memory store distinguishes the index, topics and dated logs under each bot's workspace. Existing case “accepts the three shapes memory actually has”.

**Sources** [server/memory-store.ts](../../../../server/memory-store.ts) · [server/memory-store.test.ts](../../../../server/memory-store.test.ts) · [src/components/bot-settings/MemorySection.tsx](../../../../src/components/bot-settings/MemorySection.tsx)

**Dependencies** APEX-01-10

**Risk** Retention accounting can misclassify topics, daily logs and the notebook index.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-store.test.ts`.

**Manual verification** Browse the fixture memory overview and compare paths and reported bytes with its temporary directory.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-20-01 | Attribute storage to the correct document class | Seed one index, two topics and three dated logs of known byte lengths. | Per-class counts and byte totals match all six fixture files. |
| APEX-20-02 | Expose an empty notebook without inventing files | Open the overview on a newly created bot before its first note. | Zero stored notes are reported and inspection writes no synthetic fact. |
| APEX-20-03 | Count UTF-8 bytes consistently in memory budgets | Save a note made of mixed emoji and ASCII near the configured limit. | The store's reported usage matches its encoded size. |
| APEX-20-04 | Keep unreadable documents from hiding healthy ones | Mark one synthetic topic unavailable while leaving two readable. | Healthy notes remain inspectable and the inaccessible item has a distinct outcome. |
| APEX-20-05 | Refresh storage totals after a reviewed delete | Remove a known-size daily log through its public fixture route. | Both the overview and disk total decrease by the removed bytes. |

## Upkeep cadence

**Current state** Upkeep manages delayed jobs, generations and single-flight extraction or dream work across restart. Existing case “keeps a moved desktop's memory unchanged when frozen before the first tick”.

**Sources** [server/memory-upkeep.ts](../../../../server/memory-upkeep.ts) · [server/memory-upkeep-lifecycle.test.ts](../../../../server/memory-upkeep-lifecycle.test.ts) · [server/memory-upkeep-writes.test.ts](../../../../server/memory-upkeep-writes.test.ts) · [server/workspace-backup.ts](../../../../server/workspace-backup.ts)

**Dependencies** APEX-01-09

**Risk** Background retention can continue after a workspace is frozen or moved.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-upkeep-lifecycle.test.ts`.

**Manual verification** Advance the fixture scheduler clock and inspect capture jobs, writes and startup markers.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-20-06 | Honor a freeze applied before the first upkeep tick | Freeze the fixture workspace immediately after construction. | No capture, tidy or dream write occurs during the full startup interval. |
| APEX-20-07 | Reset the startup grace period on service restart | Stop halfway through the delay and restart the upkeep service. | The first eligible tick waits the complete configured delay from restart. |
| APEX-20-08 | Ignore an obsolete dream response from a previous lifecycle | Restart while a synthetic model response is held then release both generations. | Only the current generation can update notebook state. |
| APEX-20-09 | Keep a failed maintenance item eligible without a hot retry loop | Fail one synthetic capture and advance time across retry intervals. | Attempts follow the configured cadence and healthy notes remain unchanged. |
| APEX-20-10 | Drain outstanding writes before a fixture backup | Request a notebook backup during one pending maintenance write. | The snapshot corresponds wholly to a committed revision and the journal agrees. |

## Note relocation

**Current state** Moving a memory layer handles notes, topics, logs and journal data at its destination. Existing case “moves the notes, topics, logs and journal, merging with what is there, and leaves an empty memory behind”.

**Sources** [server/memory-move.ts](../../../../server/memory-move.ts) · [server/memory-move.test.ts](../../../../server/memory-move.test.ts)

**Dependencies** APEX-01-10

**Risk** Moving notebooks can overwrite destination facts or leave partial histories.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-move.test.ts`.

**Manual verification** Move two synthetic notebooks, reopen both destinations and compare their files and journal.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-20-11 | Merge disjoint topic names on a notebook move | Move a source containing travel into a destination containing billing. | Both original document hashes remain readable under their intended names. |
| APEX-20-12 | Resolve same-name topics without silent loss | Move two distinct topics named project into one destination. | The result retains both bodies or reports an explicit recoverable conflict. |
| APEX-20-13 | Keep dated logs chronological after merging | Seed source and destination with overlapping dates and different entries. | All distinct entries survive and the date index lists each day once. |
| APEX-20-14 | Make a completed move safe to retry | Run the same move twice after source cleanup. | The second run adds zero documents and zero duplicate journal entries. |
| APEX-20-15 | Recover a move interrupted before source cleanup | Stop the fixture between destination commit and source removal then resume. | Every pre-move fact is recoverable and no completed entry appears twice. |

## Member inspection

**Current state** The member Library panel lists personal and team notes and uses their respective routes for removal. Existing case “on a Team Cloud shows what the bot remembers about the person, from their own notes, and lets them forget it”.

**Sources** [src/components/bot-panel/pages.tsx](../../../../src/components/bot-panel/pages.tsx) · [src/components/bot-panel/MemoryPage.team.test.ts](../../../../src/components/bot-panel/MemoryPage.team.test.ts)

**Dependencies** APEX-01-10

**Risk** A personal library UI can blend member-owned and team-owned notes.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/bot-panel/MemoryPage.team.test.ts`.

**Manual verification** Inspect Library as two fixture members and trace each operation to its resolved notebook.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-20-16 | Separate team and personal rows with identical text | Save one identical fact to each scope for the current user. | The UI lists both sources and removal targets only the chosen source. |
| APEX-20-17 | Keep the Library count synchronized with forgetting | Forget one of three personal notes and revisit the tab. | The visible count and row count both decrease by one. |
| APEX-20-18 | Refresh stale personal-note content before inspection continues | Change a topic in a second fixture window during review. | Reopening shows the latest bytes and the action binds their digest. |
| APEX-20-19 | Preserve the selected member on a delayed overview response | Switch synthetic accounts before the old overview returns. | No former member note appears in the new member's list. |
| APEX-20-20 | Expose recoverable notebook load failures | Fail one overview read and restore the fixture before retry. | One visible failure is replaced by the correct rows without duplicating entries. |
