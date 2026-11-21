# 22 · Browser action confirmation

[Project APEX ledger](../README.md) · Tools and computer interaction

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## DOM actions

**Current state** The CDP action layer resolves a target before operating on it and can reject ambiguity or detachment. Existing case “rejects ambiguous CSS controls without clicking any row (t3)”.

**Sources** [server/browser/cdp/actions.ts](../../../../server/browser/cdp/actions.ts) · [server/browser/cdp/s4-actions.e2e.test.ts](../../../../server/browser/cdp/s4-actions.e2e.test.ts) · [server/browser/cdp/input.ts](../../../../server/browser/cdp/input.ts)

**Dependencies** APEX-01-14

**Risk** A ref can identify a different control after the page rerenders.

**Risk level** High

**Automated verification** Use `OMB_CDP_CHROME` to identify fixture Chrome. Extend and run `corepack pnpm exec vitest run server/browser/cdp/s4-actions.e2e.test.ts` against the local form and its observed DOM effects.

**Manual verification** Use locally served form fixtures with numbered rows and compare the changed DOM node to the intended control.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-01 | Verify the intended repeated control changed | Render eight identical buttons with numbered after-state markers and choose row six. | Only marker six changes. |
| APEX-22-02 | Refuse a removed element reference | Replace the selected fixture node before the action runs. | The action reports stale and the replacement keeps its original value. |
| APEX-22-03 | Wait for the actual enabled state before filling | Delay enabling a synthetic input until the last observation window. | Either the intended value is observed or the bounded timeout names the input. |
| APEX-22-04 | Confirm selection inside a nested frame | Select the third option in a fixture iframe with a lookalike outer select. | The inner selected value changes and the outer value stays unchanged. |
| APEX-22-05 | Detect an intercepted click via its observed effect | Cover a fixture checkbox with a visible overlay. | The action never reports a verified toggle while the checkbox remains false. |

## Source acquisition and pagination

**Current state** The social research pager counts unique post IDs and detects repeated continuation pages. CDP navigation returns final document status and exposes redirect and download outcomes.

**Sources** [server/x-research.ts](../../../../server/x-research.ts) · [server/x-research.test.ts](../../../../server/x-research.test.ts) · [server/x-research-pagination.test.ts](../../../../server/x-research-pagination.test.ts) · [server/browser/cdp/navigations.ts](../../../../server/browser/cdp/navigations.ts) · [server/browser/cdp/s4-pages.e2e.test.ts](../../../../server/browser/cdp/s4-pages.e2e.test.ts)

**Dependencies** APEX-01-14

**Risk** Duplicate or inaccessible sources can inflate corroboration or make an incomplete research run look exhaustive.

**Risk level** High

**Automated verification** Run the X research pagination suite with a recording fixture backend. Use loopback pages in the real-CDP page suite for the final-document and attachment cases.

**Manual verification** Follow the research source list from desktop, comparing each source URL or post ID with the actual fixture item and observed page outcome.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-06 | Deduplicate overlapping pages of research evidence | Return posts A,B and B,C on successive synthetic pages under a three-source limit. | The source list contains A,B,C once and identifies the page at which coverage stopped. |
| APEX-22-07 | Bound research when a continuation token repeats | Return the first research cursor again from the next page. | The adapter makes no third purchase and marks additional source coverage unresolved. |
| APEX-22-08 | Resolve a source through its redirect chain | Cite an old loopback source URL that redirects twice to a marked document. | The receipt retains the requested URL and the final document identity used to support the claim. |
| APEX-22-09 | Distinguish an attached source document from an HTML finding | Have a research link return a fixture PDF download. | The source list identifies the downloaded artifact and does not attribute the opener page's text to it. |
| APEX-22-10 | Record a failed source lookup without losing sibling sources | Return one unavailable post ID and one valid item from independent lookups. | The reported denominator includes both attempts and only the valid ID supports a finding. |

## Live input

**Current state** Live input associates numbered requests with a view and distinguishes a pre-execution refusal from a completed request. Existing case “names the list the view drew and an option of it”.

**Sources** [server/browser/live-action.ts](../../../../server/browser/live-action.ts) · [server/browser/live-action.test.ts](../../../../server/browser/live-action.test.ts)

**Dependencies** APEX-01-14

**Risk** A retried viewer request can type or click twice.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/browser/live-action.test.ts`.

**Manual verification** Trigger live input on a synthetic page and compare request IDs with visible event counts.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-11 | Coalesce simultaneous repeats from the same view | Submit one numbered button request twice before its first result returns. | The handler runs once and both responses report the same outcome. |
| APEX-22-12 | Allow equal request numbers in different views | Submit request seven in each of two independent fixture views. | Each page receives its own single input. |
| APEX-22-13 | Retry only a request refused before execution | Refuse the first synthetic request as unavailable, restore its target and retry. | The sink records one execution after recovery. |
| APEX-22-14 | Retire replay state when a view closes | Close view A and open B with the same initial request number. | B's first input executes once using B's target. |
| APEX-22-15 | Validate a selection against the rendered options | Remove one option between rendering and a live select request. | No neighboring option is selected and the response identifies the obsolete choice. |

## Downloads

**Current state** Download retention uses per-tab limits and a separate bucket for files with no identified owner. Existing case “an unowned download never evicts files retained by identified tabs”.

**Sources** [server/browser/cdp/downloads.ts](../../../../server/browser/cdp/downloads.ts) · [server/browser/cdp/downloads.test.ts](../../../../server/browser/cdp/downloads.test.ts) · [server/browser/cdp/files.ts](../../../../server/browser/cdp/files.ts)

**Dependencies** APEX-01-14

**Risk** Download retention may evict another tab's artifact or publish partial bytes.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/browser/cdp/downloads.test.ts`.

**Manual verification** Download known fixture payloads into two owned tabs and one unowned bucket, then inspect their files.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-16 | Keep unowned downloads within their own retention bucket | Fill an unowned bucket after saving a named tab's artifact. | The named tab's file survives and only unowned completed entries are evicted. |
| APEX-22-17 | Preserve separate per-tab file limits | Fill tab A to its limit while B holds one recent item. | A evicts its oldest eligible file and B's item remains readable. |
| APEX-22-18 | Distinguish incomplete downloads from usable artifacts | End a synthetic file response halfway through its declared length. | The incomplete file is not exposed as a completed download. |
| APEX-22-19 | Retain distinct artifacts with duplicate display names | Download two different fixture files both called report.csv. | Each receipt resolves to its own expected byte hash. |
| APEX-22-20 | Release download handles on tab teardown | Close the owning tab during a slow download then run fixture cleanup. | The stream closes and no open file handle prevents cleanup. |
