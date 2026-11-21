# 39 · Reviewed workflows

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Recording journal

**Current state** The recording journal associates gated calls and results with one generation and detects incomplete sequences. Existing case “returns the request's calls in order with the generation they ran in”.

**Sources** [server/saved-steps/journal.ts](../../../../server/saved-steps/journal.ts) · [server/saved-steps/journal.test.ts](../../../../server/saved-steps/journal.test.ts) · [server/saved-steps/journal-tap.ts](../../../../server/saved-steps/journal-tap.ts)

**Dependencies** APEX-22-01

**Risk** A partly recorded desktop sequence can look safe to repeat.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/saved-steps/journal.test.ts`.

**Manual verification** Record a short workflow against a synthetic form and inspect the journal before allowing fixture replay.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-01 | Record the exact order of accepted actions | Select, fill and submit a local fixture form in a known order. | The journal contains three ordered calls and their original generation. |
| APEX-39-02 | Mark a gated call with no outcome incomplete | Interrupt the fixture after approval and before the tool records its result. | The workflow cannot be offered as a complete recording. |
| APEX-39-03 | Reject an orphan outcome during recipe construction | Supply a synthetic journal result with no matching gate event. | The recipe is marked incomplete and no runnable step is inferred. |
| APEX-39-04 | Surface a journal truncated by its cap | Record one more call than the per-thread cap. | The review names the exceeded limit and cannot claim full coverage of the omitted call. |
| APEX-39-05 | Separate recordings of simultaneous workflows | Record two tasks with interleaved fixture actions. | Each resulting sequence contains only its original task and generation. |

## Step resolution

**Current state** Resolution matches a saved action against a fresh target token before using its stored arguments. Existing case “resolves an element step afresh, without a screenshot”.

**Sources** [server/saved-steps/resolve.ts](../../../../server/saved-steps/resolve.ts) · [server/saved-steps/resolve.test.ts](../../../../server/saved-steps/resolve.test.ts) · [server/saved-steps/screen-words.ts](../../../../server/saved-steps/screen-words.ts)

**Dependencies** APEX-22-01

**Risk** A saved selector can point at the wrong control after a form changes.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/saved-steps/resolve.test.ts`.

**Manual verification** Review the saved sequence against a changed local form, then compare the resolved target and observed action.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-06 | Resolve a recorded button by its fresh snapshot token | Reorder a fixture form before replaying a reviewed click. | The intended control is selected regardless of its old index. |
| APEX-39-07 | Refuse a target missing a fresh element token | Remove the recorded target's token while leaving similar text visible. | The replay performs zero actions on nearby elements. |
| APEX-39-08 | Keep user-entered text intact on a changed field | Prepopulate a field previously empty during recording. | Review identifies the existing content and the workflow does not silently replace it. |
| APEX-39-09 | Report an ambiguous step after a duplicate control appears | Add a second eligible control with the same label. | Replay stops at that step until the ambiguity is resolved. |
| APEX-39-10 | Explain a missing application target | Replay a recipe recorded against one synthetic app while only a different app is visible. | No action runs in the other app and the failed match identifies the missing target. |

## Replay

**Current state** Replay requests existing step decisions, records outcomes and keeps typed content out of approval wording. Existing case “asks once per action, resolves afresh and reports each step”.

**Sources** [server/saved-steps/replay.ts](../../../../server/saved-steps/replay.ts) · [server/saved-steps/replay.test.ts](../../../../server/saved-steps/replay.test.ts) · [src/components/SavedStepsChip.tsx](../../../../src/components/SavedStepsChip.tsx)

**Dependencies** APEX-21-01

**Risk** A reviewed recipe may carry sensitive typed values into reports or continue after a refusal.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/saved-steps/replay.test.ts`.

**Manual verification** Run each workflow on an inert fixture, inspect its existing action decisions and compare the resulting form state.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-11 | Honor per-step approval in an existing reviewed sequence | Allow the first action and decline the second of three fixture actions. | Only the first effect occurs and the third action is never dispatched. |
| APEX-39-12 | Describe a keyboard shortcut without showing private text | Record a modifier chord beside an input containing a synthetic private marker. | The review displays the chord and no marker from typed content. |
| APEX-39-13 | Keep one receipt per replayed step | Replay four approved actions with one retried transport response. | Four unique step receipts match the four observed fixture changes. |
| APEX-39-14 | Resume a reviewed workflow from a visible failure point | Make the second action temporarily unavailable and retry after repair. | The accepted first action is identified and no duplicate first effect is needed. |
| APEX-39-15 | Give a useful partial completion summary | Stop after two of five steps. | The report names the two completed steps, the stop point and three unexecuted steps. |

## Stored workflow

**Current state** The recipe store keys replacements, bounds retained entries and expires unused recipes. Existing case “saves and finds by key, in a 0600 file”.

**Sources** [server/saved-steps/store.ts](../../../../server/saved-steps/store.ts) · [server/saved-steps/store.test.ts](../../../../server/saved-steps/store.test.ts)

**Dependencies** APEX-04-06

**Risk** A stale recipe can crowd out a frequently used one or outlive its context.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/saved-steps/store.test.ts`.

**Manual verification** Review fixture recipe inventory, last-used stamps and retained files across replacement and expiry.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-39-16 | Replace a revised recipe under its original key | Save two versions of the same synthetic workflow. | One current recipe resolves by that key and it contains only the later steps. |
| APEX-39-17 | Keep recently used recipes at the capacity limit | Fill the store, use an old entry and add one more recipe. | The used entry survives and the least recently used eligible entry is evicted. |
| APEX-39-18 | Expire unused recipes on the documented day boundary | Put two synthetic recipes one tick inside and outside the retention age. | Only the expired recipe is removed. |
| APEX-39-19 | Preserve private recipe contents on disk | Save a recipe with harmless synthetic form data and reopen the store. | Its file has the expected private mode where supported and reload matches the stored key. |
| APEX-39-20 | Recover the store after an interrupted replacement | Interrupt a fixture write between serializing and committing a revised recipe. | Reload yields a complete old or new recipe, never a mixed sequence. |
