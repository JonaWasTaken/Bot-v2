# 18 · Retrieval evaluation

[Project APEX ledger](../README.md) · Advanced memory

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Match selection

**Current state** Recall selects bounded matching passages, reserves named-topic evidence and tokenizes punctuation-sensitive queries. Existing case “keeps a named topic's matching answer when better-ranked matches fill the recall budget”.

**Sources** [server/recall.ts](../../../../server/recall.ts) · [server/recall.test.ts](../../../../server/recall.test.ts)

**Dependencies** APEX-01-09

**Risk** Keyword relevance can hide the passage containing the actual answer.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/recall.test.ts`.

**Manual verification** Inspect ranked fixture matches and the exact text included in the driver's recall supplement.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-18-01 | Reserve the relevant passage from a long named topic | Put the answer after a long introduction and add higher-frequency distractors. | The bounded supplement includes the answer-bearing passage. |
| APEX-18-02 | Retain version punctuation in retrieval queries | Contrast topics about 2.1, 2.10 and a signed offset. | The requested version's answer ranks above both distractors. |
| APEX-18-03 | Match CJK text around punctuation | Seed two synthetic topics separated by full-width punctuation. | The intended query returns its relevant passage without combining adjacent terms incorrectly. |
| APEX-18-04 | Return no supplement for an unrelated query | Search a notebook of travel facts for an unrelated build identifier. | Zero irrelevant passages enter the prompt. |
| APEX-18-05 | Break equal-score ties reproducibly | Rank equally scored passages before and after reopening the fixture notebook. | Both runs select the same IDs in the same order. |

## Recall disclosure

**Current state** Disclosure tracks which source threads have already been recalled into each room. Existing case “claims a crossing the first time a source is recalled into a room”.

**Sources** [server/recall-disclosure.ts](../../../../server/recall-disclosure.ts) · [server/recall-disclosure.test.ts](../../../../server/recall-disclosure.test.ts) · [server/recall.ts](../../../../server/recall.ts)

**Dependencies** APEX-01-09

**Risk** Repeated source disclosures distract readers while missing disclosures hide provenance.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/recall-disclosure.test.ts`.

**Manual verification** Inspect disclosure cards in two fixture rooms as source threads are recalled.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-18-06 | Disclose a first cross-thread recall exactly once | Recall one permitted chat twice into a fresh room. | One disclosure names the source and the second recall creates none. |
| APEX-18-07 | Disclose only newly introduced sources in a mixed batch | Recall previously seen A alongside new B and C. | The disclosure identifies B and C exactly once each. |
| APEX-18-08 | Keep disclosure history scoped to each room | Recall the same source into two rooms in succession. | Each room receives its own first-use disclosure. |
| APEX-18-09 | Forget disclosure state when a room is retired | Recreate an isolated room with a new identity after closing its predecessor. | The new room's first recall is announced independently. |
| APEX-18-10 | Keep a failed recall from consuming a disclosure | Fail before committing the first visible supplement then retry. | The first successful delivery still includes the source notice. |

## Topic revisions

**Current state** Topic parsing indexes headers, aliases and matching passages. Tidy limits model calls and rotates deferred topics. Existing case “reconciles a correction in a two-entry project topic, retaining the old version in the file”.

**Sources** [server/memory-topics.ts](../../../../server/memory-topics.ts) · [server/memory-topic-corrections.test.ts](../../../../server/memory-topic-corrections.test.ts)

**Dependencies** APEX-01-09

**Risk** An indexed alias may prefer a stale topic introduction over a corrected fact.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/memory-topic-corrections.test.ts`.

**Manual verification** Read both the topic file and the passage actually injected into the fixture turn.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-18-11 | Rank current topic facts above struck revisions | Write a two-step correction of one project location and query its old alias. | The returned active passage contains only the final location. |
| APEX-18-12 | Keep a named topic eligible under generic matches | Add many high-scoring unrelated notes sharing a common word. | The specifically named project's relevant passage survives the selection ceiling. |
| APEX-18-13 | Rotate a deferred topic into maintenance | Exceed the per-pass topic processing limit and issue enough subsequent ticks. | Every eligible topic gets one turn before any steady-state starvation. |
| APEX-18-14 | Preserve alias metadata when rewriting a corrected topic | Correct one fact inside a synthetic topic with two aliases. | Both aliases still resolve to the same topic ID after rewriting. |
| APEX-18-15 | Measure ranking effect of a topic rename | Rename only the display title while retaining the original alias and content. | Queries by either name reach the current fact. |

## Independent reader

**Current state** The reader reports the actual context and answers separately for collisions, distinct filenames and member-only input.

**Sources** [evals/runners/notebook-reader.mjs](../../../../evals/runners/notebook-reader.mjs) · [docs/plans/2026-11-21-notebook-reader-trials.jsonl](../../../../docs/plans/2026-11-21-notebook-reader-trials.jsonl)

**Dependencies** APEX-01-09

**Risk** Good retrieval scores can mask an unusable final answer.

**Risk level** Medium

**Automated verification** Extend the synthetic pair fixtures in `evals/runners/notebook-reader.mjs`, run the pinned loopback reader and score its JSONL against the row.

**Manual verification** Review blind local-reader outputs, passages and source-specific grading for the synthetic station pairs.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-18-16 | Measure the cost of a near-match distractor | Add a similarly named third station with an incorrect terminal. | Report correct member and team answers separately over at least six paired trials. |
| APEX-18-17 | Track a reader's response to empty context | Feed empty passages while retaining the same two-label question. | Both answers must be unknown for the trial to pass. |
| APEX-18-18 | Measure with swapped ordering of equal evidence | Reverse the two relevant passages while keeping labels and question fixed. | The report gives each order's accuracy and every changed verdict. |
| APEX-18-19 | Isolate the effect of duplicate filenames from duplicate facts | Run a two-by-two matrix of same/different filenames and same/different terminal values. | Four labeled cells include denominators and source-specific outcomes. |
| APEX-18-20 | Trace answer failure to its first missing fact | Log expected facts, delivered passages and graded answer for each failed trial. | Every failure is assigned to missing passage, incorrect attribution or reader error with evidence. |
