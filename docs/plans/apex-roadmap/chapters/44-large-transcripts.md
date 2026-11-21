# 44 · Large transcripts

[Project APEX ledger](../README.md) · Multimodal, performance and reliability

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Transcript window

**Current state** Transcript windows bound the mounted range and include a separate allowance to preserve selections. Existing case “shows everything when the thread is shorter than the window”.

**Sources** [src/lib/transcript-window.ts](../../../../src/lib/transcript-window.ts) · [src/lib/transcript-window.test.ts](../../../../src/lib/transcript-window.test.ts) · [src/lib/transcript-follow.ts](../../../../src/lib/transcript-follow.ts)

**Dependencies** APEX-01-15

**Risk** Virtualization can hide the newest message or grow without bound when scrolling.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/transcript-window.test.ts`.

**Manual verification** Scroll an isolated synthetic transcript while recording rendered IDs and the visible anchor.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-44-01 | Render the exact window boundary without omissions | Seed conversations one below, at and one above the initial window size. | Each shows its newest message and exactly the intended contiguous ID interval. |
| APEX-44-02 | Load an older page without jumping the reader | Scroll to the beginning of the current window and prepend a fixture page. | The previously visible anchor retains its text and reading position. |
| APEX-44-03 | Bound rendered rows during a long traverse | Walk from newest to oldest through 10,000 synthetic messages. | Mounted row count stays inside the documented window and selection allowance. |
| APEX-44-04 | Reach the first message after repeated expansions | Expand complete fixture pages plus one short final page. | The earliest ID appears once and another expansion issues no empty-page loop. |
| APEX-44-05 | Handle new messages while viewing a historical window | Release 50 fixture responses while the reader stays several windows back. | The reading anchor is retained and the latest control reports new content. |

## Derived rows

**Current state** Derived transcript lookups group edit versions, resolve replies across branches and identify the eligible retry row. Existing case “gives every message the edit versions the per-bubble scan gave”.

**Sources** [src/lib/transcript-derivations.ts](../../../../src/lib/transcript-derivations.ts) · [src/lib/transcript-derivations.test.ts](../../../../src/lib/transcript-derivations.test.ts)

**Dependencies** APEX-01-15

**Risk** Deriving rows by repeated transcript scans can make edits, forks and retries costly.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/transcript-derivations.test.ts`.

**Manual verification** Inspect edit versions, day separators and retry controls in a long fixture chat.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-44-06 | Preserve message edit lineage across window boundaries | Put an edited question outside the current visible window and its revision inside. | The visible row opens the correct original and ordered revisions. |
| APEX-44-07 | Resolve a reply targeting a sibling branch message | Construct a fixture branch referencing a stored predecessor. | The displayed quote resolves its actual target and never an equal-text message. |
| APEX-44-08 | Place Retry only on the last eligible conversational row | Append a digest and compaction marker after a failed answer. | One retry control belongs to that answer and none to bookkeeping rows. |
| APEX-44-09 | Place day dividers correctly across local midnight | Seed messages bracketing midnight and a daylight-saving change. | Separators reflect each message's local calendar day with no duplicate date labels. |
| APEX-44-10 | Measure lookup growth on increasingly large transcripts | Build equal-shape 1k, 5k and 10k fixtures and count full scans per render. | The report gives scan counts at each size and flags any per-row full-history scan. |

## Selection

**Current state** Transcript selection stores endpoints and can restore selected text after its rows leave the hold window. Existing case “keeps its rows drawn while the reader scrolls a few steps away, and copies the same text on return”.

**Sources** [src/lib/transcript-selection.ts](../../../../src/lib/transcript-selection.ts) · [src/lib/transcript-selection.test.ts](../../../../src/lib/transcript-selection.test.ts)

**Dependencies** APEX-06-16

**Risk** Virtualized selection can copy hidden or newly inserted text without the reader noticing.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/transcript-selection.test.ts`.

**Manual verification** Select fixture text with mouse and keyboard and compare clipboard contents with the intended range.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-44-11 | Keep a short selection alive across a nearby scroll | Select a sentence spanning three rows then scroll within the hold window. | Returning to it copies exactly the originally selected characters. |
| APEX-44-12 | Restore selection after the hold cap is exceeded | Scroll far enough to set the selection aside then return. | Its text and endpoints match the stored fixture IDs. |
| APEX-44-13 | Exclude newly mounted neighboring rows from selection | Prepend two rows beside a partially visible selection endpoint. | Clipboard text contains neither new row. |
| APEX-44-14 | Clamp an endpoint outside the transcript | Extend selection from the chat into an adjacent fixture panel. | Transcript copy ends at the nearest selected row and excludes unrelated panel text. |
| APEX-44-15 | Clear selection ownership on thread switch | Select a unique marker in A, switch to B and copy from B. | B's clipboard result contains no marker from A. |

## Transcript export

**Current state** Markdown export formats people, bot senders, cards, tools, message times and conversation filenames. Existing case “formats an empty conversation cleanly”.

**Sources** [src/lib/export-transcript.ts](../../../../src/lib/export-transcript.ts) · [src/lib/export-transcript.test.ts](../../../../src/lib/export-transcript.test.ts) · [src/components/ExportTranscriptMenu.tsx](../../../../src/components/ExportTranscriptMenu.tsx)

**Dependencies** APEX-01-05

**Risk** A transcript export can reorder speakers, omit attachments or expose internal control data.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/export-transcript.test.ts`.

**Manual verification** Open the generated Markdown from a disposable fixture and compare it with the visible source conversation.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-44-16 | Export a long conversation beyond the current UI window | Export a 3,000-message synthetic chat while only its tail is mounted. | The file contains every eligible message once in chronological order. |
| APEX-44-17 | Keep same-named room speakers distinguishable | Export a fixture room containing two bots with the same display name. | A reviewer can attribute each contribution consistently with its source record. |
| APEX-44-18 | Preserve multiline code fences and quotations in export | Include nested-looking Markdown, a code block and quoted list items. | The exported content recovers the original code text and message boundaries. |
| APEX-44-19 | Represent approval and tool outcomes faithfully | Export a conversation with one allowed and one denied fixture call. | Both outcomes remain distinguishable and zero synthetic secrets appear. |
| APEX-44-20 | Generate usable filenames from unusual thread titles | Export titles containing emoji, reserved punctuation and only whitespace. | All filenames are valid on the target desktop and repeated exports do not silently overwrite different chats. |
