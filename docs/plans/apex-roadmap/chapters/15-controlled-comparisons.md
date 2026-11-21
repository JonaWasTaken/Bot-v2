# 15 · Controlled comparisons

[Project APEX ledger](../README.md) · Core intelligence

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Answer trials

**Current state** The local runner makes fresh loopback chat turns and records replies, settlement time and available usage.

**Sources** [evals/runners/local-answer-comparison.mjs](../../../../evals/runners/local-answer-comparison.mjs) · [docs/plans/2026-11-21-local-answer-trials.csv](../../../../docs/plans/2026-11-21-local-answer-trials.csv) · [src/lib/live-events.ts](../../../../src/lib/live-events.ts) · [src/lib/launch-marks.ts](../../../../src/lib/launch-marks.ts)

**Dependencies** APEX-01-06

**Risk** A permissive grader or fixed run order can exaggerate answer quality.

**Automated verification** Replay `evals/runners/local-answer-comparison.mjs` with the pinned local model and an explicit loopback endpoint, then grade the row against the CSV columns.

**Manual verification** Blind-review a sample of the paired local answers against the frozen task and exact-format rules.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-01 | Separate semantic correctness from format obedience | Score the sprint arithmetic task with and without extra explanation. | Both get semantic credit and only the bare time passes exact format. |
| APEX-15-02 | Counterbalance revision order for answer trials | Run paired A/B and B/A blocks with fresh local chats. | Each arm appears first equally often and every trial carries its order. |
| APEX-15-03 | Calibrate first-answer timing across server and renderer | Replay a scripted 400 ms gap between first SSE content and visible text, inserting two heartbeats and a reasoning-only event first. | The grader ignores all three non-answer events and recovers the injected 400 ms gap within one animation frame. |
| APEX-15-04 | Recover per-turn usage without bot-key ambiguity | Join recorded provider usage by bot, task and turn identity. | Each completed trial has one attributable row or an explicit missing reason. |
| APEX-15-05 | Exclude mismatched model settings from paired results | Change the local model identifier or decoding temperature in one arm of an otherwise identical trial pair. | The comparison identifies the exact mismatched setting and excludes only that pair from the effect estimate. |

## Reader trials

**Current state** The reader uses real recall output and scores labeled member and team facts from synthetic notebooks.

**Sources** [evals/runners/notebook-reader.mjs](../../../../evals/runners/notebook-reader.mjs) · [docs/plans/2026-11-21-notebook-reader-trials.jsonl](../../../../docs/plans/2026-11-21-notebook-reader-trials.jsonl)

**Dependencies** APEX-01-09

**Risk** A reader test may reward knowing one answer while misattributing it to the wrong notebook.

**Automated verification** Run `evals/runners/notebook-reader.mjs` with an explicit loopback Ollama endpoint, write disposable JSONL and grade the requested comparison.

**Manual verification** Compare the raw passages and two labeled answers for each synthetic terminal pair.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-06 | Grade swapped notebook labels as a failure | Swap only the two correct station values in a reader output. | Both label-specific checks fail despite both correct words being present. |
| APEX-15-07 | Rotate notebook names independently of expected facts | Counterbalance four synthetic station names between member and team. | Per-source accuracy and a denominator are reported for all assignments. |
| APEX-15-08 | Separate context omission from reader error | Remove a required passage in one arm and retain it in the other. | The report distinguishes absent evidence from a wrong answer with evidence present. |
| APEX-15-09 | Test whitespace handling without accepting extra prose | Score trailing spaces, a case variant and an added explanatory sentence. | Only the first two receive the tolerant exact-label verdict. |
| APEX-15-10 | Distinguish unavailable team knowledge from a guessed answer | Give the reader only the member passage with a familiar team label. | The accepted answer states unknown for the team and preserves the member fact. |

## Judge calibration

**Current state** The live suite pins judge prompts and reports scores against configured thresholds and previously stored baselines. Existing case “fills wait timeouts from config, derives gates, and drops live-only invariants”.

**Sources** [evals/live/judge/judge.ts](../../../../evals/live/judge/judge.ts) · [evals/live/live-suite.test.ts](../../../../evals/live/live-suite.test.ts)

**Dependencies** APEX-01-07

**Risk** Judge drift can change historical scores without any product change.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/live/live-suite.test.ts`.

**Manual verification** Read blind rubric decisions beside the raw synthetic artifacts and pinned judge prompt.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-11 | Pin judge prompt content before a comparison | Alter a copied judge prompt without updating its recorded digest. | The comparison refuses scoring and names the affected manifest entry. |
| APEX-15-12 | Calibrate with one known wrong artifact | Insert a plausible answer carrying an incorrect synthetic total into a blind batch. | The deterministic total fails regardless of the prose grade. |
| APEX-15-13 | Report missing judge output independently of quality | Time out one judge response while other trials finish. | The missing verdict is counted separately and never silently scored as a pass. |
| APEX-15-14 | Check blind scoring order sensitivity | Present identical paired artifacts in both orders with hidden arm labels. | The report shows per-pair disagreement and the number of order reversals. |
| APEX-15-15 | Preserve an auditable rubric revision | Run the same frozen snapshots under two deliberately versioned rubrics. | Each reported score identifies its rubric hash and original input ID. |

## Paired scoring

**Current state** The paired skill scorer computes deltas, spread, non-discriminating controls and replicate instability. Existing case “computes mean and sample standard deviation”.

**Sources** [evals/scorers/skill-bench.ts](../../../../evals/scorers/skill-bench.ts) · [evals/scorers/skill-bench.test.ts](../../../../evals/scorers/skill-bench.test.ts)

**Dependencies** APEX-01-12

**Risk** A mean score can conceal task mix, failed runs or unstable verdicts.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/scorers/skill-bench.test.ts`.

**Manual verification** Inspect paired scorer output and recompute selected deltas from the raw run table.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-16 | Expose nondiscriminating controls | Include one assertion true for both skill and no-skill arms in every replicate. | It is marked a control and excluded from the effect count. |
| APEX-15-17 | Measure instability across identical replicates | Alternate one assertion's outcome in three repeated synthetic runs. | The scorer flags the unstable assertion and shows its raw numerator and denominator. |
| APEX-15-18 | Separate compute estimates from metered usage | Include a character-derived estimate beside a provider usage record. | Both are labeled with units and are never added together as measured tokens. |
| APEX-15-19 | Keep failed trial pairs visible | Remove one arm's artifact from a paired comparison. | The result includes one incomplete pair and excludes it from the paired effect denominator. |
| APEX-15-20 | Publish magnitude alongside pass counts | Score two arms with identical accuracy and different recorded durations. | The report preserves equal accuracy and reports the paired elapsed-time delta separately. |
