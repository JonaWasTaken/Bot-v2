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

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/Sidebar.open-bot.test.ts`.

**Manual verification** Work from the fixture sidebar and inspect which row, profile and chat stay selected.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-06 | Retain chat selection underneath Edit profile | Open A's profile then click B's row. | B's chat and active sidebar ID agree after dismissing the overlay. |
| APEX-07-07 | Restore the archived bot through Undo | Archive the active bot while two alternatives are visible and press Undo. | The original bot is active again with its original thread. |
| APEX-07-08 | Handle archiving the last visible bot | Archive every bot in a disposable section. | The UI displays one empty-state entry point and no stale selected row. |
| APEX-07-09 | Keep a restored bot in its original section | Restore a bot whose neighbor has moved to another folder. | Its row reappears under its stored section and opens the original task. |
| APEX-07-10 | Prevent double navigation during rapid row clicks | Delay opening B, click C, then release B's request. | C remains the only selected row and its messages stay visible. |

## Thread peek

**Current state** The thread peek has a capped list, a main row and a disclosure anchored to its sidebar item. Existing case “lists the main conversation first, with no way to archive or delete it, and opens it”.

**Sources** [src/components/SidebarBotThreadsPeek.tsx](../../../../src/components/SidebarBotThreadsPeek.tsx) · [src/components/SidebarBotThreadsPeek.dom.test.ts](../../../../src/components/SidebarBotThreadsPeek.dom.test.ts)

**Dependencies** APEX-01-11

**Risk** A thread popover can detach from its row or hide the main chat.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/components/SidebarBotThreadsPeek.dom.test.ts`.

**Manual verification** Open each fixture bot's thread chevron and inspect focus, order and selected IDs.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-11 | Make the main conversation consistently first | Seed ten recent threads newer than the main chat. | The first peek row opens the main ID and offers no archive action for it. |
| APEX-07-12 | Bound the initial thread peek | Seed twice the configured peek limit and count rendered rows. | The initial list respects the limit and its expansion reaches the oldest eligible thread. |
| APEX-07-13 | Keep hover from opening a navigation sheet | Move across five chevrons without clicking then activate one by keyboard. | No sheet opens on hover and exactly one opens on keyboard activation. |
| APEX-07-14 | Close a displaced peek on sidebar scroll | Open a peek then scroll only its containing list beyond the anchor row. | The sheet closes and no floating target survives the scroll. |
| APEX-07-15 | Refresh an open peek after a rename | Rename a sibling thread from a second fixture window while the peek is open. | The updated label opens the same stored conversation ID. |

## Message jump

**Current state** Message focus can load earlier pages of either a bot or room until it finds the requested ID. Existing case “loads earlier pages of the open bot thread until the hit is there, then focuses it”.

**Sources** [src/lib/focus-message.ts](../../../../src/lib/focus-message.ts) · [src/lib/focus-message.load.test.ts](../../../../src/lib/focus-message.load.test.ts) · [server/thread-history.ts](../../../../server/thread-history.ts)

**Dependencies** APEX-01-11

**Risk** A search jump can exhaust pagination or focus an unrelated message.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/focus-message.load.test.ts`.

**Manual verification** Start from search results and compare the highlighted message with the fixture's original ID.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-07-16 | Stop pagination at the first page containing the hit | Place the oldest match on page three of six. | Three necessary pages at most are fetched and the hit is focused once. |
| APEX-07-17 | Avoid loading history for an already visible result | Open a result already present in the active transcript. | The focus marker lands on its message and performs zero older-page reads. |
| APEX-07-18 | Cancel an old search jump on place switch | Hold A's page-two response, switch to B and release A. | No A marker or history appears in B's transcript. |
| APEX-07-19 | Explain a removed search result | Remove the target message in the fixture after searching and before opening it. | Pagination ends at exhaustion with one unavailable state and no false highlight. |
| APEX-07-20 | Route room hits through room history | Seed the same phrase in a bot and a room, then choose the room hit. | The room thread opens at the exact target and the bot history is never paged. |
