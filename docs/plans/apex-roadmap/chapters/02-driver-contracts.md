# 02 · Driver contracts

[Project APEX ledger](../README.md) · Architecture and infrastructure

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Instance registry

**Current state** The harness registry builds driver instances from saved entries and their defaults, and reuses readiness snapshots for a bounded interval. Existing case “creates live instances for known drivers”.

**Sources** [server/harness/registry.ts](../../../../server/harness/registry.ts) · [server/harness/registry.test.ts](../../../../server/harness/registry.test.ts)

**Dependencies** APEX-01-01

**Risk** A bad instance can hide otherwise usable engines in the picker.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/harness/registry.test.ts`.

**Manual verification** Load the synthetic inventory in desktop Settings, then compare the listed engines with the registry snapshot.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-02-01 | Isolate an unknown driver at startup | Seed two known drivers and one unknown driver in a saved inventory. | Both known instances answer independently and the unknown ID has a diagnostic. |
| APEX-02-02 | Preserve a custom CLI across a catalog refresh | Refresh driver defaults while an instance points at a fixture executable. | The next launch and maintenance command both use that executable. |
| APEX-02-03 | Distinguish omitted configuration from an explicit override | Round-trip two sibling instances through Settings with one field changed. | The untouched sibling still inherits its default after reload. |
| APEX-02-04 | Publish one availability result per instance | Give two equally named local engines different probe outcomes. | The picker associates one ready and one unavailable row with the original IDs. |
| APEX-02-05 | Bound inventory wait during chat startup | Hold one probe beyond the registry deadline and complete another immediately. | The ready entry is usable by the deadline and the slow probe cannot overwrite a newer snapshot. |

## Streaming protocol

**Current state** The chat-completions parser assembles indexed function calls and checks IDs and argument lengths before submission. Existing case “treats explicit null continuation fields as absent”.

**Sources** [server/drivers/openai-chat-protocol.ts](../../../../server/drivers/openai-chat-protocol.ts) · [server/drivers/openai-chat-protocol.test.ts](../../../../server/drivers/openai-chat-protocol.test.ts) · [server/drivers/openai-chat-fetch.ts](../../../../server/drivers/openai-chat-fetch.ts)

**Dependencies** APEX-01-04

**Risk** A partial provider frame can turn one approved operation into two tool calls.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/drivers/openai-chat-protocol.test.ts`.

**Manual verification** Replay the synthetic chunk stream and compare the rendered tool cards with the recording adapter.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-02-06 | Join interleaved argument fragments by tool index | Alternate chunks from a weather lookup and a document lookup. | Each parsed object contains only its original fields and both tool IDs survive. |
| APEX-02-07 | Keep a streamed call ID across null continuation frames | Deliver the ID, two null metadata chunks and a closing frame. | Exactly one recorded call uses the first ID and the complete arguments. |
| APEX-02-08 | Surface an unfinished tool envelope at EOF | End the fixture stream between the function name and its arguments. | The turn records one protocol error and zero tool invocations. |
| APEX-02-09 | Handle UTF-8 split inside an argument | Fragment an emoji inside a quoted city name at each byte boundary in the transport fixture. | Every split decodes to the same city and yields one invocation. |
| APEX-02-10 | Distinguish prose-only completion from an empty tool call | Replay two terminal responses with identical finish timing and different payloads. | The prose reaches chat once and the nameless call never reaches the adapter. |

## Session leases

**Current state** Session idle policy combines machine memory, defaults and per-harness overrides. The shared Hermes gateway has a separate process lifetime to verify. Existing case “defaults to ten minutes with a ten-second floor”.

**Sources** [server/drivers/session-idle.ts](../../../../server/drivers/session-idle.ts) · [server/drivers/session-idle.test.ts](../../../../server/drivers/session-idle.test.ts) · [server/drivers/acp/hermes.ts](../../../../server/drivers/acp/hermes.ts) · [server/drivers/acp/hermes.test.ts](../../../../server/drivers/acp/hermes.test.ts)

**Dependencies** APEX-01-03

**Risk** Idle cleanup of a shared gateway can terminate a sibling conversation.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/drivers/session-idle.test.ts`.

**Manual verification** In two fixture chats inspect the synthetic gateway PID, lease timestamps and settle events before and after each close.
**GitHub** Unfiled

**Related GitHub** [#6898](https://github.com/milind-soni/OpenMausBot/issues/6898)

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-02-11 | Preserve a shared Hermes gateway for a busy sibling | Expire chat A while B holds a scripted open response from their common gateway. | B finishes on the original PID and only A loses its idle session. |
| APEX-02-12 | Release the final gateway lease once | Close the last two idle chats in the same scheduler tick. | The gateway reports one shutdown and the next chat opens one new process. |
| APEX-02-13 | Reconcile a lease after cancellation | Cancel a turn while the fake gateway is waiting for input. | Its lease disappears and the other user's active lease keeps its original deadline. |
| APEX-02-14 | Expose the effective idle policy | Route a small-memory profile and a per-engine override through diagnostics. | Each reports the same duration the fake clock actually uses to reap it. |
| APEX-02-15 | Exclude unrelated gateway instances from shared cleanup | Configure two Hermes instances with distinct fixture homes and equal bot names. | Reaping one changes neither the PID nor the history of the other. |

## Research catalogs and provider refusals

**Current state** The research tools perform separate catalog search, endpoint inspection and paid calls. The adapter distinguishes empty balance, rate limiting, unknown endpoints and relay availability.

**Sources** [server/research.ts](../../../../server/research.ts) · [server/research.test.ts](../../../../server/research.test.ts) · [server/drivers/agents-research-tools.ts](../../../../server/drivers/agents-research-tools.ts)

**Dependencies** APEX-01-07

**Risk** A provider refusal can look like evidence that no matching information exists, or trigger a second charge.

**Risk level** High

**Automated verification** Run the research suite against a recording loopback catalog and relay. Count catalog reads, paid calls, returned endpoint IDs and user-visible outcomes.

**Manual verification** From a fixture research chat open the proposed endpoint and compare its parameters and quoted cost with the adapter request. Inspect failed requests alongside healthy empty results.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-02-16 | Discover a research endpoint without buying a result | Search the synthetic catalog for a company-news dataset with two candidate endpoints. | The response lists both endpoint IDs and their parameters and the paid-call counter remains zero. |
| APEX-02-17 | Validate the selected endpoint before collecting evidence | Inspect a synthetic POST endpoint requiring a JSON body and a separate query flag. | Only the selected endpoint receives the documented body and query combination. |
| APEX-02-18 | Distinguish an empty research corpus from exhausted balance | Compare a valid empty dataset with a synthetic insufficient-balance response. | The former is a zero-result observation and the latter is an explicit unavailable source with no invented findings. |
| APEX-02-19 | Preserve uncertainty during a research rate limit | Rate-limit one endpoint while a second independent source remains usable. | The report keeps the second source and marks the first deferred with no fabricated zero count. |
| APEX-02-20 | Recover research availability after a disabled relay | Disable the synthetic plan relay, advance through its recheck interval and re-enable it. | Discovery becomes available after a successful probe and no paid call is made by the probe. |
