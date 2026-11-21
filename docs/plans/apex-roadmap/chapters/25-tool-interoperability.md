# 25 · Tool interoperability

[Project APEX ledger](../README.md) · Tools and computer interaction

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Server health

**Current state** MCP health caches startup checks using different scopes for shared and bot-specific servers. Existing case “checks a server every bot uses once for all of them, and a bot's own for that bot, once each”.

**Sources** [server/mcp-health.ts](../../../../server/mcp-health.ts) · [server/mcp-health.test.ts](../../../../server/mcp-health.test.ts) · [server/mcp-restart.e2e.test.ts](../../../../server/mcp-restart.e2e.test.ts)

**Dependencies** APEX-01-03

**Risk** Repeated MCP startup probes can delay every turn or mark all bots unavailable.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/mcp-health.test.ts`.

**Manual verification** Inspect fixture MCP health rows and launch counters while switching between two bots.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-25-01 | Probe a shared MCP server once per refresh window | Mount the same synthetic server on four bots during simultaneous refresh. | One start check supplies all four health views. |
| APEX-25-02 | Isolate the failure of a bot-specific adapter | Fail A's synthetic MCP startup while B's own adapter stays healthy. | Only A loses its adapter and its diagnostic identifies A. |
| APEX-25-03 | Recheck immediately after an observed runtime failure | Fail a tool call before the normal health refresh time. | The failed server is rechecked once without triggering unrelated probes. |
| APEX-25-04 | Restore an adapter after successful recheck | Let a previously unavailable fixture server start successfully. | Its tools return on the next eligible turn and the stale warning clears. |
| APEX-25-05 | Suppress duplicate start-failure notices | Hold one shared adapter down across several bot turns. | A given failure episode generates one notice per intended audience. |

## Handshake

**Current state** The strict-handshake fixture checks minimal initialize payloads and redacted transport errors across adapters. Existing case “names the first unknown field of each engine's handshake”.

**Sources** [server/drivers/chat-mcp-tools.ts](../../../../server/drivers/chat-mcp-tools.ts) · [server/mcp-strict-handshake.test.ts](../../../../server/mcp-strict-handshake.test.ts)

**Dependencies** APEX-01-04

**Risk** An incompatible initialize envelope can make otherwise compatible tools disappear.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/mcp-strict-handshake.test.ts`.

**Manual verification** Read fake MCP wire traces and compare the initialize and tools/list round trips.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-25-06 | Send a minimal interoperable initialize request | Connect the fixture client to a strict parser that accepts only required fields. | Initialization and one tool listing both succeed. |
| APEX-25-07 | Report an unsupported protocol version explicitly | Advertise a synthetic unsupported version before any call. | One meaningful handshake failure appears and zero tool invocations follow. |
| APEX-25-08 | Preserve request correlation across interleaved results | Return two fixture MCP responses in reverse completion order. | Each tool card receives its original response ID and body. |
| APEX-25-09 | Redact synthetic transport details in protocol errors | Return a fixture MCP error containing a marker in a header value. | The caller sees the safe reason and no marker. |
| APEX-25-10 | Bound a stalled MCP startup | Hold the initialized response open past the configured deadline. | The client closes the attempt and a subsequent healthy fixture server can be listed. |

## Argument schemas

**Current state** The agents schema layer reduces advertised bounds while retaining checks at the call boundary. Existing case “leave out only bounds every call is held to”.

**Sources** [server/drivers/agents-schema.ts](../../../../server/drivers/agents-schema.ts) · [server/drivers/agents-schema.test.ts](../../../../server/drivers/agents-schema.test.ts)

**Dependencies** APEX-01-04

**Risk** A schema advertised to the model may differ from the bounds actually enforced.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/drivers/agents-schema.test.ts`.

**Manual verification** Compare the fixture tool catalog with invocation results at each selected boundary.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-25-11 | Keep enforced bounds executable after schema trimming | Select three trimmed numeric or length bounds from the fixture catalog. | Each boundary value succeeds and each first out-of-range value is refused. |
| APEX-25-12 | Treat blank optional model effort as absent | Submit empty, whitespace-only and a named valid effort. | The first two normalize to omission and the named choice is retained. |
| APEX-25-13 | Identify an unknown tool argument without side effects | Add one unexpected field to an otherwise valid benign fixture call. | The response identifies the invalid input and the handler records no write under the proposed strict contract. |
| APEX-25-14 | Keep required argument names visible after normalization | Compare normalized and full schemas for tools with nested required fields. | Every required path remains discoverable and valid payloads still execute. |
| APEX-25-15 | Test advertised enum values against the actual handler | Invoke each documented option on an inert fixture operation. | Every listed value is accepted and an unlisted control receives a bounded error. |

## Tool result wire

**Current state** The result wire can return a bounded preview, next offset and a redacted retained tail. Existing case “leaves small results unchanged without cache I/O”.

**Sources** [server/drivers/agents-result.ts](../../../../server/drivers/agents-result.ts) · [server/drivers/agents-result.test.ts](../../../../server/drivers/agents-result.test.ts)

**Dependencies** APEX-01-04

**Risk** Output handling can hide a successful effect or disclose sensitive fields in a preview.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/drivers/agents-result.test.ts`.

**Manual verification** Read the fixture tool card, retained result and next offset together.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-25-16 | Avoid cache I/O for a small MCP result | Return a short object below the preview threshold. | The exact object reaches the client and cache write count stays zero. |
| APEX-25-17 | Return a usable continuation offset at a unicode boundary | Put an emoji at the last preview position of a long result. | Following the offset reconstructs the result without loss or duplication. |
| APEX-25-18 | Keep a retained preview and tail equally redacted | Insert a synthetic secret straddling the preview boundary. | Neither the preview nor any retained page contains the raw marker. |
| APEX-25-19 | Preserve action success when result storage fails | Perform a single inert counter increment then make the result cache unavailable. | The response reports output loss while the action count remains one. |
| APEX-25-20 | Keep the bounded wire result within its advertised cap | Return a payload exceeding both preview and storage limits. | Serialized output stays within the declared response budget and marks the missing tail. |
