# 06 · Composer and stream

[Project APEX ledger](../README.md) · Desktop experience

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Composition

**Current state** The composer treats composition events differently from ordinary Enter, mention selection and draft editing. Existing case “does not send or edit the previous message while composing”.

**Sources** [src/components/Composer.tsx](../../../../src/components/Composer.tsx) · [src/components/Composer.ime.test.ts](../../../../src/components/Composer.ime.test.ts) · [src/components/Composer.mentions.test.ts](../../../../src/components/Composer.mentions.test.ts)

**Dependencies** APEX-01-11

**Risk** IME confirmation can send unfinished text or execute a command.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/Composer.ime.test.ts`.

**Manual verification** Type the fixture phrases with an IME in the desktop composer and count sent messages.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-06-01 | Commit Japanese composition before sending | Confirm a candidate with Enter then press ordinary Enter. | The first key sends zero messages and the second sends the committed text once. |
| APEX-06-02 | Keep a mention token intact across composition | Pick a Japanese teammate and append a composed surname. | The recipient ID survives and only the intended display text is posted. |
| APEX-06-03 | Preserve multiline input on Shift+Enter during conversion | Insert a newline between two converted phrases. | The draft contains both phrases on separate lines and the send counter stays zero. |
| APEX-06-04 | Prevent edit-previous during an active IME session | Press Up in an active composition with an earlier sent message. | The prior message remains untouched and the input method retains its candidate. |
| APEX-06-05 | Recover a draft after composition is cancelled | Dismiss an unfinished candidate and switch away and back. | The last committed draft reappears with no phantom candidate text. |

## Draft commands

**Current state** The slash menu distinguishes built-in commands at the start of a message from skills elsewhere in a draft. Existing case “offers the built-in commands and skills at the start of a message”.

**Sources** [src/components/Composer.tsx](../../../../src/components/Composer.tsx) · [src/components/Composer.slash.test.ts](../../../../src/components/Composer.slash.test.ts)

**Dependencies** APEX-01-11

**Risk** Autocomplete can displace the draft or send a different command.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/Composer.slash.test.ts`.

**Manual verification** Use real composer keys in a fixture chat with two synthetic skills installed.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-06-06 | Disambiguate a built-in command and a same-prefix skill | Type a prefix shared by one built-in and two skills and select the second skill. | Only the chosen skill token is inserted and no command is dispatched. |
| APEX-06-07 | Suppress completion in a pasted local path | Paste a path with spaces then type a slash inside it. | Zero suggestion menus open and all path characters survive send. |
| APEX-06-08 | Restore text on cancelling a slash choice | Navigate three results with arrows then press Escape. | The draft matches its pre-menu value and focus remains in the textbox. |
| APEX-06-09 | Complete a command in the middle of a draft | Accept a skill token with text on both sides of the caret. | All surrounding words survive with one separator on each side. |
| APEX-06-10 | Update results after a skill is removed | Open suggestions then uninstall the synthetic skill in another fixture window. | The removed row cannot be inserted and remaining commands stay selectable. |

## Rich stream

**Current state** Streaming Markdown can reuse finished block nodes and falls back to whole-text parsing when syntax couples blocks. Existing case “parses each finished block once and only the last block again as text arrives”.

**Sources** [src/components/ChatMarkdown.tsx](../../../../src/components/ChatMarkdown.tsx) · [src/components/ChatMarkdown.streaming.test.ts](../../../../src/components/ChatMarkdown.streaming.test.ts) · [src/components/ChatMarkdown.stream-identity.test.ts](../../../../src/components/ChatMarkdown.stream-identity.test.ts)

**Dependencies** APEX-01-04

**Risk** Streaming Markdown can expose incomplete actions or redraw finished content.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/ChatMarkdown.streaming.test.ts`.

**Manual verification** Watch a throttled fixture reply from its first fragment through the saved message.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-06-11 | Keep a finished block mounted during tail updates | Stream one finished paragraph followed by 40 partial updates to a second. | The first paragraph keeps the same DOM node through all updates. |
| APEX-06-12 | Enable code actions only on a closed fence | Deliver a fenced sample with the closing delimiter in a later chunk. | The copy action is absent until closure and then copies the exact sample. |
| APEX-06-13 | Render a split Markdown link only when complete | End one delta in the middle of the destination and finish it in the next. | The final anchor has one correct destination and no incomplete destination is actionable. |
| APEX-06-14 | Keep directionality stable in mixed-script replies | Stream Arabic prose around a left-to-right code example. | Each completed block retains its intended direction after settlement. |
| APEX-06-15 | Bound reparsing for a long reply with reference definitions | Add a reference definition at the end of a 100-block response. | The settled DOM matches a single full parse and the recorded fallback occurs only when needed. |

## Reading position

**Current state** The transcript follow state distinguishes reading history from following the tail and responds to explicit user navigation. Existing case “opens following, or released when the reader left the conversation away from its end”.

**Sources** [src/lib/transcript-follow.ts](../../../../src/lib/transcript-follow.ts) · [src/lib/transcript-follow.test.ts](../../../../src/lib/transcript-follow.test.ts) · [src/lib/transcript-window.ts](../../../../src/lib/transcript-window.ts)

**Dependencies** APEX-01-11

**Risk** A streaming reply can steal reading position or hide the latest message.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/transcript-follow.test.ts`.

**Manual verification** Scroll the isolated long conversation by hand with a fake reply arriving one block at a time.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-06-16 | Preserve the reader's anchor during streamed growth | Move up five paragraphs before ten more blocks arrive. | The chosen paragraph remains in view and the latest affordance becomes available. |
| APEX-06-17 | Return to the tail in one action | Release follow mode then use the visible latest control. | The final line is in view and the next two deltas stay followed. |
| APEX-06-18 | Restore per-thread follow preference | Leave A near the top, read B to its end, then return to A. | A reopens at its saved anchor and B retains its own following state. |
| APEX-06-19 | Handle a late image resizing a previous bubble | Delay the dimensions of a fixture image above the reader's anchor. | After decoding, the same anchored text is visible without an unexpected tail jump. |
| APEX-06-20 | Follow the person's own send from history | Scroll to old messages, send a new reply and start the fake response. | The sent line becomes visible immediately and follow remains active for the response. |
