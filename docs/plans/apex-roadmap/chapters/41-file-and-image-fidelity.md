# 41 · File and image fidelity

[Project APEX ledger](../README.md) · Multimodal, performance and reliability

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Originals

**Current state** The original-document store preserves selected uploads across working-copy edits and evicts by size and age. Existing case “keeps what the person sent as it arrives, through an in-place write and a rename over it”.

**Sources** [server/attachment-originals.ts](../../../../server/attachment-originals.ts) · [server/attachment-originals.test.ts](../../../../server/attachment-originals.test.ts) · [src/components/AttachmentStorageSettings.tsx](../../../../src/components/AttachmentStorageSettings.tsx)

**Dependencies** APEX-01-05

**Risk** Reopening a document after an edit can show bytes different from what the person originally supplied.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/attachment-originals.test.ts`.

**Manual verification** Compare the original attachment opened from chat with the edited disposable working copy.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-41-01 | Recover the original after an in-place edit | Upload a fixture document then overwrite its working copy without renaming it. | The original attachment still hashes to the upload while the working copy has the new hash. |
| APEX-41-02 | Keep the accepted original after atomic file replacement | Replace a fixture document with another file of equal size at the same path. | Opening the sent original returns the first revision's bytes. |
| APEX-41-03 | Apply per-document retention limits before copying | Upload files one byte below and above the configured limit. | The eligible original is retained and the oversized case reports its retention status. |
| APEX-41-04 | Evict the oldest eligible originals under storage pressure | Fill the fixture original store with known sizes and add one recent upload. | The store fits its byte limit and the newest eligible original remains retrievable. |
| APEX-41-05 | Remove an orphan original with its parent upload | Delete the last fixture reference and run store cleanup. | The original bytes and their reported storage usage are removed together. |

## Conversation media

**Current state** Turn attachments can be parked and later attached to the final reply, including voice transcripts with redaction. Existing case “lands every turn's voice notes with its images, their words kept as a redacted transcript”.

**Sources** [server/host/turn-attachments.ts](../../../../server/host/turn-attachments.ts) · [server/host/turn-attachments.test.ts](../../../../server/host/turn-attachments.test.ts)

**Dependencies** APEX-01-05

**Risk** A delayed media result can be attached to the wrong message or turn.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/turn-attachments.test.ts`.

**Manual verification** Inspect the transcript's saved media chips and their fixture turn IDs after settlement.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-41-06 | Land mixed images and voice notes on the correct reply | Complete one fixture turn with two images and a transcribed voice note. | All three appear once on its intended final reply. |
| APEX-41-07 | Represent a wordless recording without invented text | Attach a silent synthetic clip whose transcription result is empty. | Playback is available and no transcript string is fabricated. |
| APEX-41-08 | Keep parked attachments separate by generation | Delay a turn's images until a successor starts. | The late files attach only to the originating turn or get its explicit expired outcome. |
| APEX-41-09 | Attach valid media above a terminal error | End a fixture turn with a produced image followed by a provider error. | The image remains available and the terminal error remains visible. |
| APEX-41-10 | Respect coordinator-specific media handling | Return images and voice material from a synthetic goal coordinator. | The stored attachments follow the documented per-media policy with no leaked worker artifacts. |

## Driver images

**Current state** Chat image preparation validates payload type and accounts for input and screenshot batches against a turn budget. Existing case “rejects encoded text and mismatched MIME claims while preserving a PNG”.

**Sources** [server/drivers/chat-images.ts](../../../../server/drivers/chat-images.ts) · [server/drivers/chat-images.test.ts](../../../../server/drivers/chat-images.test.ts)

**Dependencies** APEX-01-05

**Risk** A wrong media type or oversized image batch can exhaust input budget or mislead a model.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/drivers/chat-images.test.ts`.

**Manual verification** Compare the original fixture image bytes, declared MIME and recorded driver payload.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-41-11 | Verify decoded image type before adapter submission | Offer a valid fixture PNG under a conflicting image label. | The adapter receives either the verified type or an explicit refusal, never the false label. |
| APEX-41-12 | Charge successive screenshot batches to a single turn budget | Add three fixture image batches whose combined size exceeds the threshold. | The over-budget batch is bounded and earlier accepted images remain correctly accounted. |
| APEX-41-13 | Keep the text turn usable after an image is removed | Remove one attachment between selecting it and sending the fixture turn. | The driver receives the remaining text with a precise missing-media indication. |
| APEX-41-14 | Preserve image order for a side-by-side comparison | Send two visibly different fixture diagrams under matching display names. | Their decoded hash order matches the person's attachment order. |
| APEX-41-15 | Reject encoded text masquerading as an image without losing siblings | Pack valid PNG, invalid image and valid JPEG in one fixture submission. | The invalid item is accurately identified and the result accounts for both legitimate siblings. |

## Composer attachments

**Current state** Composer attachment state separates upload cleanup, pasted content and typed draft text. Existing case “asks the server to drop an uploaded file taken off the message, and nothing else”.

**Sources** [src/lib/composer-attachments.ts](../../../../src/lib/composer-attachments.ts) · [src/lib/composer-attachments.test.ts](../../../../src/lib/composer-attachments.test.ts) · [src/components/ComposerAttachments.tsx](../../../../src/components/ComposerAttachments.tsx)

**Dependencies** APEX-06-01

**Risk** Pasting or removing an attachment can erase a draft or orphan uploaded bytes.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/composer-attachments.test.ts`.

**Manual verification** Compose from the fixture desktop and inspect the saved message and temporary upload inventory.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-41-16 | Drop only the removed upload | Attach two temporary files, remove the first chip and send. | The cleanup targets the first upload once and the second remains readable from chat. |
| APEX-41-17 | Keep large pasted content distinct from typed prose | Paste a multiline fixture block beside an existing typed request. | The sent payload preserves the request and the exact pasted content as designed. |
| APEX-41-18 | Preserve newline boundaries on paste | Paste the same fixture paragraph into drafts ending with and without a newline. | Both resulting drafts have one intended separator and no lost character. |
| APEX-41-19 | Retain attachment order while uploads finish out of order | Select three fixtures and delay the first upload response. | The final message lists all successful chips in selection order. |
| APEX-41-20 | Expose one failed upload without discarding the ready items | Fail the middle upload, repair the source and retry just that item. | The final send has three unique attachments and the two ready files were not reuploaded. |
