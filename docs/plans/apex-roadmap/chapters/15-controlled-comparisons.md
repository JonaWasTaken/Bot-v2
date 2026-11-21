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

**Risk level** Medium

**Automated verification** Replay `evals/runners/local-answer-comparison.mjs` with the pinned local model and an explicit loopback endpoint, then grade the row against the CSV columns.

**Manual verification** Blind-review a sample of the paired local answers against the frozen task and exact-format rules.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-01 | Separate semantic correctness from format obedience | Score the sprint arithmetic task with and without extra explanation. | Both get semantic credit and only the bare time passes exact format. |
| APEX-15-02 | Counterbalance revision order for answer trials | Run paired A/B and B/A blocks with fresh local chats. | Each arm appears first equally often and every trial carries its order. |
| APEX-15-03 | Calibrate first-answer timing across server and renderer | Replay a scripted 400 ms gap between first SSE content and visible text, inserting two heartbeats and a reasoning-only event first. | The grader ignores all three non-answer events and recovers the injected 400 ms gap within one animation frame. |
| APEX-15-04 | Recover per-turn usage without bot-key ambiguity | Join recorded provider usage by bot, task and turn identity. | Each completed trial has one attributable row or an explicit missing reason. |
| APEX-15-05 | Exclude mismatched model settings from paired results | Change the local model identifier or decoding temperature in one arm of an otherwise identical trial pair. | The comparison identifies the exact mismatched setting and excludes only that pair from the effect estimate. |

## Personalized answers and controls

**Current state** The loopback reader grades personal and team facts separately, including a member-only control. Its synthetic corpus can also evaluate whether an answer respects the chosen person's preferences.

**Sources** [evals/runners/notebook-reader.mjs](../../../../evals/runners/notebook-reader.mjs) · [docs/plans/2026-11-21-notebook-reader-trials.jsonl](../../../../docs/plans/2026-11-21-notebook-reader-trials.jsonl) · [server/recall.ts](../../../../server/recall.ts) · [server/memory-entries.ts](../../../../server/memory-entries.ts)

**Dependencies** APEX-01-09

**Risk** A superficially correct personalized answer can apply another person's preference or rely on a superseded profile fact.

**Risk level** High

**Automated verification** Extend the reader pairs with explicit preferences, overrides and a no-profile condition. Score the answer and its source labels for both members across counterbalanced trials.

**Manual verification** Blind-review the fixture answer before opening its member and team source passages. Verify which instruction was actually relevant to this request.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-06 | Adapt one answer to two members' distinct unit preferences | Give member A metric and B imperial preferences, then ask the identical fixture measurement question. | Each answer uses its own units and the numeric conversion is correct in both arms. |
| APEX-15-07 | Honor a one-turn preference override without changing the profile | Ask a member who prefers terse replies for one detailed fixture explanation and then send a normal follow-up. | Only the first reply uses the override and the stored preference remains terse. |
| APEX-15-08 | Stop personalizing from a withdrawn preference | Remove a synthetic preferred language, reopen the chat and ask the same question. | The old preference is absent from the supplied passages and evaluation does not credit an accidental language match. |
| APEX-15-09 | Separate team style from a member's private preference | Give the shared notebook a project template and the personal notebook an unrelated accessibility preference. | The response follows both where applicable and attributes each to its proper scope. |
| APEX-15-10 | Measure correct abstention on an unknown preference | Ask for a personalized recommendation with no preference source, then repeat with an explicit member note. | The empty control invents no preference and the sourced answer uses only the expected fact. |

## Judge calibration

**Current state** The live suite pins judge prompts and reports scores against configured thresholds and previously stored baselines. Existing case “fills wait timeouts from config, derives gates, and drops live-only invariants”.

**Sources** [evals/live/judge/judge.ts](../../../../evals/live/judge/judge.ts) · [evals/live/live-suite.test.ts](../../../../evals/live/live-suite.test.ts)

**Dependencies** APEX-01-07

**Risk** Judge drift can change historical scores without any product change.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/live/live-suite.test.ts`.

**Manual verification** Read blind rubric decisions beside the raw synthetic artifacts and pinned judge prompt.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-11 | Pin judge prompt content before a comparison | Alter a copied judge prompt without updating its recorded digest. | The comparison refuses scoring and names the affected manifest entry. |
| APEX-15-12 | Calibrate with one known wrong artifact | Insert a plausible answer carrying an incorrect synthetic total into a blind batch. | The deterministic total fails regardless of the prose grade. |
| APEX-15-13 | Report missing judge output independently of quality | Time out one judge response while other trials finish. | The missing verdict is counted separately and never silently scored as a pass. |
| APEX-15-14 | Check blind scoring order sensitivity | Present identical paired artifacts in both orders with hidden arm labels. | The report shows per-pair disagreement and the number of order reversals. |
| APEX-15-15 | Preserve an auditable rubric revision | Run the same frozen snapshots under two deliberately versioned rubrics. | Each reported score identifies its rubric hash and original input ID. |

## Specialist skill evaluation

**Current state** The skill bench compares skill-installed and no-skill arms. It measures non-discriminating controls and unstable verdicts; the prompt corpus includes held-out near misses.

**Sources** [evals/scorers/skill-bench.ts](../../../../evals/scorers/skill-bench.ts) · [evals/scorers/skill-bench.test.ts](../../../../evals/scorers/skill-bench.test.ts) · [evals/runners/run-skill-bench.ts](../../../../evals/runners/run-skill-bench.ts) · [evals/skill-bench/fixtures/bench-triage-handoff.json](../../../../evals/skill-bench/fixtures/bench-triage-handoff.json) · [evals/skill-bench/triggers.test.ts](../../../../evals/skill-bench/triggers.test.ts)

**Dependencies** APEX-01-12

**Risk** A skill can appear helpful by dispatching a specialist on every prompt, including unrelated work.

**Risk level** Medium

**Automated verification** Run the offline skill bench on matched installed and uninstalled arms. Score both the selected role ID and the accepted deliverable using held-out, positive and near-miss cases.

**Manual verification** Blind-review the handoff briefs with the skill label hidden and inspect which specialist actually got each job.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-15-16 | Separate specialist activation from task success | Have a correctly activated specialist return an intentionally incomplete result. | Activation passes and artifact acceptance fails as separate recorded verdicts. |
| APEX-15-17 | Measure false specialist dispatches on near misses | Use held-out prompts containing the trigger term in an unrelated request. | Report the number of unnecessary specialist assignments separately from correct no-dispatch decisions. |
| APEX-15-18 | Require a complete brief when a skill dispatches its specialist | Withhold the synthetic packing slip in one otherwise valid triage handoff. | Only the arm containing the actual input and a named expected output passes brief completeness. |
| APEX-15-19 | Expose unstable specialty selection across repeated prompts | Flip the selected role in one of three identical fixture replicates. | The score reports the differing specialist IDs and a 2/3 agreement rate. |
| APEX-15-20 | Exclude always-passing controls from a specialization claim | Include one general greeting satisfied by every role and one role-specific audit case. | The effect report isolates the audit delta and marks the greeting nondiscriminating. |
