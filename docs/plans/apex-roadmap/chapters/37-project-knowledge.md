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

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/bot-folder.test.ts`.

**Manual verification** Open the fixture bot folder and compare the instruction editor, mirror and next turn context.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-01 | Surface instruction mirror drift in project settings | Change only the disposable SOUL file after the bot profile was saved. | The inspector identifies the divergent revision before the next reviewed edit. |
| APEX-37-02 | Repair a missing instruction mirror from the saved profile | Delete the mirror in a fixture and reopen project settings. | The recovered file matches the profile hash and no unrelated file changes. |
| APEX-37-03 | Retain meaningful empty instructions | Clear a project's instruction field then restart its fixture server. | The empty state persists and an older instruction cannot reappear in context. |
| APEX-37-04 | Keep project instruction copies private on disk | Create two member-owned project bots using synthetic instructions. | Each folder retains the documented private file modes on a supporting filesystem. |
| APEX-37-05 | Show the instruction revision used by a project run | Save an instruction edit while an earlier turn remains open. | Its receipt distinguishes the earlier instruction hash from the next turn's hash. |

## Project knowledge sources

**Current state** Room work resolves a designated folder and reports when that folder is missing. Topic matching and workspace context supply separate source identities to a project turn.

**Sources** [server/room-folder.ts](../../../../server/room-folder.ts) · [server/room-missing-folder.e2e.test.ts](../../../../server/room-missing-folder.e2e.test.ts) · [server/workspace.ts](../../../../server/workspace.ts) · [server/memory-topics.ts](../../../../server/memory-topics.ts) · [server/memory-topic-corrections.test.ts](../../../../server/memory-topic-corrections.test.ts)

**Dependencies** APEX-23-11

**Risk** A project answer can cite another project's document or retain facts from a superseded knowledge source.

**Risk level** High

**Automated verification** Seed two disposable project folders and two topic layers. Inspect chosen folder, source IDs and available passages at the driver boundary for each knowledge query.

**Manual verification** Ask each fixture project the same question, open its cited source and compare the answer with the accepted project document or topic revision.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-06 | Identify a missing knowledge folder before answering from documents | Move the selected project folder away and ask for a fact unique to its project brief. | The answer records missing project evidence and includes no fallback fact from a different folder. |
| APEX-37-07 | Refresh project knowledge after rebinding a room folder | Choose a replacement directory with a revised rollout date in its project brief. | The next eligible turn cites the replacement source and shows its revised date. |
| APEX-37-08 | Disambiguate projects whose knowledge folders share a basename | Place different fixture decisions in two folders ending in Research. | Each project's prompt contains its own decision and source path with no other-project marker. |
| APEX-37-09 | Keep room-only knowledge out of private chat context | Alternate a project-room question with a personal question using the same bot. | The personal turn has no room-only source unless an authorized selection explicitly provides it. |
| APEX-37-10 | Recover a restored project source without duplicating it | Restore a temporarily unavailable knowledge directory and rerun the original query. | The recovered document is available under one original project identity and is cited once. |

## Project notes

**Current state** Project topics retain corrected history, alias indexing and a bounded active passage for recall. Existing case “reconciles a correction in a two-entry project topic, retaining the old version in the file”.

**Sources** [server/memory-topics.ts](../../../../server/memory-topics.ts) · [server/memory-topic-corrections.test.ts](../../../../server/memory-topic-corrections.test.ts)

**Dependencies** APEX-18-01

**Risk** A team can rely on an obsolete project decision after a correction.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-topic-corrections.test.ts`.

**Manual verification** Ask the fixture project bot for the current decision and inspect the linked source topic and preserved history.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-11 | Maintain a project decision's current and superseded values | Record two conflicting delivery dates with a clear correction. | The project answer uses the later date while the old value remains identifiable as historical. |
| APEX-37-12 | Resolve project aliases in context | Give a synthetic project a long name and an internal short name. | Both queries retrieve the same authoritative topic and current fact. |
| APEX-37-13 | Keep project scope on similarly named topics | Create two distinct projects with matching memo titles and different owners. | Each project answer cites only the intended project's fact. |
| APEX-37-14 | Expose a project note that contributed to an answer | Ask a specific decision question with a stored source topic. | The resulting disclosure or inspection record points to the actual topic and revision. |
| APEX-37-15 | Distinguish missing project knowledge from a confident guess | Remove the only source for a synthetic deadline then ask again. | The answer or retrieval evidence marks the deadline unavailable and cites no unrelated project. |

## Project document reading and revisions

**Current state** Project pages can serve range reads to scoped viewers. Message files and the attachment preview provide a source-bound path for reading documents inside a conversation.

**Sources** [server/page-files.ts](../../../../server/page-files.ts) · [server/page-files.test.ts](../../../../server/page-files.test.ts) · [server/folder-pages.e2e.test.ts](../../../../server/folder-pages.e2e.test.ts) · [server/message-file.ts](../../../../server/message-file.ts) · [src/components/AttachmentPreview.tsx](../../../../src/components/AttachmentPreview.tsx)

**Dependencies** APEX-23-11

**Risk** A project reader can display another member's document or silently substitute bytes revised after review.

**Risk level** Critical

**Automated verification** Run page-files, message-file and folder-pages fixtures against two projects with duplicate document names. Compare byte ranges, permission decisions, preview identity and accepted revisions.

**Manual verification** Open each fixture document from its chat message and project page. Review a changed document as its author and as a second member whose access can be revoked.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-37-16 | Preview the attached revision of a project document | Open a report attached in chat after the working copy was edited under the same name. | The reader identifies the attached revision and its preview matches its stored hash. |
| APEX-37-17 | Recover a project reader from a stale document offset | Reopen a synthetic report at a bookmarked offset beyond its new length. Observe the range response and retry from the start through the same viewer. | The first read returns 416 with the current byte length. The retry returns the new opening bytes under the same document identity and clears the read error. |
| APEX-37-18 | Cancel a document save when its selected source changes | Hold the first report's download response and select a second report before releasing the original response. Then save the second report through the attachment control. | The delayed response creates zero downloads under the second report's name. Its own save delivers exactly one file with the second report's digest. |
| APEX-37-19 | Explain an unsupported document preview while retaining the file | Open a permitted fixture document whose format the previewer cannot render. | The reader identifies the format limitation and its supported download returns the original byte hash. |
| APEX-37-20 | Keep local media out of a document's shared publication package | Compose a fixture project page backed by a document and a local-only clip, then inspect a staged publication. | The staged source inventory accounts for the document and excludes the local-only clip. |
