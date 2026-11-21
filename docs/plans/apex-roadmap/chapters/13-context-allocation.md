# 13 · Context allocation

[Project APEX ledger](../README.md) · Core intelligence

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Token accounting

**Current state** Context accounting distinguishes measured window use from estimates and reserves headroom for compaction. Existing case “keeps compaction reachable below small model windows”.

**Sources** [server/context-budget.ts](../../../../server/context-budget.ts) · [server/context-budget.test.ts](../../../../server/context-budget.test.ts) · [server/model-context-window.ts](../../../../server/model-context-window.ts)

**Dependencies** APEX-01-15

**Risk** Counting cumulative tool-round tokens as fresh context can compact too early.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/context-budget.test.ts`.

**Manual verification** Inspect the fixture's context readout, provider count and compaction trigger on a single turn.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-13-01 | Use the most recent measured context value | Replay cumulative usage plus a smaller explicit window reading over three rounds. | The trigger follows the explicit reading and does not sum rounds. |
| APEX-13-02 | Handle a tiny model window without a dead zone | Sweep synthetic token use from zero to the full small window. | At least one compaction threshold is reachable before the hard window limit. |
| APEX-13-03 | Reject invalid readings without freezing accounting | Send NaN, a negative count and then a valid provider count. | The final estimate adopts the valid count and all earlier displayed counts are finite. |
| APEX-13-04 | Reserve response capacity in near-full windows | Add a large prompt just below the nominal model maximum. | Compaction or trimming leaves the declared output reserve before submission. |
| APEX-13-05 | Prevent repeated compaction on negligible regrowth | Append ten short follow-ups after one compaction. | No second compaction occurs until the configured regrowth boundary or hard headroom threshold. |

## Compaction

**Current state** The deterministic summary retains a recent tail and folds older events, including corrections and incomplete outcomes. Existing case “preserves corrections, signs, paths and unfinished outcomes without promoting the opening request”.

**Sources** [server/compaction-summary.ts](../../../../server/compaction-summary.ts) · [server/compaction-summary.test.ts](../../../../server/compaction-summary.test.ts) · [server/context-compaction.e2e.test.ts](../../../../server/context-compaction.e2e.test.ts)

**Dependencies** APEX-01-09

**Risk** Summarization can resurrect stale instructions or drop the person's final correction.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/compaction-summary.test.ts`.

**Manual verification** Compare the fixture summary, retained tail and next driver prompt against the source exchange.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-13-06 | Retain the most recent correction under pressure | Replace a project date twice before compacting a crowded conversation. | The next prompt identifies only the final date as current. |
| APEX-13-07 | Keep a negative constraint in a deterministic summary | Include a signed quantity and an explicit exclusion in older turns. | Both survive summary generation with polarity unchanged. |
| APEX-13-08 | Protect the untouched tail across a fold | Mark the last two exchanges and force one compaction. | Their byte content and ordering match the pre-fold tail. |
| APEX-13-09 | Represent an unfinished action explicitly | End the folded prefix with a tool request that has no result. | The summary marks it unfinished and claims zero completed effects. |
| APEX-13-10 | Keep an earlier summary in its source role | Feed a prior summary containing a synthetic imperative into a second fold. | The helper input labels it as historical data and no new instruction field adopts it. |

## Session rebuild

**Current state** Context rebuild applies both byte and message caps and reports exactly which history was represented. Existing case “keeps short history unchanged and records exactly what was represented”.

**Sources** [server/context-rebuild.ts](../../../../server/context-rebuild.ts) · [server/context-rebuild.test.ts](../../../../server/context-rebuild.test.ts)

**Dependencies** APEX-01-04

**Risk** An inaccurate replay coverage claim can hide omitted history from the next model.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/context-rebuild.test.ts`.

**Manual verification** Reopen a fixture session and compare the replay segment and represented IDs to the stored transcript.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-13-11 | Charge omission notices to the rebuild budget | Force a rebuild with enough history to require a truncation note. | Summary, notice and replay together fit the configured byte ceiling. |
| APEX-13-12 | Exclude obsolete branch anchors from replay | Fork before an old summary anchor then rebuild the new branch. | No summary or tool line from the abandoned branch reaches the driver. |
| APEX-13-13 | Keep short-history rebuild lossless | Use three messages with multiline text and one emoji within the cap. | The represented-ID set includes all three and their order and text match. |
| APEX-13-14 | Bound one enormous historic tool line | Rebuild after a synthetic oversized result followed by a user correction. | The tool line is marked bounded and the later correction remains in budget. |
| APEX-13-15 | Expose actual coverage after a message-count trim | Exceed only the message-count cap with tiny messages. | Every reported covered ID appears in replay and dropped IDs appear in none of the coverage fields. |

## Cost breakdown

**Current state** The breakdown contract and its e2e fixture distinguish engine-measured category values from a missing breakdown. Existing case “answers with the engine's own count while its process holds the conversation, and with nothing otherwise”.

**Sources** [shared/context-breakdown.ts](../../../../shared/context-breakdown.ts) · [server/context-breakdown.e2e.test.ts](../../../../server/context-breakdown.e2e.test.ts) · [src/components/ContextWarning.tsx](../../../../src/components/ContextWarning.tsx)

**Dependencies** APEX-01-15

**Risk** Category estimates shown as measured values can mislead model selection.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/context-breakdown.e2e.test.ts`.

**Manual verification** Inspect the desktop context view across provider start, compaction and stop.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-13-16 | Display measured breakdown only for its owning process | Swap a fixture engine process after its first category report. | The former process's counts disappear until the new process reports. |
| APEX-13-17 | Keep the compaction transition free of stale percentages | Hold the first post-summary turn before its context report. | The UI shows no old breakdown during the gap. |
| APEX-13-18 | Handle a provider that reports only a total | Send a valid total with no per-category fields. | The total remains usable and zero category percentages are fabricated. |
| APEX-13-19 | Reconcile category sums with a measured total | Supply categories that cover only part of the reported input. | Any remainder is explicit and displayed categories never exceed the measured total. |
| APEX-13-20 | Scope context readouts to the active thread | Alternate between two chats reporting different category totals. | Each open chat displays its own process reading after every switch. |
