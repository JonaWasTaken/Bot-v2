# 10 · Keyboard and accessibility

[Project APEX ledger](../README.md) · Desktop experience

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Native shortcuts

**Current state** The native menu includes resetZoom, zoomIn and zoomOut roles. The native startup evidence has no two-layout keyboard result.

**Sources** [electron/menu.mjs](../../../../electron/menu.mjs) · [electron/menu.test.mjs](../../../../electron/menu.test.mjs) · [electron/main.mjs](../../../../electron/main.mjs)

**Dependencies** APEX-01-17

**Risk** Native keyboard layouts and renderer zoom state can disagree.

**Automated verification** Run `corepack pnpm exec vitest run electron/menu.test.mjs` for menu wiring. On an isolated Windows x64 installation, dispatch the row’s chords using both recorded keyboard layouts and collect webContents.getZoomFactor() before and after each key event.

**Manual verification** On a disposable installed Windows desktop use two keyboard layouts and record zoomFactor at each step.
**GitHub** Unfiled in the fork. Related upstream report [#6861](https://github.com/milind-soni/OpenMausBot/issues/6861).

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-10-01 | Restore scale with the Windows equals key | Zoom out twice then use Ctrl+equals on both layouts. | Each layout regains at least one zoom step and the focused message remains visible. |
| APEX-10-02 | Handle the shifted plus zoom chord | Exercise Ctrl+Shift+plus from default scale on the two installed layouts. | Each supported chord increases scale once per keypress. |
| APEX-10-03 | Reset nondefault zoom reliably | Apply three negative steps then Ctrl+0 with chat focused. | The measured renderer zoom factor returns to 1 on both layouts. |
| APEX-10-04 | Verify zoom recovery across installed-app relaunch | Close the app at nondefault scale, reopen the same fixture profile and reset. | One reset restores 1 regardless of the scale observed on launch. |
| APEX-10-05 | Keep text-editing shortcuts functional at changed zoom | Type and undo a fixture draft after zooming in and out. | Undo restores the prior text without an extra zoom or turn submission. |

## Shortcut labels

**Current state** The shortcut registry assigns stable IDs to key sequences and localizes descriptions. Existing case “localizes the follow-up shortcut without changing its English description”.

**Sources** [src/lib/keyboard-shortcuts.ts](../../../../src/lib/keyboard-shortcuts.ts) · [src/lib/keyboard-shortcuts.test.ts](../../../../src/lib/keyboard-shortcuts.test.ts)

**Dependencies** APEX-01-11

**Risk** A shortcut hint can advertise the wrong platform binding.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/keyboard-shortcuts.test.ts`.

**Manual verification** Compare the shortcut reference with actual physical chords in a fixture window.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-10-06 | Match the sidebar chord only once | Press the listed platform modifier plus backslash while chat is focused. | The sidebar toggles once and a bare backslash still enters text. |
| APEX-10-07 | Resolve shortcut labels in the active locale | Switch language with the reference open and return to English. | All known actions update labels and their IDs and chords stay constant. |
| APEX-10-08 | Disambiguate duplicate chords by active surface | Exercise a chord shared by a text surface and a navigation surface. | Only the action belonging to the focused surface runs. |
| APEX-10-09 | Preserve uncatalogued extension descriptions | Add a fixture action with its own translated description. | The registry retains its exact label and exposes its key sequence. |
| APEX-10-10 | Detect a conflicting shortcut ID before bundling | Feed a duplicate entry with a different command into the catalog check. | Validation identifies both entries and leaves the production catalog unchanged. |

## Shortcut discovery

**Current state** Shortcut help uses a labeled native dialog with search and dismissal controls. Existing case “uses a labeled native dialog with search and dismiss controls”.

**Sources** [src/components/KeyboardShortcutsModal.tsx](../../../../src/components/KeyboardShortcutsModal.tsx) · [src/components/KeyboardShortcutsModal.test.ts](../../../../src/components/KeyboardShortcutsModal.test.ts)

**Dependencies** APEX-01-11

**Risk** Losing focus in the shortcut dialog leaves keyboard-only users stranded.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/KeyboardShortcutsModal.test.ts`.

**Manual verification** Open the shortcut help using only the keyboard and walk the focus order.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-10-11 | Focus shortcut search on open | Open help while the composer contains a draft. | Search receives focus and the draft remains unchanged. |
| APEX-10-12 | Filter actions by localized command text | Enter a translated action name and clear the search. | The named command appears and the full result count returns after clearing. |
| APEX-10-13 | Describe an empty shortcut search | Search for an impossible action string with a screen reader. | The dialog announces zero matches once and the dismiss control remains reachable. |
| APEX-10-14 | Restore the invoking control on dismissal | Open the reference from Settings then dismiss it with Escape. | Focus returns to the same Settings control and no underlying menu closes. |
| APEX-10-15 | Keep tab traversal inside the open dialog | Cycle forward and backward past both ends of the controls. | Focus remains within the labeled dialog until it closes. |

## Screen reader

**Current state** The announcer keeps a per-transcript baseline and suppresses historic or unfinished replies. Existing case “says nothing while the bot works, then announces the finished reply once”.

**Sources** [src/lib/transcript-announcer.ts](../../../../src/lib/transcript-announcer.ts) · [src/lib/transcript-announcer.test.ts](../../../../src/lib/transcript-announcer.test.ts) · [src/components/TranscriptAnnouncer.tsx](../../../../src/components/TranscriptAnnouncer.tsx)

**Dependencies** APEX-06-11

**Risk** Repeating a streamed response in a live region can make chat unusable.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/transcript-announcer.test.ts`.

**Manual verification** Listen to the fixture conversation with a desktop screen reader and record utterance counts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-10-16 | Announce a settled streamed response once | Send a synthetic response in 30 chunks and then its saved final message. | The live region announces the complete answer once and none of the individual chunks. |
| APEX-10-17 | Keep old pages quiet during history load | Load four older pages while the current chat is idle. | Historical messages produce zero new live-region announcements. |
| APEX-10-18 | Announce a reply opened midway through generation | Switch into a busy task before its final line arrives. | Only the new final reply is announced after entry. |
| APEX-10-19 | Suppress blank terminal announcements | Stop a turn after an empty delta and before useful text. | No empty or fabricated answer is spoken. |
| APEX-10-20 | Keep announcements isolated when tasks switch quickly | Alternate between two busy fixture threads and settle the one off screen first. | Only the visible thread's completed answer enters the live region. |
