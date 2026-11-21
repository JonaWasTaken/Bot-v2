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

**Automated verification** Use `OMB_CDP_CHROME` to identify fixture Chrome. Extend and run `corepack pnpm exec vitest run server/browser/cdp/s4-actions.e2e.test.ts` against the local form and its observed DOM effects.

**Manual verification** Use locally served form fixtures with numbered rows and compare the changed DOM node to the intended control.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-01 | Verify the intended repeated control changed | Render eight identical buttons with numbered after-state markers and choose row six. | Only marker six changes. |
| APEX-22-02 | Refuse a removed element reference | Replace the selected fixture node before the action runs. | The action reports stale and the replacement keeps its original value. |
| APEX-22-03 | Wait for the actual enabled state before filling | Delay enabling a synthetic input until the last observation window. | Either the intended value is observed or the bounded timeout names the input. |
| APEX-22-04 | Confirm selection inside a nested frame | Select the third option in a fixture iframe with a lookalike outer select. | The inner selected value changes and the outer value stays unchanged. |
| APEX-22-05 | Detect an intercepted click via its observed effect | Cover a fixture checkbox with a visible overlay. | The action never reports a verified toggle while the checkbox remains false. |

## Page lifecycle

**Current state** CDP navigation exposes document readiness, status, downloads and tab changes on local fixture pages. Existing case “waits for the readiness asked for and reports the document's status”.

**Sources** [server/browser/cdp/navigations.ts](../../../../server/browser/cdp/navigations.ts) · [server/browser/cdp/s4-pages.e2e.test.ts](../../../../server/browser/cdp/s4-pages.e2e.test.ts)

**Dependencies** APEX-01-14

**Risk** A navigation receipt can describe the outgoing page as the destination.

**Automated verification** Use the explicit fixture Chrome binary and run `corepack pnpm exec vitest run server/browser/cdp/s4-pages.e2e.test.ts` against local origin, redirect and download responders.

**Manual verification** Follow the local fixture navigation and compare status, committed URL and tab identity.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-06 | Report the final document of a redirect chain | Follow three loopback redirects ending at a marked page. | The receipt identifies the final URL, status and correct tab. |
| APEX-22-07 | Distinguish a download response from page navigation | Return a fixture attachment for an otherwise ordinary link. | The original document remains active and the receipt identifies one saved download. |
| APEX-22-08 | Surface an unavailable local destination | Navigate to a closed fixture port from a known page. | The action reports a network failure and shows no successful destination observation. |
| APEX-22-09 | Respect requested readiness on a slowly loading page | Delay a subresource after DOM content is ready. | DOM-ready and load-complete requests settle at their respective observed boundaries. |
| APEX-22-10 | Keep a popup action attached to its opener | Open two fixture links into distinct child tabs simultaneously. | Each child receipt resolves to its actual opener and document marker. |

## Live input

**Current state** Live input associates numbered requests with a view and distinguishes a pre-execution refusal from a completed request. Existing case “names the list the view drew and an option of it”.

**Sources** [server/browser/live-action.ts](../../../../server/browser/live-action.ts) · [server/browser/live-action.test.ts](../../../../server/browser/live-action.test.ts)

**Dependencies** APEX-01-14

**Risk** A retried viewer request can type or click twice.

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

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/browser/cdp/downloads.test.ts`.

**Manual verification** Download known fixture payloads into two owned tabs and one unowned bucket, then inspect their files.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-22-16 | Keep unowned downloads within their own retention bucket | Fill an unowned bucket after saving a named tab's artifact. | The named tab's file survives and only unowned completed entries are evicted. |
| APEX-22-17 | Preserve separate per-tab file limits | Fill tab A to its limit while B holds one recent item. | A evicts its oldest eligible file and B's item remains readable. |
| APEX-22-18 | Distinguish incomplete downloads from usable artifacts | End a synthetic file response halfway through its declared length. | The incomplete file is not exposed as a completed download. |
| APEX-22-19 | Retain distinct artifacts with duplicate display names | Download two different fixture files both called report.csv. | Each receipt resolves to its own expected byte hash. |
| APEX-22-20 | Release download handles on tab teardown | Close the owning tab during a slow download then run fixture cleanup. | The stream closes and no open file handle prevents cleanup. |
