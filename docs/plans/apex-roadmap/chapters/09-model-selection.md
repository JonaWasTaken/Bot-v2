# 09 · Model selection

[Project APEX ledger](../README.md) · Desktop experience

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Simple picker

**Current state** The Simple picker groups ready engines, local choices and setup states and places the active model first. Existing case “opens one calm list: the current model on top, its provider's other models below, then Thinking and a way to accounts”.

**Sources** [src/components/ModelPicker.tsx](../../../../src/components/ModelPicker.tsx) · [src/components/ModelPicker.simple.test.ts](../../../../src/components/ModelPicker.simple.test.ts) · [src/components/SimpleModelMenu.tsx](../../../../src/components/SimpleModelMenu.tsx)

**Dependencies** APEX-02-01

**Risk** A model list can offer an unusable engine or misidentify the active account.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/ModelPicker.simple.test.ts`.

**Manual verification** Open the Simple picker with synthetic signed-in, local and unavailable providers and read each selection back.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-01 | Preserve the active model at the top of Simple mode | Refresh a list whose current model sorts alphabetically last. | The current model remains the first active row before and after refresh. |
| APEX-09-02 | Group identically named models by actual engine | Install two fixture providers exposing the same display label. | Each choice persists a distinct instance/model pair. |
| APEX-09-03 | Keep setup-only providers out of ready choices | Toggle one harness from signed in to needing setup while the menu is open. | Its stale ready row cannot start a turn and its setup entry remains reachable. |
| APEX-09-04 | Recover the chosen local model after catalog delay | Open the picker with a saved local selection and hold its inventory response. | The saved name stays visible and resolves to its original ID on refresh. |
| APEX-09-05 | Keep the Simple menu inside a narrow desktop window | Open at the right edge on an 840 px fixture viewport and navigate the last row. | All choices are reachable without horizontal document scrolling. |

## Mid-turn switch

**Current state** A busy menu triggers a turn-scoped AI switch. The underlying bot also has its own stored model selection. Existing case “stops that turn, not the store's model, when another AI is picked”.

**Sources** [src/components/ModelPickerBusyMenu.tsx](../../../../src/components/ModelPickerBusyMenu.tsx) · [src/components/ModelPicker.ai-switch.test.ts](../../../../src/components/ModelPicker.ai-switch.test.ts)

**Dependencies** APEX-02-01

**Risk** A mid-turn choice can stop the wrong task or bill two engines.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/ModelPicker.ai-switch.test.ts`.

**Manual verification** Run a held fixture turn, use Switch AI, and compare both adapter launch logs and the transcript.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-06 | Bind a model switch to the originating turn | Open Switch AI on A then select a model after visiting B. | The action cannot stop or mutate B's turn. |
| APEX-09-07 | Handle settlement while the busy picker is open | End the fixture response between menu open and selection. | The next model is selected without cancelling an already ended turn. |
| APEX-09-08 | Make a failed switch recoverable | Refuse the destination model after the old turn acknowledges stop. | The transcript records one stop and the UI exposes the unresolved selection. |
| APEX-09-09 | Preserve drafts across an engine change | Type an unsent follow-up then switch the active model. | The draft survives verbatim and the follow-up runs once on the chosen engine. |
| APEX-09-10 | Keep effort changes disabled while a turn owns them | Open both Simple and Advanced model surfaces during a held turn. | Neither sends an effort mutation until the turn settles. |

## Reasoning choice

**Current state** Variant choice and effort labels depend on the engine and on the values the model supplies. Existing case “are the app's own on the chat engine, in the reader's language”.

**Sources** [src/components/model-picker-reasoning.ts](../../../../src/components/model-picker-reasoning.ts) · [src/components/model-picker-reasoning.test.ts](../../../../src/components/model-picker-reasoning.test.ts)

**Dependencies** APEX-02-01

**Risk** A stale reasoning level can make a valid model selection unusable.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/model-picker-reasoning.test.ts`.

**Manual verification** Select engines with different synthetic reasoning options and inspect saved request payloads.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-11 | Map localized effort labels to stable IDs | Pick equivalent effort options in two fixture locales. | Both requests carry the same backend ID and each UI uses its own label. |
| APEX-09-12 | Clear an unsupported effort after a model change | Switch from a model offering high effort to one offering no effort setting. | The next turn contains no unsupported effort field. |
| APEX-09-13 | Preserve provider-named reasoning variants | Supply two custom variant names whose order differs from app defaults. | The picker shows both exact names and persists the chosen provider value. |
| APEX-09-14 | Restore keyboard focus after choosing effort | Change effort through the keyboard, reopen the menu and press Escape. | Focus returns to the initiating control after each close. |
| APEX-09-15 | Reconcile a stale saved variant | Remove a previously selected effort from a synthetic catalog. | The reopened picker identifies a valid effective choice and emits no stale variant. |

## Usage display

**Current state** The usage indicator combines the selected bot's engine data with the model label and omits unavailable usage. Existing case “draw nothing for an engine that reports no usage”.

**Sources** [src/components/ModelPicker.tsx](../../../../src/components/ModelPicker.tsx) · [src/components/ModelPicker.usage.test.ts](../../../../src/components/ModelPicker.usage.test.ts) · [src/components/EngineUsage.tsx](../../../../src/components/EngineUsage.tsx)

**Dependencies** APEX-02-01

**Risk** A usage badge can display another engine's quota or stale reset time.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/ModelPicker.usage.test.ts`.

**Manual verification** Inspect the model row, spoken name and usage response in a two-provider fixture.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-16 | Attribute a quota badge to the selected instance | Return conflicting usage for two similar provider entries. | The chosen row and accessible label report only its instance's value. |
| APEX-09-17 | Show an unknown limit honestly | Return an unavailable usage record after a previously valid one. | The stale numeric percentage disappears and selection still works. |
| APEX-09-18 | Update a reset label across its boundary | Hold the picker open while a fake clock passes the reported reset instant. | The UI stops counting down the expired window within one refresh. |
| APEX-09-19 | Render usage consistently across desktop modes | Switch Simple to Advanced on one selected model at 840 px width. | Both expose the same percentage and reset time without a clipped control. |
| APEX-09-20 | Avoid redundant usage fetches during keyboard traversal | Move among ten options without changing the selected instance. | Usage requests remain bounded to one per cache interval for that instance. |
