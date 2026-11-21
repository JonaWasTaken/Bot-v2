# 09 · Model selection

[Project APEX ledger](../README.md) · Desktop experience

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Menu surfaces and type scale

**Current state** The Simple model menu has a 324px surface and the full picker uses 420px. The type-scale test checks whole-pixel steps.

**Sources** [src/components/ModelPicker.tsx](../../../../src/components/ModelPicker.tsx) · [src/components/SimpleModelMenu.tsx](../../../../src/components/SimpleModelMenu.tsx) · [src/components/ModelPicker.simple.test.ts](../../../../src/components/ModelPicker.simple.test.ts) · [src/components/type-scale.test.ts](../../../../src/components/type-scale.test.ts) · [DESIGN.md](../../../../DESIGN.md)

**Dependencies** APEX-01-11

**Risk** Inconsistent menu sizing or typography can hide an option on a narrow desktop.

**Risk level** Medium

**Automated verification** Mount the real picker and its full menu in the renderer fixture. Compare computed styles and element bounds in both theme modes with the Simple picker and type-scale suites.

**Manual verification** Open both menu sizes on a narrow and a wide desktop. Change one synthetic account label to a long name and inspect the active row and keyboard focus.

**APEX-09-04 Risk level** Low

**APEX-09-04 Risk** A wrong section gap makes provider groups harder to scan while all model choices remain accessible.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-01 | Align picker headings with the desktop type scale | Compare the selected model, provider heading and secondary text at 100 and 125 percent zoom. | All three use the declared scale steps and neighboring text sizes remain distinguishable. |
| APEX-09-02 | Keep compact and full menus on their defined surfaces | Open the same model list in Simple and Advanced from the composer. | The two menus retain their specified widths when space allows and use the shared menu surface in each theme. |
| APEX-09-03 | Preserve model selection identity when labels ellipsize | Give two models long overlapping names at the compact menu width. | Both rows fit, opening either exposes its complete accessible name and each still selects its own ID. |
| APEX-09-04 | Unify section spacing in multi-provider menus | Add an API-key provider and a local provider beside a signed-in provider. | All three heading-to-row gaps use the same documented spacing token, including the final section. |
| APEX-09-05 | Fit the shared menu inside a narrow desktop frame | Open at the right edge of an 840px window and zoom until the default width cannot fit. | Every option remains reachable and the document gains zero horizontal overflow. |

## Mid-turn switch

**Current state** A busy menu triggers a turn-scoped AI switch. The underlying bot also has its own stored model selection. Existing case “stops that turn, not the store's model, when another AI is picked”.

**Sources** [src/components/ModelPickerBusyMenu.tsx](../../../../src/components/ModelPickerBusyMenu.tsx) · [src/components/ModelPicker.ai-switch.test.ts](../../../../src/components/ModelPicker.ai-switch.test.ts)

**Dependencies** APEX-02-01

**Risk** A mid-turn choice can stop the wrong task or bill two engines.

**Risk level** High

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

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/model-picker-reasoning.test.ts`.

**Manual verification** Select engines with different synthetic reasoning options and inspect saved request payloads.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-11 | Map localized effort labels to stable IDs | Pick equivalent effort options in two fixture locales. | Both requests carry the same backend ID and each UI uses its own label. |
| APEX-09-12 | Clear an unsupported effort after a model change | Switch from a model offering high effort to one offering no effort setting. | The next turn contains no unsupported effort field. |
| APEX-09-13 | Preserve provider-named reasoning variants | Supply two custom variant names whose order differs from app defaults. | The picker shows both exact names and persists the chosen provider value. |
| APEX-09-14 | Restore keyboard focus after choosing effort | Change effort through the keyboard, reopen the menu and press Escape. | Focus returns to the initiating control after each close. |
| APEX-09-15 | Reconcile a stale saved variant | Remove a previously selected effort from a synthetic catalog. | The reopened picker identifies a valid effective choice and emits no stale variant. |

## Theme palette and state colors

**Current state** The palette derives readable accent ink and the contrast helper maps tones into sRGB. EngineUsage consumes model-specific usage state.

**Sources** [src/lib/theme/palette.ts](../../../../src/lib/theme/palette.ts) · [src/lib/theme/palette.test.ts](../../../../src/lib/theme/palette.test.ts) · [src/lib/color-contrast.ts](../../../../src/lib/color-contrast.ts) · [src/lib/color-contrast.test.ts](../../../../src/lib/color-contrast.test.ts) · [src/components/EngineUsage.tsx](../../../../src/components/EngineUsage.tsx)

**Dependencies** APEX-01-11

**Risk** A status token that loses contrast can hide a limit or make a healthy model look unavailable.

**Risk level** Medium

**Automated verification** Test computed color pairs through the palette and contrast suites. Render the usage badge in light and dark fixture themes and compare against its semantic state.

**Manual verification** Open a model with a known quota next to an unavailable one. Read their status at default and high-contrast desktop settings.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-09-16 | Set readable ink for the quota badge | Exercise the shared accent palette with light, dark and near-neutral theme accents. | Badge text meets a 4.5 to 1 contrast target against its own resolved background in all six mode/accent pairs. |
| APEX-09-17 | Distinguish exhausted quota without relying on red | Render available and exhausted quota at the same percentage label width with color disabled. | The exhausted status retains a distinct textual or accessible cue and the available status never announces exhaustion. |
| APEX-09-18 | Preserve quota semantics across a live theme switch | Flip the fixture appearance while a badge is visible on one of two providers. | The visible token values change to the selected theme and the labelled percentage remains bound to its original instance. |
| APEX-09-19 | Use one disabled-state treatment for unknown usage | Remove usage data after a measured result and open both picker modes. | Both stop displaying the prior number and the missing state follows the same design rule in both surfaces. |
| APEX-09-20 | Keep custom accent colors inside the output gamut | Use a high-chroma accent in the light and dark picker previews. | Computed colors are valid sRGB values and color mapping preserves the intended brightness ordering. |
