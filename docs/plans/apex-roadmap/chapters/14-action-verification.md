# 14 · Action verification

[Project APEX ledger](../README.md) · Core intelligence

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Action receipts

**Current state** Browser evidence numbers recorded steps and links each to a retained screenshot or an omission reason. Existing case “keeps steps and screenshots private to the server user”.

**Sources** [server/browser-evidence.ts](../../../../server/browser-evidence.ts) · [server/browser-evidence.test.ts](../../../../server/browser-evidence.test.ts)

**Dependencies** APEX-01-14

**Risk** A screenshot can be associated with the wrong action after restart.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/browser-evidence.test.ts`.

**Manual verification** Compare the numbered steps, saved images and fixture page before accepting the reported action.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-14-01 | Keep browser receipt numbering monotonic through restart | Record three local-page actions on each side of a fixture restart. | All six steps have distinct increasing numbers. |
| APEX-14-02 | Explain a dropped screenshot separately from action success | Supply an oversized image for a successful local checkbox change. | The receipt reports the checkbox outcome and a distinct image omission reason. |
| APEX-14-03 | Deduplicate identical consecutive evidence images | Record three actions that leave the fixture page visually unchanged. | Three steps remain and their stored references resolve to one image. |
| APEX-14-04 | Retain evidence ownership across two browser instances | Take similarly numbered steps in two separate synthetic profiles. | Each evidence lookup resolves only that profile's screenshot. |
| APEX-14-05 | Keep an incomplete action from appearing confirmed | Close the fixture page before its post-action observation. | The step records the missing observation and does not assert a verified page change. |

## Tool result storage

**Current state** Tool result previews have a size cap, scope, expiration time and continuation offset. Existing case “pages losslessly across emoji boundaries and redacts before retaining”.

**Sources** [server/tool-results.ts](../../../../server/tool-results.ts) · [server/tool-results.test.ts](../../../../server/tool-results.test.ts) · [server/tool-result-spill.ts](../../../../server/tool-result-spill.ts)

**Dependencies** APEX-01-04

**Risk** A clipped tool response can look like a complete artifact.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/tool-results.test.ts`.

**Manual verification** Read the fixture tool-result preview and follow its next offsets to the stored tail.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-14-06 | Recover a full result from paged previews | Return unicode text across four preview pages. | Concatenated pages match the safe retained text hash with no duplicated characters. |
| APEX-14-07 | Make storage truncation observable in chat | Return a result larger than the retention ceiling. | The last page reports truncation and never advertises an unavailable next page. |
| APEX-14-08 | Keep result retention anchored to creation | Read the same result twice just before TTL then read after expiry. | Both early reads succeed and the final read reports expired. |
| APEX-14-09 | Refuse a result lookup from a sibling conversation | Read a fixture result reference from its owner and another task. | Only the owner retrieves its content. |
| APEX-14-10 | Preserve evidence when a result is empty | Complete a successful tool returning zero bytes. | The card shows success with an empty body distinct from missing evidence. |

## Late results

**Current state** The host accepts late results only within a bounded window for an ended turn and its recorded calls. Existing case “lets an ended turn's bearer save each of its own tool calls once, counting only a save that happened”.

**Sources** [server/host/late-tool-results.ts](../../../../server/host/late-tool-results.ts) · [server/host/late-tool-results.test.ts](../../../../server/host/late-tool-results.test.ts)

**Dependencies** APEX-01-04

**Risk** A late result can overwrite the record of an unrelated turn.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/late-tool-results.test.ts`.

**Manual verification** End the fixture turn, release its delayed result and inspect the original and successor cards.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-14-11 | Accept one late result for its own call | Deliver the same valid result twice after the owner ends. | One save occurs and the original tool card settles once. |
| APEX-14-12 | Reject a late receipt for the wrong conversation | Pair an ended turn's synthetic capability with a sibling call ID. | No result is stored under either call. |
| APEX-14-13 | Expire the late-result window on time | Deliver two results bracketing the configured deadline under a fake clock. | The inside result lands and the outside result changes no record. |
| APEX-14-14 | Keep failed persistence retryable within the grace period | Fail the first result write and repeat it once storage recovers. | Exactly one successful save appears with the original call ID. |
| APEX-14-15 | Retire hook identity on thread deletion | Remove the fixture thread before its pending result arrives. | No record or replacement thread is created by the late callback. |

## Visible effects

**Current state** The synthetic provider sends structured tool calls through the real harness to a fixed disposable file.

**Sources** [server/drivers/openai-chat.ts](../../../../server/drivers/openai-chat.ts) · [server/openai-tools.e2e.test.ts](../../../../server/openai-tools.e2e.test.ts)

**Dependencies** APEX-01-04

**Risk** A model's text can claim a write even when the adapter did nothing.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/openai-tools.e2e.test.ts`.

**Manual verification** Compare the fixture file bytes and approval log with the terminal tool card and answer.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-14-16 | Count an approved write independently of model text | Have a scripted provider claim success around one accepted fixed-path write. | The sink records one write with the expected bytes and the card links its result. |
| APEX-14-17 | Detect a success claim after explicit denial | Return prose saying saved after the write request is denied. | The acceptance report records zero effects and flags the claim as unsupported. |
| APEX-14-18 | Keep text-only replies free of tool effects | Send prose containing the synthetic file name without a structured call. | The transcript has one answer and the fixture file remains absent. |
| APEX-14-19 | Separate cancellation before dispatch from cancellation after receipt | Pause the adapter at each boundary in two runs. | The first records zero writes and the second retains the one actual receipt. |
| APEX-14-20 | Reconcile a failed tool with the user's deliverable | Refuse the fixture write then let the model emit a final answer. | The final evidence records missing output and cannot pass a file-exists acceptance gate. |
