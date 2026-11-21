# 07 · Conversation navigation

[Project APEX ledger](../README.md) · Desktop experience

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Thread routing

**Current state** Thread navigation ranks waiting, unread and working conversations and accounts for the destination the bot normally opens. Existing case “is what waits on the person first, then an unread reply, then work under way”.

**Sources** [src/state/thread-navigation.ts](../../../../src/state/thread-navigation.ts) · [src/state/thread-navigation.test.ts](../../../../src/state/thread-navigation.test.ts) · [src/components/Sidebar.tsx](../../../../src/components/Sidebar.tsx)

**Dependencies** APEX-01-11

**Risk** A notification can open a quiet or private sibling instead of the work needing attention.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/state/thread-navigation.test.ts`.

**Manual verification** Click the marked fixture bot and compare the opened conversation ID with the seeded states.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-01 | Prioritize a waiting question over newer unread prose | Seed one pending question and one newer unread reply in sibling tasks. | Opening the bot lands on the pending question's task. |
| APEX-07-02 | Break equal-priority ties consistently after reload | Seed equal timestamps then repeat navigation before and after refresh. | Both selections use the same eligible task ID. |
| APEX-07-03 | Exclude ended automation runs from ordinary notification routing | Make a routine run newer than all person-created threads. | The row opens an eligible personal thread and never the run log. |
| APEX-07-04 | Preserve the last explicit choice on a quiet bot | Visit the middle of three quiet threads and leave the bot. | Reopening selects that thread until new actionable work appears. |
| APEX-07-05 | Handle an archived conversation awaiting the person | Mark one archived thread pending an answer then resolve it. | It is reachable while waiting and drops out of the attention route after resolution. |

## Sidebar selection

**Current state** The sidebar owns active bot navigation across profile overlays, archiving and Undo. Existing case “opens another bot behind Edit profile as its row does, and keeps the bot on screen where it is”.

**Sources** [src/components/Sidebar.tsx](../../../../src/components/Sidebar.tsx) · [src/components/Sidebar.open-bot.test.ts](../../../../src/components/Sidebar.open-bot.test.ts)

**Dependencies** APEX-01-11

**Risk** Archiving and Undo can leave navigation on an invisible bot.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/Sidebar.open-bot.test.ts`.

**Manual verification** Work from the fixture sidebar and inspect which row, profile and chat stay selected.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-06 | Retain chat selection underneath Edit profile | Open A's profile then click B's row. | B's chat and active sidebar ID agree after dismissing the overlay. |
| APEX-07-07 | Restore the archived bot through Undo | Archive the active bot while two alternatives are visible and press Undo. | The original bot is active again with its original thread. |
| APEX-07-08 | Handle archiving the last visible bot | Archive every bot in a disposable section. | The UI displays one empty-state entry point and no stale selected row. |
| APEX-07-09 | Keep a restored bot in its original section | Restore a bot whose neighbor has moved to another folder. | Its row reappears under its stored section and opens the original task. |
| APEX-07-10 | Prevent double navigation during rapid row clicks | Delay opening B, click C, then release B's request. | C remains the only selected row and its messages stay visible. |

## Disclosure and settings primitives

**Current state** The thread peek uses a disclosure anchored to its sidebar row. Settings primitives separate labels, status text and controls and preserve native switch semantics.

**Sources** [src/components/SidebarBotThreadsPeek.tsx](../../../../src/components/SidebarBotThreadsPeek.tsx) · [src/components/SidebarBotThreadsPeek.dom.test.ts](../../../../src/components/SidebarBotThreadsPeek.dom.test.ts) · [src/components/SettingsPrimitives.tsx](../../../../src/components/SettingsPrimitives.tsx) · [src/components/SettingsPrimitives.test.ts](../../../../src/components/SettingsPrimitives.test.ts) · [src/lib/theme/runtime.dom.test.ts](../../../../src/lib/theme/runtime.dom.test.ts)

**Dependencies** APEX-01-11

**Risk** Inconsistent overlays or form primitives can obscure status text or leave focus on an invisible control.

**Risk level** Medium

**Automated verification** Mount the disclosure and setting-card primitives in the existing DOM suites. Compare placement, focus return, native semantics and theme transitions.

**Manual verification** Traverse an open peek and an adjacent settings card by keyboard. Try a long translated label, panel scrolling and a mid-session theme change.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-11 | Keep disclosure affordance consistent with native control semantics | Open the thread peek from its chevron with keyboard and pointer. | Both paths expose the same expanded state and the main thread row has no unintended destructive action. |
| APEX-07-12 | Separate a setting's status from its input column | Place a long translated status next to a native switch at two sidebar widths. | The status wraps without covering the input and the switch retains its accessible label in both widths. |
| APEX-07-13 | Keep form-card corners and spacing consistent across themes | Compare two cards built with the shared primitive in light and dark modes. | Their resolved radius and inner spacing agree and both native switches remain usable. |
| APEX-07-14 | Anchor the peek overlay to the correct design surface | Scroll the sidebar container and separately scroll an unrelated settings panel. | Only scrolling the owning list dismisses the overlay and no detached panel remains over the chat. |
| APEX-07-15 | Restore the shared surface when a theme is removed | Apply a fixture theme with custom panel colors then clear it with the disclosure open. | The open overlay and its triggering control both return to the default palette without reopening the window. |

## Evidence selection and citation navigation

**Current state** Citations carry an immutable quote and source selectors. Focus-message loading can traverse older bot or room pages until the target ID is present.

**Sources** [src/lib/citations.ts](../../../../src/lib/citations.ts) · [src/lib/citations-dom.ts](../../../../src/lib/citations-dom.ts) · [src/lib/citations.test.ts](../../../../src/lib/citations.test.ts) · [src/lib/focus-message.ts](../../../../src/lib/focus-message.ts) · [src/lib/focus-message.load.test.ts](../../../../src/lib/focus-message.load.test.ts)

**Dependencies** APEX-01-07

**Risk** A convincing citation can focus the wrong document, turn or text and lead the reader to accept the wrong fact.

**Risk level** High

**Automated verification** Extend the citation round-trip and focus-message fixtures. Verify source IDs, selected ranges, serialized quote bytes and page-read counts.

**Manual verification** Follow each citation from a synthetic research answer in desktop chat and compare the highlighted source with the immutable quoted passage.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-16 | Trace a finding to a specific turn in a long source thread | Cite a passage on page three of an older synthetic discussion. | Opening its source stops on the exact message ID and highlights the stored quote. |
| APEX-07-17 | Disambiguate repeated research quotes with surrounding text | Put an identical sentence under two headings and cite only the second occurrence. | Reopening the quote selects the stored occurrence using its neighboring context. |
| APEX-07-18 | Carry multiline evidence intact into a follow-up question | Attach a quote containing Unicode prose, a code line and a source label. | The rendered citation and driver prompt preserve the original quote in order with its source ID. |
| APEX-07-19 | Keep a stale reference legible when a source disappears | Remove a fixture source after its quote has been attached to a result. | The quote remains readable, navigation reports the unavailable source and no lookalike passage is highlighted. |
| APEX-07-20 | Separate commentary from quoted evidence in a queued research turn | Add a contradictory comment to a cited passage and queue the prompt. | The stored quote is unchanged and the two voices remain distinguishable in the dispatched prompt. |
