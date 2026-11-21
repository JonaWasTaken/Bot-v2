# 38 · Artifact provenance

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Attachment lineage

**Current state** Conversation attachment inventory uses the person's recorded uploads and ignores apparent tags in bot or peer text. Existing case “lists the person's attached files by the name they gave and the copies shown in the conversation”.

**Sources** [server/conversation-attachments.ts](../../../../server/conversation-attachments.ts) · [server/conversation-attachments.test.ts](../../../../server/conversation-attachments.test.ts)

**Dependencies** APEX-23-11

**Risk** A model can mistake a mentioned file for an attachment supplied by the person.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/conversation-attachments.test.ts`.

**Manual verification** Compare chat attachment chips and IDs with the fixture person's original uploads.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-38-01 | Distinguish typed file mentions from actual uploads | Type a fixture filename then attach a different file with that display name. | Only the real upload gains person-supplied attachment provenance. |
| APEX-38-02 | Keep two equal filenames distinct in a conversation | Attach two different report.csv files in separate messages. | Opening either chip yields the hash and message ID of its own upload. |
| APEX-38-03 | Do not infer ownership from bot-generated attachment text | Echo a person's previous attachment tag in a bot reply. | The attachment inventory gains no new person-origin record. |
| APEX-38-04 | Retain original labels when a working copy changes | Rename a fixture working copy after its source message is saved. | The message provenance retains the original label and points to the accepted snapshot. |
| APEX-38-05 | Bound report-back briefs without changing their artifact references | Send legal and over-limit briefs carrying the same attachment. | The legal brief keeps the original attachment ID and the refused brief creates no new lineage. |

## Page bytes

**Current state** Page files bind documents and viewers to scoped access and support read-only byte ranges. Existing case “gives each viewer a token of their own, which stops answering the moment they may no longer see the page”.

**Sources** [server/page-files.ts](../../../../server/page-files.ts) · [server/page-files.test.ts](../../../../server/page-files.test.ts)

**Dependencies** APEX-37-16

**Risk** Sharing a page by filename alone can expose a newer or unauthorized artifact.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/page-files.test.ts`.

**Manual verification** Open the fixture page as two viewers and compare file identity, range bytes and revoked access.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-38-06 | Bind a page document to a stable storage folder | Reload one document then open a different document with the same title. | Reload reuses the first folder and the second document receives a separate one. |
| APEX-38-07 | Revoke exactly one viewer's page token | Remove viewer B while A remains eligible to see a page. | B loses access immediately and A still reads the original bytes. |
| APEX-38-08 | Verify range responses against the original artifact | Request three disjoint ranges of synthetic Parquet data. | Each response equals the corresponding source slice and reports its correct range. |
| APEX-38-09 | Keep read-only page artifacts immutable through the viewer | Open an immutable fixture file through a page and attempt a benign update by its supported interface. | The viewer has no write operation and the artifact hash remains unchanged. |
| APEX-38-10 | Make missing page components visible in provenance | Remove one referenced synthetic asset before an offline page review. | The report names the missing path and does not certify a complete bundle. |

## Peer provenance

**Current state** Peer provenance describes author and origin and distinguishes a room post from a person-authored instruction. Existing case “names the author and says the text is not from the user”.

**Sources** [server/peer-provenance.ts](../../../../server/peer-provenance.ts) · [server/peer-provenance.test.ts](../../../../server/peer-provenance.test.ts) · [server/provenance-label.ts](../../../../server/provenance-label.ts)

**Dependencies** APEX-01-13

**Risk** A peer contribution may be presented as a direct request from the person.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/peer-provenance.test.ts`.

**Manual verification** Compare the fixture work-origin label with the originating member, bot or room event.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-38-11 | Label a peer's research note as peer-authored | Hand a synthetic note from analyst to writer. | The receiving context identifies the analyst and does not assign user authority to the note. |
| APEX-38-12 | Preserve provenance after forwarding a room contribution | Forward a room finding into a private project discussion. | The source room and author remain discoverable without converting it into a user command. |
| APEX-38-13 | Distinguish a question addressed to a bot from a room post | Deliver identical fixture text through each supported event. | The default response behavior follows the event kind and retains its correct origin. |
| APEX-38-14 | Keep unusual display names within a single provenance field | Choose fixture author names containing separators and line breaks. | The rendered origin note has one author and exactly its declared authority. |
| APEX-38-15 | Handle an unknown work origin conservatively | Load a synthetic legacy record with no explicit peer metadata. | The presentation marks origin unavailable and assigns no invented author. |

## Origin labels

**Current state** Harness-generated origin labels encode author, source and authority. The person's own typed one-to-one line stays intact. Existing case “writes who, what and exactly one authority between the separators”.

**Sources** [server/provenance-label.ts](../../../../server/provenance-label.ts) · [server/provenance-label.test.ts](../../../../server/provenance-label.test.ts) · [src/lib/export-transcript.ts](../../../../src/lib/export-transcript.ts) · [src/components/ExportTranscriptMenu.tsx](../../../../src/components/ExportTranscriptMenu.tsx)

**Dependencies** APEX-01-13

**Risk** A provenance badge inconsistent with the actual authority can mislead a reviewer.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/provenance-label.test.ts`.

**Manual verification** Open the fixture transcript and compare displayed provenance against its raw normalized source.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-38-16 | Keep a direct personal message free of synthetic attribution | Send a normal one-to-one fixture message and inspect its stored text. | It appears once with the person's actual identity and no harness-generated authority note. |
| APEX-38-17 | Normalize all generated origin labels to the documented fields | Exercise a routine, room note and direct handoff with marked authors. | Each has one who, one what and one authority value in the normalized representation. |
| APEX-38-18 | Avoid showing two competing origin badges on replay | Replay a previously labeled fixture message after reconnect. | Exactly one origin label is associated with the original message ID. |
| APEX-38-19 | Recover unknown historical labels in the inspector | Load a pre-label synthetic item and open its details. | The inspector states that provenance is unavailable while keeping the item readable. |
| APEX-38-20 | Preserve readable attribution on export | Export a synthetic project exchange containing human, bot and delegated material. | A reviewer can match each output to its original actor and authority without private routing fields. |
