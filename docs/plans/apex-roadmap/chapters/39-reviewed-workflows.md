# 39 · Reviewed workflows

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Connector file transfer receipts

**Current state** The connector file path obtains upload destinations from the service and distinguishes member installations from project credentials. File transfers have a separate outcome from the chat requesting them.

**Sources** [server/composio-files.ts](../../../../server/composio-files.ts) · [server/composio-files.test.ts](../../../../server/composio-files.test.ts) · [server/connector-files.ts](../../../../server/connector-files.ts) · [server/connector-files.test.ts](../../../../server/connector-files.test.ts) · [server/host/member-uploads.ts](../../../../server/host/member-uploads.ts)

**Dependencies** APEX-21-01

**Risk** A connector transfer can put an attachment in a different member's account or misreport an unfinished upload as complete.

**Risk level** Critical

**Automated verification** Extend the Composio and connector-files tests against an inert local service. Record the member installation, request count, accepted hash and completion receipt.

**Manual verification** Open the fixture attachment in the corresponding connected account view and compare file name, installation and byte count with the desktop transfer receipt.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-01 | Bind a connector file upload to the member installation | Request an upload as A and then B using identically named fixture documents. | Each service receipt identifies only the requesting member's synthetic installation. |
| APEX-39-02 | Keep a rejected upload target out of the transfer journal | Return a fixture destination outside the connector's supported storage policy. | The transfer ends with a clear refusal, zero uploaded bytes and no successful receipt. |
| APEX-39-03 | Match the uploaded bytes with the source attachment | Submit an ordinary fixture document through the supported file relay and verify at the recording receiver. | The report's hash and byte length match both the selected attachment and received content. |
| APEX-39-04 | Distinguish account discovery failure from upload failure | Fail the installation lookup in one trial and the actual file transfer in another. | The two results identify different failed stages and neither reports a delivered file. |
| APEX-39-05 | Avoid charging a completed transfer twice on UI reconnect | Hold the final desktop receipt after the fixture service accepts the bytes and then refresh the status view. | Reconnection resolves a single accepted transfer and issues no second upload request. |

## Text, image and screen evidence

**Current state** Saved-step resolution takes a fresh structured target and can use screen words as evidence. The image adapter validates the content type and charges screenshots against the turn media budget.

**Sources** [server/saved-steps/resolve.ts](../../../../server/saved-steps/resolve.ts) · [server/saved-steps/resolve.test.ts](../../../../server/saved-steps/resolve.test.ts) · [server/saved-steps/screen-words.ts](../../../../server/saved-steps/screen-words.ts) · [server/saved-steps/screen-words.test.ts](../../../../server/saved-steps/screen-words.test.ts) · [server/drivers/chat-images.ts](../../../../server/drivers/chat-images.ts) · [server/drivers/chat-images.test.ts](../../../../server/drivers/chat-images.test.ts)

**Dependencies** APEX-22-01

**Risk** Combining stale screen pixels with current words can select a different target from the one shown to the person.

**Risk level** High

**Automated verification** Use a synthetic form and two known screenshots. Compare structured references, observed words, input image hashes and refused or accepted actions without controlling a real desktop.

**Manual verification** Open the fixture evidence for each interaction and compare the visible screen, the associated text description and the chosen control.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-06 | Keep image and textual screen observations on one generation | Delay an old fixture screenshot until a newer structured snapshot arrives. | The reader never presents the stale image as evidence for the newer target. |
| APEX-39-07 | Use a fresh text token without sending unnecessary pixels | Replay a local fixture step with an unambiguous accessible control name. | The intended token is resolved and billed screenshot bytes stay zero for that step. |
| APEX-39-08 | Mark a visual-only target unverified when its image is unavailable | Remove the only fixture image identifying one of two otherwise identical controls. | The replay records the missing visual evidence and acts on neither control. |
| APEX-39-09 | Preserve the source order in a mixed screenshot-and-caption turn | Submit two distinct fixture screenshots interleaved with their captions. | The captured provider input pairs each text observation with its original image hash in order. |
| APEX-39-10 | Explain a media-budget refusal alongside surviving text evidence | Exceed the turn's screenshot budget after a valid text observation and one accepted figure. | The retained figure and text stay available and the omitted image receives an explicit bounded reason. |

## Connected calendars and mail contracts

**Current state** Connected reads normalize mail headers, message threads, calendars and meeting links from supported accounts. Routine checks consume these records and their source-specific cursors.

**Sources** [server/connected-reads.ts](../../../../server/connected-reads.ts) · [server/connected-reads.test.ts](../../../../server/connected-reads.test.ts) · [server/host/routine-checks.ts](../../../../server/host/routine-checks.ts) · [server/host/routine-checks.test.ts](../../../../server/host/routine-checks.test.ts)

**Dependencies** APEX-21-01

**Risk** A provider-specific field or pagination error can misattribute mail or schedule an action against the wrong connected account.

**Risk level** Critical

**Automated verification** Extend connected-reads fixtures with two account IDs and the provider-native payload shapes. Assert the normalized identifiers, dates, continuation state and request ownership.

**Manual verification** Open a synthetic meeting, mail thread and account status in the fixture desktop. Compare their provenance and canonical dates with the recorded adapter responses.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-11 | Normalize a calendar invite carrying a Teams link in its description | Omit the primary conference link on a fixture meeting while providing the supported Teams link. | The normalized event retains the correct meeting ID and exactly one valid join destination. |
| APEX-39-12 | Exclude resource-only calendar rows from project meetings | Return two real fixture meetings, a room resource and an item without an ID. | Only the two identifiable meetings are offered for action. |
| APEX-39-13 | Preserve message and thread identity across a mail fetch | Return two synthetic messages in one thread and one message in a separate thread. | Inspection opens the chosen message and the thread view groups the original pair without merging the third. |
| APEX-39-14 | Continue provider pagination within account scope | Place an eligible email on the second fixture page and switch another account active in the desktop meanwhile. | The continuation uses the originating account and delivers the second-page item once. |
| APEX-39-15 | Expose an incompatible provider response as a connector error | Return HTML in place of the structured fixture mail response. | The adapter reports a parse failure, does not claim an empty inbox and leaves its successful cursor unchanged. |

## Stored workflow

**Current state** The recipe store keys replacements, bounds retained entries and expires unused recipes. Existing case “saves and finds by key, in a 0600 file”.

**Sources** [server/saved-steps/store.ts](../../../../server/saved-steps/store.ts) · [server/saved-steps/store.test.ts](../../../../server/saved-steps/store.test.ts)

**Dependencies** APEX-04-06

**Risk** A stale recipe can crowd out a frequently used one or outlive its context.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/saved-steps/store.test.ts`.

**Manual verification** Review fixture recipe inventory, last-used stamps and retained files across replacement and expiry.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-16 | Replace a revised recipe under its original key | Save two versions of the same synthetic workflow. | One current recipe resolves by that key and it contains only the later steps. |
| APEX-39-17 | Keep recently used recipes at the capacity limit | Fill the store, use an old entry and add one more recipe. | The used entry survives and the least recently used eligible entry is evicted. |
| APEX-39-18 | Expire unused recipes on the documented day boundary | Put two synthetic recipes one tick inside and outside the retention age. | Only the expired recipe is removed. |
| APEX-39-19 | Preserve private recipe contents on disk | Save a recipe with harmless synthetic form data and reopen the store. | Its file has the expected private mode where supported and reload matches the stored key. |
| APEX-39-20 | Recover the store after an interrupted replacement | Interrupt a fixture write between serializing and committing a revised recipe. | Reload yields a complete old or new recipe, never a mixed sequence. |
