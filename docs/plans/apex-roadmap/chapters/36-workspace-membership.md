# 36 · Workspace membership

[Project APEX ledger](../README.md) · Projects and productivity

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Project folders and member access

**Current state** Project API fixtures create empty folders, order them and move live threads without changing their model or history. Shared bot access is evaluated per member.

**Sources** [server/bot-projects-api.test.ts](../../../../server/bot-projects-api.test.ts) · [server/store.ts](../../../../server/store.ts) · [server/host/member-bots.ts](../../../../server/host/member-bots.ts) · [server/cloud-team-bot-access.e2e.test.ts](../../../../server/cloud-team-bot-access.e2e.test.ts) · [src/components/Sidebar.tsx](../../../../src/components/Sidebar.tsx)

**Dependencies** APEX-17-01

**Risk** A project move or stale role can make a private chat visible outside its intended audience.

**Risk level** Critical

**Automated verification** Run the project API and cloud-team access fixture with two members, two project folders and an unshared bot. Compare persisted order, membership, model and history after each operation.

**Manual verification** Create, reorder and reopen project folders through the fixture sidebar as two members. Check actual visible conversations against each member's project access.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-36-01 | Create an empty project before its first conversation | Create a named fixture project, set its supported emoji and restart without adding a bot. | The same empty project ID, label and emoji survive and can receive a first thread. |
| APEX-36-02 | Move a live project thread without resetting its work | Move an active fixture conversation to a different permitted project folder. | Its original thread ID, selected model and message hashes survive and only its project membership changes. |
| APEX-36-03 | Validate project folder reordering as one operation | Submit a reordered fixture list containing a duplicate ID, then a complete valid order. | The invalid update changes nothing and the valid ordering persists across reopen. |
| APEX-36-04 | Retain project visibility when a member's rights are reduced | Downgrade one editor to viewer while their project settings are open. | They keep the eligible project view, cannot save an edit and see the refreshed effective capability. |
| APEX-36-05 | Exclude unshared project bots from navigation and counts | Seed a similarly named public and private bot under two fixture folders. | An unrelated member sees the public bot and no private bot ID, thread label or count. |

## Shared conversations

**Current state** Conversation sharing checks the recipient's bot access, links participants and isolates private notes when a chat becomes shared. Existing case “is refused to anyone but its person, and changes nothing for them: another member and an admin get no such conversation”.

**Sources** [server/cloud-team.ts](../../../../server/cloud-team.ts) · [server/cloud-team-conversation-share.e2e.test.ts](../../../../server/cloud-team-conversation-share.e2e.test.ts)

**Dependencies** APEX-17-01

**Risk** Inviting a collaborator to one chat can unintentionally expose another notebook or room.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cloud-team-conversation-share.e2e.test.ts`.

**Manual verification** Share the synthetic project conversation and compare desktop inboxes, chat history and memory panels.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-36-06 | List only eligible chat collaborators | Offer share targets among a viewer, a chatter and an unrelated member. | The picker includes eligible targets and the server refuses an ineligible direct request. |
| APEX-36-07 | Notify a new collaborator once | Share a chat with one fixture collaborator, repeat the operation and reopen their inbox. | One notification links to that shared conversation. |
| APEX-36-08 | Preserve the shared conversation's prior context | Hand over a multi-turn project discussion to a second member. | They can continue against the agreed history and receive no private notebook markers. |
| APEX-36-09 | Retire collaborator access after bot-level revocation | Remove the recipient's qualifying bot access while the shared chat remains open. | Refresh stops serving the thread and a new send is refused. |
| APEX-36-10 | Present a membership roster for the shared thread | Share once with B and once with C, then remove B. | The owner sees exactly owner and C as current participants and B loses access. |

## Departing member

**Current state** Member removal stops the member's personal bot, cleans private routines and handles shared routine ownership. Existing case “deletes the routines in their private chats with the files only those used, and hands the shared ones they wrote over”.

**Sources** [server/host/team-member-left.ts](../../../../server/host/team-member-left.ts) · [server/host/team-member-left.test.ts](../../../../server/host/team-member-left.test.ts) · [server/host/member-bots.ts](../../../../server/host/member-bots.ts)

**Dependencies** APEX-17-01

**Risk** Removing a project member can orphan shared routines or delete other members' work.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/team-member-left.test.ts`.

**Manual verification** Remove a synthetic member from a seeded project and inspect surviving assets as its owner.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-36-11 | Transfer shared routines on member departure | Remove the author of one shared and one personal routine. | The shared routine remains under a valid owner and the private one is removed as documented. |
| APEX-36-12 | Retain files referenced by another member | Give a departing and a staying member references to the same shared fixture upload. | Cleanup preserves the shared file while private-only uploads are removed. |
| APEX-36-13 | Stop a departing member's active personal bot | Remove the member while its synthetic bot runs a held room turn. | The bot stops before deletion and emits no later updates into the project. |
| APEX-36-14 | Report cleanup that could not finish | Fail deletion of one disposable member-owned resource. | The result names unfinished cleanup and a retry processes only remaining resources. |
| APEX-36-15 | Keep departure summaries free of private text | Seed a unique marker in the member's private thread before removal. | The shared cleanup report contains counts and no marker text. |

## Owner rights

**Current state** Team ownership controls who can transfer a project bot and who sees its pending approvals. Existing case “records who created each team bot, offers everyone who opened the team, and lets an Admin set a department's owner”.

**Sources** [server/cloud-team.ts](../../../../server/cloud-team.ts) · [server/cloud-team-owners.e2e.test.ts](../../../../server/cloud-team-owners.e2e.test.ts)

**Dependencies** APEX-17-01

**Risk** Ownership changes can leave approval questions assigned to the wrong person.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cloud-team-owners.e2e.test.ts`.

**Manual verification** Transfer synthetic project ownership while inspecting Needs you lists in separate member profiles.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-36-16 | Direct project questions to the effective owner | Open an approval on a bot with a department owner and no bot-specific override. | Exactly the effective owner sees the actionable item. |
| APEX-36-17 | Prefer a bot's explicit reporting owner | Set a bot owner different from its department head before generating a question. | The bot owner receives the request and the department head does not. |
| APEX-36-18 | Confirm a transfer without duplicating pending work | Transfer a bot with one open question between eligible fixture owners. | There is one pending decision and its current authority is clear after refresh. |
| APEX-36-19 | Retain ownership history for project inspection | Transfer ownership twice and reopen the project record. | The current owner and the two changes are attributable without exposing private chats. |
| APEX-36-20 | Reject a non-owner's attempted transfer | Make a regular project collaborator request ownership reassignment. | The response refuses and all owner IDs and pending recipients stay unchanged. |
