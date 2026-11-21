# 03 · HTTP and SSE event continuity

[Project APEX ledger](../README.md) · Architecture and infrastructure

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Replay window

**Current state** The replay buffer evicts by frame count and size and counts different admin and member representations. Existing case “drops the oldest frames once they hold more than its size, payloads counted”.

**Sources** [server/host/sse-replay.ts](../../../../server/host/sse-replay.ts) · [server/host/sse-replay.test.ts](../../../../server/host/sse-replay.test.ts) · [src/lib/live-events.ts](../../../../src/lib/live-events.ts)

**Dependencies** APEX-01-03

**Risk** A reconnect gap can silently omit a settled answer.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/sse-replay.test.ts`.

**Manual verification** Disconnect the fixture desktop, publish the row's sequence, then compare replay IDs with the server log.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-03-01 | Expose an expired replay cursor | Reconnect from just before the earliest retained frame. | The client gets an explicit reset and one fresh snapshot without replaying a partial gap. |
| APEX-03-02 | Account for member-sized replay frames | Fill a buffer with different admin and member payload sizes. | Eviction occurs at the documented bound using both representations. |
| APEX-03-03 | Preserve a single oversized latest frame | Insert one frame larger than the replay byte cap after three small frames. | Only the oversized latest frame remains recoverable and its cursor is valid. |
| APEX-03-04 | Recover at the exact oldest retained ID | Request replay using the oldest surviving cursor with two newer frames. | Only the two newer IDs arrive in original order. |
| APEX-03-05 | Keep a cursor scoped to its feed | Reconnect to place B with the desktop cursor previously stored for A. | B reconstructs its own snapshot and shows zero A events. |

## Slow readers

**Current state** Fanout classifies replaceable screen frames separately from durable events when a socket stops draining. Existing case “drops a replaceable screen frame once backpressured, but never drops a durable event”.

**Sources** [server/sse-fanout.ts](../../../../server/sse-fanout.ts) · [server/sse-fanout.test.ts](../../../../server/sse-fanout.test.ts)

**Dependencies** APEX-01-03

**Risk** A screen stream can starve durable conversation events on a slow socket.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/sse-fanout.test.ts`.

**Manual verification** Throttle one fixture subscriber and read its accepted IDs next to an unthrottled control.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-03-06 | Reserve durable delivery during screen bursts | Mix 100 replaceable frames with a question and a completion while writes stall. | Both durable IDs reach the client in order and old screen frames can be discarded. |
| APEX-03-07 | Recover normal screen cadence on drain | Release a blocked socket after three dropped frames. | The first new screen frame is delivered exactly once after drain. |
| APEX-03-08 | Disconnect one over-budget subscriber | Hold one writer past the buffered-byte limit beside a responsive reader. | Only the stalled socket closes and the responsive reader sees every durable ID. |
| APEX-03-09 | Retire listeners after backpressure teardown | Alternate drain and close for 50 synthetic clients. | The remaining listener count returns to the initial count after every batch. |
| APEX-03-10 | Avoid durable event duplication on partial writes | Mark the write accepting a question as backpressured and then signal drain twice. | The observer records that question ID once. |

## Renderer subscription

**Current state** The renderer saves a cursor, treats pings as liveness and can retry a stale subscription. Existing case “builds cold and resumable stream URLs”.

**Sources** [src/lib/live-events.ts](../../../../src/lib/live-events.ts) · [src/lib/live-events.test.ts](../../../../src/lib/live-events.test.ts)

**Dependencies** APEX-01-11

**Risk** A stale subscription can paint the previous workspace into a newly selected window.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/live-events.test.ts`.

**Manual verification** Switch synthetic servers while looking at the chat and the filtered EventSource log.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-03-11 | Restore a cursor after a sleeping laptop wakes | Freeze timers past the stale threshold and deliver the desktop wake event. | Exactly one new subscription requests the most recent data cursor. |
| APEX-03-12 | Ignore a retired subscription's late callback | Switch from A to B while delaying the final A message. | B's transcript and saved cursor contain no A event. |
| APEX-03-13 | Keep heartbeat frames out of unread counts | Deliver 20 data pings between two assistant messages. | Liveness advances 20 times and only the two messages affect the conversation. |
| APEX-03-14 | Bound retry churn during an outage | Fail reconnects for a full backoff cycle under a fake clock. | Attempts observe the configured maximum delay and stopping the feed removes the next retry. |
| APEX-03-15 | Continue a stream after one malformed frame | Place invalid JSON between two valid fixture events. | Both valid IDs appear once and a parse failure cannot advance the cursor past unseen work. |

## Tool history

**Current state** The rebuilt prompt includes earlier tool names only when tool-history replay is enabled. Existing case “names earlier tool calls in a rebuilt session only when switched on”.

**Sources** [server/replay-settings.ts](../../../../server/replay-settings.ts) · [server/replay-tool-history.e2e.test.ts](../../../../server/replay-tool-history.e2e.test.ts) · [server/context-rebuild.ts](../../../../server/context-rebuild.ts)

**Dependencies** APEX-01-04

**Risk** Rebuilt history can misrepresent a previous tool effect as a new one.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/replay-tool-history.e2e.test.ts`.

**Manual verification** Reopen the fixture conversation with replay on and off and inspect the driver prompt beside the visible transcript.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-03-16 | Replay the tool name without rerunning it | Rebuild a session after a counted file write and ask what happened. | The new prompt names the write while the file sink still records one effect. |
| APEX-03-17 | Honor replay preference on the next rebuilt turn | Toggle history off after one tool-bearing turn and force a new engine session. | The rebuilt prompt contains zero historical tool summaries. |
| APEX-03-18 | Keep old and new tool IDs separate in history | Reuse a tool name across two turns with different IDs and outcomes. | Replayed lines preserve order and distinguish success from refusal. |
| APEX-03-19 | Clip a long prior tool summary at the replay budget | Seed a 100 KB synthetic result before rebuilding. | The prompt stays inside the declared byte bound and marks the omitted content. |
| APEX-03-20 | Omit another thread's tools on branch switch | Record two distinct tool names in sibling conversations and rebuild one. | Only the selected thread's historical tool name reaches the driver. |
