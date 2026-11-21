# 32 · Receipts and idempotency

[Project APEX ledger](../README.md) · Autonomous execution

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Event receipts

**Current state** Event receipts preserve canonical job identity across retry, pruning and a failed persistence attempt. Existing case “recovers the canonical job when saving the ingress receipt failed, even with a full queue”.

**Sources** [server/routine-event-receipts.ts](../../../../server/routine-event-receipts.ts) · [server/webhook-idempotency.test.ts](../../../../server/webhook-idempotency.test.ts) · [server/routine-ledger.ts](../../../../server/routine-ledger.ts)

**Dependencies** APEX-01-12

**Risk** Duplicate trigger delivery can start a consequential routine twice.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/webhook-idempotency.test.ts`.

**Manual verification** Repeat synthetic event deliveries and compare receipt keys, run IDs and inert effects.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-32-01 | Recover a job whose receipt commit failed | Interrupt the fixture immediately after job persistence and before ingress receipt persistence. | A retry finds the canonical job and produces one logical run. |
| APEX-32-02 | Retain duplicate detection across history cleanup | Evict visible ended-run history inside the event retry window. | Redelivery still resolves to the prior receipt. |
| APEX-32-03 | Keep unfinished work unique past the retry window | Hold a fixture job active beyond receipt expiry then redeliver its event. | One unfinished job remains and no second effect starts. |
| APEX-32-04 | Migrate an older event identity format | Load a legacy delivery record and replay the same event under the current format. | Both forms resolve to one run after persistence. |
| APEX-32-05 | Return a failure for an uncommitted ingress operation | Refuse the synthetic receipt save and observe the caller response. | No false success acknowledgment appears before durable recovery is possible. |

## Conversation send

**Current state** Conversation sends accept bounded client IDs and fingerprint the message and execution mode. Existing case “accepts bounded client ids and rejects malformed input”.

**Sources** [server/send-idempotency.ts](../../../../server/send-idempotency.ts) · [server/send-idempotency.test.ts](../../../../server/send-idempotency.test.ts)

**Dependencies** APEX-01-04

**Risk** A retried Send can duplicate a message or apply it in another mode.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/send-idempotency.test.ts`.

**Manual verification** Submit identical client IDs through fixture conversations and inspect canonical message IDs and mode.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-32-06 | Match retry receipts to message identity and body | Retry one exact send then change just its text under the same client ID. | The exact retry returns the canonical message and changed content does not reuse it. |
| APEX-32-07 | Keep channel execution mode in send identity | Submit the same synthetic send ID in ordinary and alternate channel modes. | One mode cannot silently receive the other's receipt. |
| APEX-32-08 | Read old receipts with missing mode consistently | Load a legacy ordinary message without its channel-mode field. | Its ordinary retry resolves correctly and an alternate-mode retry does not. |
| APEX-32-09 | Bound client ID length at the send boundary | Submit IDs immediately below, at and above the accepted limit. | Only supported lengths enter storage and invalid input writes zero messages. |
| APEX-32-10 | Serialize racing sends with one client ID | Issue ten overlapping identical requests from one fixture client. | Every accepted receipt names the same canonical message and one provider turn starts. |

## Run ledger

**Current state** The occurrence ledger appends state lines, applies removals and recovers intact records before a torn final write. Existing case “reads back what was appended, the last line for a key winning, and keeps its sequence number”.

**Sources** [server/routine-ledger.ts](../../../../server/routine-ledger.ts) · [server/routine-ledger.test.ts](../../../../server/routine-ledger.test.ts)

**Dependencies** APEX-01-12

**Risk** Ledger corruption or ambiguous ordering can make an occurrence disappear or repeat.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-ledger.test.ts`.

**Manual verification** Reopen the fixture ledger and compare decoded states and sequence numbers to its intact record lines.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-32-11 | Recover whole records before a torn last line | Truncate only the final synthetic record and append a new one after reopening. | Every prior complete record and the new record are readable once. |
| APEX-32-12 | Keep lease renewals from inventing state transitions | Renew one fixture occurrence three times without changing its state. | The lease deadline advances while the transition sequence stays fixed. |
| APEX-32-13 | Apply the latest committed state for a repeated key | Append queued, running and completed versions of one occurrence. | Reload yields one current completed occurrence with the correct final sequence. |
| APEX-32-14 | Honor a removal record across compaction | Remove a completed occurrence, compact the ledger and reopen it. | The deleted key stays absent while adjacent keys survive. |
| APEX-32-15 | Localize one malformed record | Insert a synthetic invalid line between two valid occurrence records. | Both valid records decode and the malformed line cannot become a run. |

## Save faults

**Current state** Run progress saves can be coalesced, retried on shutdown and superseded by a successful whole-file commit. Existing case “retries a failed timed save when shutdown flushes pending progress”.

**Sources** [server/routine-progress-save.ts](../../../../server/routine-progress-save.ts) · [server/routine-progress-save.test.ts](../../../../server/routine-progress-save.test.ts) · [server/routine-ledger-faults.test.ts](../../../../server/routine-ledger-faults.test.ts)

**Dependencies** APEX-01-12

**Risk** Coalesced progress may be lost on shutdown or resurrect a removed run.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-progress-save.test.ts`.

**Manual verification** Compare fixture progress snapshots before and after faults, flushes and service teardown.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-32-16 | Retry a failed timed save on shutdown | Fail only the timed flush then stop the fixture scheduler. | Shutdown persists the latest progress once storage is available. |
| APEX-32-17 | Keep a twice-failed progress write pending | Refuse timed and shutdown flushes then recover storage. | A later explicit flush persists the same pending progress. |
| APEX-32-18 | Clear pending progress after a successful whole save | Fail an incremental write then save the complete run record. | No obsolete incremental write overwrites the successful final record. |
| APEX-32-19 | Avoid recreating a deleted routine directory | Remove the synthetic routine before its delayed progress flush fires. | No directory or run file is recreated. |
| APEX-32-20 | Expose unrecoverable persistence failure to backup | Keep writes failing throughout a requested fixture backup. | The backup reports pending progress and cannot claim a complete snapshot. |
