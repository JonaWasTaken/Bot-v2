# 17 · Notebook boundaries

[Project APEX ledger](../README.md) · Advanced memory

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Audience selection

**Current state** Audience resolution distinguishes team, room and personal records when a person reads or writes. Existing case “writes only into its own audience”.

**Sources** [server/audience.ts](../../../../server/audience.ts) · [server/audience.test.ts](../../../../server/audience.test.ts)

**Dependencies** APEX-01-09

**Risk** Confusing admin access with personal notebook access exposes another person's history.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/audience.test.ts`.

**Manual verification** Compare the fixture's member, room participant and admin views for the same synthetic entries.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-17-01 | Route a private chat to its member notebook | Create private chats for two members on one bot. | Each write lands in that member's notebook and zero entries cross. |
| APEX-17-02 | Restrict a room note to its current audience | Add a note to room A and query from a member of room B only. | A participants can read the note and the B-only member cannot. |
| APEX-17-03 | Keep admin diagnostics free of private text | Request the fixture's admin inventory after a member records a unique fact. | The private marker is absent from list, count detail and transcript responses. |
| APEX-17-04 | Resolve audience after a participant leaves a room | Remove a member between note creation and the next query. | That member's next response contains zero room-only facts. |
| APEX-17-05 | Handle a legacy chat lacking a member marker | Load the old record shape into a fixture with two owners of private notes. | It follows the documented legacy audience and never acquires either member's private note. |

## Team notebook

**Current state** Team memory validates fields and aliases, masks secret-like values and retains an approved entry while a replacement is pending. Existing case “refuses an over-long field and says how to send it again, naming the limit”.

**Sources** [server/team-memory.ts](../../../../server/team-memory.ts) · [server/team-memory.test.ts](../../../../server/team-memory.test.ts)

**Dependencies** APEX-01-09

**Risk** Pending edits can replace an approved team fact prematurely.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/team-memory.test.ts`.

**Manual verification** View the shared notebook as editor and reader while the synthetic proposal changes state.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-17-06 | Keep a replacement proposal separate from the approved entry | Propose a new owner for an existing team contact. | Readers see the approved owner until approval, then the replacement once. |
| APEX-17-07 | Resolve alias conflicts before publishing a team note | Give two proposed entries identical normalized aliases. | The ambiguous update yields a specific refusal and the old lookup remains deterministic. |
| APEX-17-08 | Keep a refused overlong note editable | Submit a detail exactly one character beyond the limit then shorten it. | The first response names the limit and only the shortened entry persists. |
| APEX-17-09 | Mask synthetic secret text before team sharing | Place a marker in a proposed contact field and inspect the stored and reader forms. | Neither contains the original marker. |
| APEX-17-10 | Retain proposal authorship through review | Have member B approve member A's fixture proposal. | History identifies both roles and the published entry has one stable identity. |

## Layered recall

**Current state** Recall combines permitted notebook layers. The private-team fixture checks both driver prompts and member route visibility. Existing case “Bob reads and writes his own private chat, with its words, its file, his search and his own copy of the bot”.

**Sources** [server/recall.ts](../../../../server/recall.ts) · [server/cloud-team-private.e2e.test.ts](../../../../server/cloud-team-private.e2e.test.ts) · [server/audience.ts](../../../../server/audience.ts)

**Dependencies** APEX-01-09

**Risk** Same-path topics can mix personal and team answers.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cloud-team-private.e2e.test.ts`.

**Manual verification** Ask one synthetic desktop member about both notebooks and inspect the actual driver prompt.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-17-11 | Keep personal and team facts distinct when filenames collide | Put two locations in identically named topics with overlapping aliases. | Both labeled values occur once in the intended member's prompt. |
| APEX-17-12 | Preserve privacy when the shared bot switches members | Run A's recall then B's on one synthetic bot process. | B's prompt has zero A-only markers even when both ask identical questions. |
| APEX-17-13 | Treat a missing team notebook as an empty layer | Remove the team notebook from the fixture while retaining a relevant personal topic. | Personal recall still returns its value and invents no team answer. |
| APEX-17-14 | Enforce the global recall ceiling across many permitted layers | Seed six matching topics in personal, room and team scopes. | The final prompt obeys the configured global note limit. |
| APEX-17-15 | Keep member edits visible only to authorized readers | Correct a personal note while another member polls the bot library. | The editor sees the revision and the poller receives neither old nor new value. |

## Lent memory

**Current state** Lending fingerprints notebook and instruction content, including same-size rewrites and eligible links. Existing case “fingerprints MEMORY.md, topic files and daily logs by content”.

**Sources** [server/lending-memory.ts](../../../../server/lending-memory.ts) · [server/lending-memory.test.ts](../../../../server/lending-memory.test.ts)

**Dependencies** APEX-01-09

**Risk** A borrowed runtime can reuse instructions from a different folder revision.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/lending-memory.test.ts`.

**Manual verification** Compare source fingerprints, lent-session identity and the fixture prompt at the next borrow.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-17-16 | Detect a same-size note rewrite between loans | Change a topic's bytes while preserving its length and timestamp. | The next fingerprint differs and the old context is not reused. |
| APEX-17-17 | Include dated logs in loan identity | Modify only a synthetic daily log between identical borrowing requests. | The loan comparison reports changed memory. |
| APEX-17-18 | Follow the declared handling for a swapped fixture link | Replace a fixture link target with another allowed fixture file. | The new source identity is observed before the next session is reused. |
| APEX-17-19 | Identify a changed ancestor instruction | Edit only the synthetic parent folder's instructions between two loans. | The second context fingerprint differs from the first. |
| APEX-17-20 | Keep unrelated file churn from invalidating memory | Touch an unrelated temporary output beside unchanged tracked inputs. | Both loans compute the same memory fingerprint. |
