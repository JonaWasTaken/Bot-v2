# 21 · Capability grants

[Project APEX ledger](../README.md) · Tools and computer interaction

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Permission broker

**Current state** The permission proxy maintains outstanding CLI callback decisions and renders multi-question asks as a single card. Existing case “withholds an excluded question without losing the CLI permission callback”.

**Sources** [server/permission-proxy.ts](../../../../server/permission-proxy.ts) · [server/permission-proxy.test.ts](../../../../server/permission-proxy.test.ts) · [src/components/ApprovalCard.tsx](../../../../src/components/ApprovalCard.tsx)

**Dependencies** APEX-01-04

**Risk** A permission response can be routed to a different pending call.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/permission-proxy.test.ts`.

**Manual verification** Inspect the fixture's open cards and recording sink while approving and declining synthetic actions.

**APEX-21-02 Risk level** High

**APEX-21-02 Risk** Losing one keyed response can send an unintended argument to a sensitive tool even when the callback belongs to the right request.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-21-01 | Associate simultaneous permission questions with their own calls | Open two fake-engine questions with the same tool name and answer in reverse. | Each callback receives only its intended decision and arguments. |
| APEX-21-02 | Return all fields of a multi-question approval | Present one card containing three synthetic choices and answer each differently. | One response carries all three keyed answers and closes one card. |
| APEX-21-03 | Leave excluded UI questions available to the CLI callback | Filter one question from the renderer and resolve through the fixture CLI. | The caller receives a decision and the renderer creates no phantom card. |
| APEX-21-04 | Expire permissions when their turn ends | End one turn with a pending card, then submit a belated answer. | No operation starts and the late answer cannot authorize the successor. |
| APEX-21-05 | Settle a disconnected requester without leaving its card active | Close the fixture provider before answering a pending request. | The card becomes terminal and its sink count stays zero. |

## MCP grants

**Current state** MCP grant identity is based on the configured server, with migration for historical secret- or restart-derived keys. Existing case “is the config.json entry: a Vault key by its reference, and nothing a restart adds”.

**Sources** [server/mcp-grant-spec.ts](../../../../server/mcp-grant-spec.ts) · [server/mcp-grant-spec.test.ts](../../../../server/mcp-grant-spec.test.ts)

**Dependencies** APEX-01-04

**Risk** Grant migration can extend a saved permission to a different tool server.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/mcp-grant-spec.test.ts`.

**Manual verification** Compare saved grant keys and effective tool access before and after restarting two synthetic MCP servers.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-21-06 | Keep grants stable across a harmless server restart | Increase the restart counter without changing the synthetic server configuration. | The old grant still applies to exactly its original tool. |
| APEX-21-07 | Retain vault references in grant identity | Rotate a synthetic secret's value while preserving its approved vault reference. | The grant key stays stable and contains no secret value. |
| APEX-21-08 | Invalidate grants after an actual server change | Change a fixture MCP endpoint while retaining the display name. | The old grant is ineligible for the new endpoint. |
| APEX-21-09 | Fold duplicate legacy grants deterministically | Seed the old value-derived key and the current reference-derived key together. | Migration leaves one current grant and a second migration makes zero changes. |
| APEX-21-10 | Prevent grant carryover across sibling instances | Register two servers offering identically named tools with different configurations. | An approval for the first leaves the second ungranted. |

## Command grants

**Current state** Saved command rules include the complete command, exact directory, provider instance and bot. Existing case “persists private rules, deduplicates exact scope and returns detached public records”.

**Sources** [server/command-allowlist.ts](../../../../server/command-allowlist.ts) · [server/command-allowlist.test.ts](../../../../server/command-allowlist.test.ts)

**Dependencies** APEX-01-04

**Risk** A broad command match could authorize a different harmless fixture operation.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/command-allowlist.test.ts`.

**Manual verification** In a disposable command recorder compare accepted and rejected tuples with the saved rule.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-21-11 | Match the working directory exactly for a saved command | Issue the same benign version query from two synthetic folders. | Only the reviewed directory tuple matches the grant. |
| APEX-21-12 | Scope a command rule to the selected engine instance | Run the same harmless fixture command with two configured providers. | The saved rule matches only its original provider instance. |
| APEX-21-13 | Keep rule history independent across bots | Revoke A's rule while B owns an identically worded rule. | Only A loses its grant after restart. |
| APEX-21-14 | Preserve path spelling in a stored command rule | Compare a configured alias and canonical fixture path for one harmless read. | Matching follows the stored directory contract consistently before and after reload. |
| APEX-21-15 | Return detached grant records to settings clients | Mutate a copy returned by the fixture list operation then list again. | The persisted grant tuple and effective access remain unchanged. |

## Cloud actions

**Current state** The cloud computer adapter obtains its target from the gate and returns structured action results, including native images. Existing case “lists the same thirteen tools for every engine”.

**Sources** [server/cloud-computer-tools.ts](../../../../server/cloud-computer-tools.ts) · [server/cloud-computer-tools.test.ts](../../../../server/cloud-computer-tools.test.ts)

**Dependencies** APEX-01-04

**Risk** An adapter can dispatch a computer action before its approval completes.

**Risk level** Critical

**Automated verification** Extend the recording adapter in `server/cloud-computer-tools.test.ts` and run it alongside `server/routine-unattended-approval.e2e.test.ts` with Vitest. Compare gate decisions and adapter invocations using the same operation ID.

**Manual verification** Use an inert recording cloud-computer adapter and compare gate events with its action counter.
**GitHub** Unfiled

**Related GitHub** [#6859](https://github.com/milind-soni/OpenMausBot/issues/6859)

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-21-16 | Hold an allowed cloud action until approval | Pause the gate for a synthetic screenshot or pointer action then allow it. | The sink count is zero before allow and one afterward on the approved computer ID. |
| APEX-21-17 | Keep denied cloud input out of the adapter | Decline one fixture pointer action while a sibling read is allowed. | The sink records the allowed read and zero declined input events. |
| APEX-21-18 | Revoke an interrupted cloud action before release | Cancel a pending gated operation and then resolve the old approval. | No action occurs and exactly one terminal outcome belongs to the interrupted call. |
| APEX-21-19 | Verify the unattended adapter path separately | Schedule a fixture action whose existing policy requires an answer. | The inert adapter records zero actions until a valid answer for that run exists. |
| APEX-21-20 | Keep screen evidence tied to the allocated computer | Reassign the synthetic current computer after the gate selects its target. | The recorded screenshot and receipt both refer to the allocation returned by that gate. |
