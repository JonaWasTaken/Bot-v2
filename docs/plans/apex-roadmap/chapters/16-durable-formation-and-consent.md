# 16 · Durable formation and consent

[Project APEX ledger](../README.md) · Advanced memory

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Capture boundary

**Current state** Capture groups turns by conversation and expects candidate records to cite one of the supplied conversations. Existing case “never keeps an instruction for one answer as a preference”.

**Sources** [server/memory-capture.ts](../../../../server/memory-capture.ts) · [server/memory-capture-calls.test.ts](../../../../server/memory-capture-calls.test.ts) · [server/memory-capture-restart.e2e.test.ts](../../../../server/memory-capture-restart.e2e.test.ts)

**Dependencies** APEX-01-09

**Risk** A one-turn instruction can become a permanent preference.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-capture-calls.test.ts`.

**Manual verification** Read the capture candidates and reopened notebook after each synthetic conversation.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-16-01 | Separate temporary style requests from lasting preferences | Contrast "just this once, use bullets" with an explicit ongoing preference. | Only the ongoing preference becomes a durable entry. |
| APEX-16-02 | Bind a captured fact to its source conversation | Give two chats conflicting preferences with distinct synthetic speakers. | Each candidate carries its actual source index and no third attribution appears. |
| APEX-16-03 | Reject a nonexistent capture source | Return a candidate citing a chat number outside the supplied batch. | No notebook entry or journal write is produced for that candidate. |
| APEX-16-04 | Preserve a short factual correction despite a brief reply | Pair a two-word correction with a terse acknowledgement. | The corrected value survives capture and a pleasantry-only control creates zero candidates. |
| APEX-16-05 | Avoid duplicate capture after restarting a pending batch | Restart after extraction but before advancing its fixture watermark. | The committed fact has one active entry and one source attribution. |

## Nightly synthesis

**Current state** The dream job selects owner-authored chat material since a marker and imposes per-chat and total input budgets. Existing case “takes chats the person wrote in since the last dream, newest first, and only the owner's own lines”.

**Sources** [server/memory-dream.ts](../../../../server/memory-dream.ts) · [server/memory-dream.test.ts](../../../../server/memory-dream.test.ts) · [server/memory-dream-timeout.test.ts](../../../../server/memory-dream-timeout.test.ts)

**Dependencies** APEX-01-09

**Risk** A nightly synthesis can combine unrelated owners or miss a recent correction.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-dream.test.ts`.

**Manual verification** Review the dream input and the next morning's fixture notebook alongside source lines.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-16-06 | Select only owner-authored lines for a nightly pass | Seed one owner line, one bot guess and one teammate assertion. | The candidate evidence contains only the owner's line. |
| APEX-16-07 | Advance the dream marker only after a usable result | Fail synthesis once then rerun the same interval. | The failed window remains eligible and its successful retry advances the marker once. |
| APEX-16-08 | Fit eligible chats under the total dream budget | Include one large recent chat beside three small older chats. | The constructed input obeys both byte bounds and reports the included chat IDs. |
| APEX-16-09 | Respect an owner move between desktop and cloud fixtures | Stamp two migrated conversations with their original synthetic owner. | Both remain eligible and a different member's chat is absent. |
| APEX-16-10 | Keep simultaneous nightly jobs single-flight | Trigger two ticks before the fake dream completes. | One model call and one set of notebook writes result. |

## Fact filter

**Current state** Dream fact checks compare proposed entries with quoted statements, including numbers, paths, URLs and secret-like content. Existing case “keeps an entry whose numbers, paths and URLs all come from the quotes”.

**Sources** [server/memory-fact-checks.ts](../../../../server/memory-fact-checks.ts) · [server/memory-fact-checks.test.ts](../../../../server/memory-fact-checks.test.ts)

**Dependencies** APEX-01-09

**Risk** Synthesis can retain an invented detail or sensitive marker.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-fact-checks.test.ts`.

**Manual verification** Check each saved line against the fixture quotes and inspect reasons for discarded candidates.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-16-11 | Require numeric claims to match cited text | Change 17 to 71 in an otherwise grounded proposal. | The changed claim is rejected and the exact-quote control is accepted. |
| APEX-16-12 | Preserve meaningful path punctuation | Compare quoted fixture paths differing only by a dash or space. | Only the path actually in the source is eligible for storage. |
| APEX-16-13 | Keep multilingual evidence checks language-independent | Provide parallel non-English source quotes containing the same synthetic fact. | Both valid entries pass and both fabricated-number controls fail. |
| APEX-16-14 | Prevent secret-like fixture strings from becoming facts | Include one synthetic key marker beside a harmless preference in a quoted turn. | The preference survives and the marker is absent from all saved outputs. |
| APEX-16-15 | Require real evidence from every cited chat | Mix one supporting quote with an unrelated conversation citation. | The compound candidate is rejected or narrowed to its supported source. |

## Room capture

**Current state** Room capture depends on the member bot's learning setting and uses that bot's selected background driver. Existing case “captures a member bot's room turn into its memory, sourced to the room, once Learn from group chats is on”.

**Sources** [server/memory-capture.ts](../../../../server/memory-capture.ts) · [server/memory-room-capture.e2e.test.ts](../../../../server/memory-room-capture.e2e.test.ts) · [server/memory-upkeep.ts](../../../../server/memory-upkeep.ts)

**Dependencies** APEX-01-09

**Risk** Group learning can retain room content after consent changes.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-room-capture.e2e.test.ts`.

**Manual verification** Toggle the fixture room-learning setting and compare member and room notebooks after settlement.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-16-16 | Honor room-learning opt-out before dispatch | Send a memorable room fact while group learning is off. | No capture call or durable entry is attributable to that room turn. |
| APEX-16-17 | Recheck consent before delayed capture writes | Turn learning off after a candidate was extracted and before it is written. | The late candidate creates zero new room-derived notes. |
| APEX-16-18 | Keep room-sourced facts labeled as such | Enable learning and mention an agreed project name in a room. | The stored entry traces to that room and never claims private-chat origin. |
| APEX-16-19 | Use the member bot's selected capture driver | Repeat the same eligible room turn with two fixture harness selections. | Exactly the configured background driver receives each extraction. |
| APEX-16-20 | Limit capture to the participating member bot | Add a silent bystander bot with its own notebook to the room. | Only the bot whose eligible turn completed receives the learned entry. |
