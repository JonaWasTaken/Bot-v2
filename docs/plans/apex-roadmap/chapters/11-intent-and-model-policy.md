# 11 · Intent and model policy

[Project APEX ledger](../README.md) · Core intelligence

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Turn classification

**Current state** The router considers message text, attachments and recent tool work when selecting the quick or full path. Existing case “keeps a go-ahead on the full model, with or without earlier tool work”.

**Sources** [server/turn-route.ts](../../../../server/turn-route.ts) · [server/turn-route.test.ts](../../../../server/turn-route.test.ts) · [evals/turn-routing/cases.json](../../../../evals/turn-routing/cases.json)

**Dependencies** APEX-01-06

**Risk** Eager quick-model routing can degrade a complex answer silently.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/turn-route.test.ts`.

**Manual verification** Send each labeled fixture prompt from a fresh desktop chat and inspect the selected engine and reply.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-11-01 | Keep consequential short questions on the full model | Add minimal pairs for routine arithmetic and a similarly short high-stakes decision. | The latter always stays on full and the arithmetic control remains eligible for quick. |
| APEX-11-02 | Route a follow-up using prior tool context | Pair the same short follow-up after a lookup and after plain chat. | The tool-dependent variant preserves the full model for all three repetitions. |
| APEX-11-03 | Keep an attachment from becoming a cheap text-only turn | Classify a one-word request with and without a fixture document. | The attachment variant never selects a model unable to read it. |
| APEX-11-04 | Distinguish thanks from permission to continue | Place thanks and a short go-ahead after an unfinished task. | Thanks can take the simple path while the go-ahead retains the working model. |
| APEX-11-05 | Fall back when the preferred quick model disappears | Remove the quick variant from an otherwise ready engine catalog. | One request reaches the configured full model and no unknown model ID is sent. |

## Routing labels

**Current state** The routing evaluator distinguishes eager and cautious misses and aggregates verdicts by language. Existing case “names which way a miss goes”.

**Sources** [evals/turn-routing/score.ts](../../../../evals/turn-routing/score.ts) · [evals/turn-routing/score.test.ts](../../../../evals/turn-routing/score.test.ts) · [evals/turn-routing/cases.json](../../../../evals/turn-routing/cases.json)

**Dependencies** APEX-01-06

**Risk** A training set dominated by English may hide costly routing mistakes.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/turn-routing/score.test.ts`.

**Manual verification** Review the held-out labels and confusion counts against the fixture prompts in each language.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-11-06 | Report cautious and eager misses separately | Score an intentionally flipped label from each class. | The report attributes one error to each direction with its case ID. |
| APEX-11-07 | Hold out paraphrase families together | Partition prompts by semantic family before tuning thresholds. | No paraphrase family occurs in both tuning and held-out partitions. |
| APEX-11-08 | Measure routing on matched multilingual triplets | Add equivalent direct, tool-dependent and ambiguous asks in three languages. | All nine verdicts appear with per-language denominators. |
| APEX-11-09 | Track changes against the existing labeled baseline | Run old and candidate classifiers on an identical fixed corpus. | Every changed decision is listed once with its old and new route. |
| APEX-11-10 | Protect simple-turn cost savings from a blanket full route | Evaluate an always-full control beside the candidate. | The report includes full-model calls saved and eager misses for both arms. |

## Window selection

**Current state** The server has a model-family context-window lookup that can return no known value. Existing case “knows the common families and stays silent otherwise”.

**Sources** [server/model-context-window.ts](../../../../server/model-context-window.ts) · [server/model-context-window.test.ts](../../../../server/model-context-window.test.ts) · [server/context-budget.ts](../../../../server/context-budget.ts)

**Dependencies** APEX-01-06

**Risk** An inflated context window can make a selected model reject the entire turn.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/model-context-window.test.ts`.

**Manual verification** Compare a fixture model's catalog, assembled prompt budget and provider request.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-11-11 | Resolve a versioned model alias to its window | Add two aliases for one synthetic model family and one unrelated name. | Both aliases share the intended window and the unrelated name stays unknown. |
| APEX-11-12 | Handle a missing context-window entry | Remove the model from the fixture inventory and submit a bounded conversation. | One conservative effective limit appears in prompt accounting. |
| APEX-11-13 | Reject an impossible advertised window | Supply zero, negative and nonfinite window values in a catalog fixture. | None become active budgets and each yields the documented fallback. |
| APEX-11-14 | Prefer the active instance's window over a sibling's | Register two providers using the same model name and different limits. | Each assembled turn uses the limit of its selected instance. |
| APEX-11-15 | Recompute routing headroom on model switch | Switch a long chat from a large to a smaller fixture window. | The first request on the smaller model respects its limit or reports a bounded refusal. |

## Checker selection

**Current state** Checker selection searches outside the writer's provider and can yield no eligible alternative. Existing case “picks another provider's model, never a second account of the same provider”.

**Sources** [server/checker-model.ts](../../../../server/checker-model.ts) · [server/checker-model.test.ts](../../../../server/checker-model.test.ts)

**Dependencies** APEX-01-07

**Risk** A checker could be presented as independent while sharing the original provider.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/checker-model.test.ts`.

**Manual verification** Inspect selected writer and checker identities in a fixture with synthetic accounts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-11-16 | Exclude a second account at the same provider from independent review | Configure two writer accounts and no alternative provider. | The independent checker choice is absent. |
| APEX-11-17 | Select a genuinely available alternate checker | Add a signed-out provider and a ready alternative to the writer. | The resulting selection uses the ready alternate instance. |
| APEX-11-18 | Re-evaluate independence after the writer changes | Change the writer to the previously chosen checker provider. | The old same-provider check is invalidated before another review starts. |
| APEX-11-19 | Keep checker absence visible to the caller | Request an independent check when the only alternative is turned off. | The result names the missing checker and records zero checker turns. |
| APEX-11-20 | Preserve explicit model choice in ordinary chat | Enable an eligible checker then send a request needing no review. | Only the selected writer is launched and no review cost is booked. |
