# 19 · Corrections and forgetting

[Project APEX ledger](../README.md) · Advanced memory

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Forget matching

**Current state** Forgetting matches named facts in notes, topics and dated entries while preserving structural Markdown. Existing case “matches whole words however the note was typed, and refuses a passage too short to name anything”.

**Sources** [server/memory-forget.ts](../../../../server/memory-forget.ts) · [server/memory-forget.test.ts](../../../../server/memory-forget.test.ts) · [server/memory-forget-details.test.ts](../../../../server/memory-forget-details.test.ts)

**Dependencies** APEX-01-10

**Risk** Broad forgetting can erase unrelated notes with similar words.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-forget.test.ts`.

**Manual verification** Review the fixture notebook diff and ask for the retained control fact after forgetting.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-19-01 | Keep substring neighbors when forgetting a whole word | Forget "Ann" in notes that separately name "Joanne". | Only whole-word matches disappear and the neighbor remains retrievable. |
| APEX-19-02 | Preserve a topic's frontmatter while forgetting a fact | Remove the only matching line beneath a topic heading. | Header, aliases and unrelated headings survive unchanged. |
| APEX-19-03 | Forget from a dated log by content | Put two unrelated facts from the same source chat in one log. | Only the named fact is removed. |
| APEX-19-04 | Prevent a too-short forget request from changing memory | Submit a one-character ambiguous target against three notes. | Zero files change and the response requests a more specific target. |
| APEX-19-05 | Keep forgetting limited to the requesting owner | Give two fixture members the same fact and let one forget it. | The requester loses the fact while the second retains it. |

## Entry correction

**Current state** Entry parsing handles continuation lines, fences, expiry dates and superseded facts. Existing case “gives an entry the lines under it: indented ones and a code block it opens, never a fence that does not close”.

**Sources** [server/memory-entries.ts](../../../../server/memory-entries.ts) · [server/memory-entries.test.ts](../../../../server/memory-entries.test.ts)

**Dependencies** APEX-01-09

**Risk** A correction can leave a superseded multiline fact active.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-entries.test.ts`.

**Manual verification** Inspect the raw Markdown, active-entry view and resulting fixture prompt after each edit.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-19-06 | Bind continuation lines to their corrected entry | Replace an old entry followed by indented explanations. | No continuation from the old entry remains in active recall. |
| APEX-19-07 | Handle a fenced example inside an obsolete entry | Correct a fact whose body includes a closed code fence. | The fence follows its obsolete entry and the next independent note stays active. |
| APEX-19-08 | Expire a note only after its final calendar day | Read an until-dated note before midnight, on the date and the next day. | Only the final reading excludes it in the declared calendar zone. |
| APEX-19-09 | Reject invalid calendar dates without expiring valid notes | Add a leap-day and a nonexistent date to sibling entries. | The valid entry follows the real boundary and the invalid date causes no accidental expiry. |
| APEX-19-10 | Deduplicate cosmetic rewrites | Save the same fact with leading bullet, trailing period and whitespace variants. | The active view contains one logical fact. |

## Journal undo

**Current state** The journal records per-change diffs and revision information used by Undo. Existing case “diffs a shared prefix exactly as the full line table does”.

**Sources** [server/memory-journal.ts](../../../../server/memory-journal.ts) · [server/memory-journal.test.ts](../../../../server/memory-journal.test.ts) · [server/memory-store.ts](../../../../server/memory-store.ts) · [server/memory-routes.test.ts](../../../../server/memory-routes.test.ts)

**Dependencies** APEX-01-10

**Risk** Undo on stale content can discard someone else's newer edit.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-journal.test.ts`.

**Manual verification** Compare journal entries and file hashes before a stale Undo and after a reviewed retry.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-19-11 | Reject Undo after a newer external edit | Edit a reviewed fixture note with a second writer before clicking Undo. | The response is a conflict and both the newer bytes and journal count remain unchanged. |
| APEX-19-12 | Distinguish deletion from an empty file during Undo | Cycle one note through empty, deleted and recreated states. | The journal restores the correct state for each distinct revision. |
| APEX-19-13 | Keep distant edits in separate journal hunks | Change the first and last lines of a long fixture note. | Two hunks show correct line counts and local context for both changes. |
| APEX-19-14 | Make a replayed Undo request harmless | Submit the same reviewed Undo action twice. | At most one inverse change is committed and no duplicate successful reversal appears. |
| APEX-19-15 | Keep a journal preview bounded for a large correction | Replace a long fixture note in its middle and both ends. | The preview observes its diff cap and explicitly identifies omitted material. |

## Reviewed deletes

**Current state** The public memory route checks reviewed content digests and returns the current content on a conflicting save or delete. Existing case “serves an overview with the budget, the folder, and the old whole-file fields”.

**Sources** [server/routes/bot-memory.ts](../../../../server/routes/bot-memory.ts) · [server/memory-routes.test.ts](../../../../server/memory-routes.test.ts) · [src/lib/memory.ts](../../../../src/lib/memory.ts)

**Dependencies** APEX-01-10

**Risk** A stale delete may remove newly supplied facts.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-routes.test.ts`.

**Manual verification** Use the member's disposable memory panel and inspect bytes and journal across review, conflict and retry.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-19-16 | Prevent a stale dated-log delete after another append | Review a log, append a second fact and submit the original digest. | The request conflicts and both facts and journal are preserved. |
| APEX-19-17 | Handle review of a legitimately empty note | Open a zero-byte topic then request deletion with its actual digest. | The note disappears once and the journal records deletion of empty content. |
| APEX-19-18 | Refresh the review after a delete conflict | Race two fixture editors and reopen the losing editor's review. | The newer text is visible before the second delete can be confirmed. |
| APEX-19-19 | Protect a replacement note with the same filename | Delete and recreate a topic with different bytes between review and submit. | The old digest cannot remove the replacement. |
| APEX-19-20 | Retain compatibility for a documented legacy caller | Exercise the historical query-path delete and the reviewed body format on separate fixture notes. | Each documented request shape reaches its own behavior and reviewed input never degrades into an unconditional delete. |
