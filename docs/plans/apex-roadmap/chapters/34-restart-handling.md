# 34 · Restart handling

[Project APEX ledger](../README.md) · Autonomous execution

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Supervisor

**Current state** The Electron supervisor clears readiness and backs off on crashes. The sprint recorded a continuation-state mismatch. Draft PR #5 subsequently counted accepted and in-flight sends across two interruption boundaries. Existing case “crash clears readiness immediately, backs off, and exhausts a bounded budget”.

**Sources** [electron/server-supervisor.mjs](../../../../electron/server-supervisor.mjs) · [electron/server-supervisor.node-test.mjs](../../../../electron/server-supervisor.node-test.mjs) · [scripts/verify-server-recovery.mjs](../../../../scripts/verify-server-recovery.mjs) · [server/runtime/tree.ts](../../../../server/runtime/tree.ts) · [server/resume-recovery.ts](../../../../server/resume-recovery.ts)

**Dependencies** APEX-01-03

**Risk** A restarted server can repeat a completed side effect before the desktop knows its outcome.

**Risk level** Critical

**Automated verification** Run `node --test electron/server-supervisor.node-test.mjs` and extend `node scripts/verify-server-recovery.mjs` with fault gates and an independent per-invocation counter. For the counted-effect case compare the sink receipts, recovered run and terminal desktop transcript.

**Manual verification** In isolated Electron kill only the fixture child at the prescribed boundary and compare counted effects with the recovered transcript.

**APEX-34-01 Related GitHub** [Fork draft PR #5](https://github.com/JonaWasTaken/Bot-v2/pull/5)

**APEX-34-01 Current state** The recovery draft counts sends after service acceptance and during an in-flight reply. It also expires an unsent approval and records zero deliveries when the fresh card is denied. The three-boundary matrix still needs its own repetitions, including one successful authorized retry after a confirmed pre-transmission interruption.

**APEX-34-02 Risk level** High

**APEX-34-02 Risk** Stale readiness can route a new conversation attempt into a dead process and lose its acknowledged start.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-34-01 | Reconcile durable effect receipts across three crash windows | Use a disposable counter that increments on every invocation. Crash the child before dispatch, after increment but before receipt persistence, and after receipt persistence but before settlement. Log attempts independently of receipts. | At each boundary, three repetitions end with one increment, one correlated receipt and one terminal outcome. An ambiguous post-effect restart never increments again. An explicit retry can finish a confirmed pre-effect interruption. |
| APEX-34-02 | Clear readiness as soon as the server child dies | Observe preload health and the active window during a synthetic crash. | The old PID loses ready status before the replacement is advertised. |
| APEX-34-03 | Bound ordinary recovery retries | Crash successive fixture children until the supervisor spends its configured budget. | The exact configured attempts occur and the desktop exposes the exhausted state. |
| APEX-34-04 | Keep an always-on fixture from spawning sibling servers | Delay one child's exit beyond its normal stop interval. | No second child owns the same data directory and one replacement starts after exit. |
| APEX-34-05 | Recover a window only after replacement navigation succeeds | Fail the first post-crash navigation then allow the next. | The existing window remains usable until a replacement confirms readiness. |

## Interrupted occurrence

**Current state** Routine recovery classifies refusals and can retry an interrupted occurrence once in its own conversation. Existing case “reads a busy refusal from its code, never its words”.

**Sources** [server/routine-recovery.ts](../../../../server/routine-recovery.ts) · [server/routine-recovery.test.ts](../../../../server/routine-recovery.test.ts)

**Dependencies** APEX-01-12

**Risk** Restart logic can retry a policy refusal or obscure the original failure.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-recovery.test.ts`.

**Manual verification** Inspect the fixture run history, refusal codes and accepted effect count through recovery.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-34-06 | Use structured refusal codes to classify busy starts | Return a localized busy reason with a stable code. | Recovery classifies it as busy independently of wording. |
| APEX-34-07 | Distinguish a spend cap from a provider spawn error | Fail two fixture runs at those distinct boundaries. | Their recovery classes and displayed reasons differ correctly. |
| APEX-34-08 | Reuse the interrupted routine's own thread on retry | Stop an isolated run after an intermediate result. | Its one retry starts in the same task and can inspect the preceding receipt. |
| APEX-34-09 | Stop after a second recovery failure | Fail the original run and its one allowed retry. | The routine closes failed with two recorded attempts and no third dispatch. |
| APEX-34-10 | Preserve a completed checkpoint across routine recovery | Restart after phase one commits but before phase two begins. | The resumed fixture skips the committed phase and produces one phase-two artifact. |

## Recovery selection

**Current state** Resume failure classification uses acceptance and streaming facts to determine whether replay is eligible. Existing case “is before-accept when a resume was rejected and nothing was sent”.

**Sources** [server/resume-recovery.ts](../../../../server/resume-recovery.ts) · [server/resume-recovery.test.ts](../../../../server/resume-recovery.test.ts) · [server/automatic-recovery.e2e.test.ts](../../../../server/automatic-recovery.e2e.test.ts)

**Dependencies** APEX-01-04

**Risk** Replaying an already accepted provider request can duplicate its consequences.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/resume-recovery.test.ts`.

**Manual verification** Compare synthetic provider acceptance, streamed evidence and the recovery choice on each failure boundary.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-34-11 | Replay only a provably rejected pre-accept resume | Reject the resume before the fake provider sees a prompt. | One permitted replay starts and the original request produced no effect. |
| APEX-34-12 | Avoid blind replay after any streamed token | Fail a resume after returning one fixture text delta. | The attempt is classified after-accept and no automatic duplicate starts. |
| APEX-34-13 | Report unknown acceptance separately from rejection | Interrupt before the client can establish whether resume was attempted. | The state is unknown and never reported as confirmed pre-accept. |
| APEX-34-14 | Retain tool receipt identity in the recovery prompt | End after one confirmed synthetic write and rebuild context. | The continuation prompt cites the prior write receipt and its hash. |
| APEX-34-15 | Offer a user-directed retry from ambiguous recovery | Open the interrupted fixture chat without an acceptance marker and choose retry once. | The retry creates one new identified attempt and preserves the original ambiguous outcome. |

## Restart delivery

**Current state** Startup routines use a persistent gap for headless restarts, a desktop launch identity and staggered recovery dispatch. Existing case “run at most once in OMB_STARTUP_ROUTINE_GAP_MS while the server crashes and starts again every minute”.

**Sources** [server/routine-restarts.ts](../../../../server/routine-restarts.ts) · [server/routine-restarts.test.ts](../../../../server/routine-restarts.test.ts)

**Dependencies** APEX-01-12

**Risk** Restart storms can schedule startup routines more often than intended.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/routine-restarts.test.ts`.

**Manual verification** Restart a synthetic server under a controlled clock and compare startup occurrence keys and times.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-34-16 | Enforce the startup gap across repeated crashes | Restart the fixture every minute inside the configured gap. | At most one startup occurrence is accepted per gap. |
| APEX-34-17 | Respect an explicitly disabled startup gap | Set the fixture gap to zero across three distinct starts. | Three starts yield exactly three occurrence records. |
| APEX-34-18 | Distinguish desktop launch from server-only restart | Restart the child twice without restarting its fixture desktop. | A once-per-desktop-launch routine appears once for that desktop launch. |
| APEX-34-19 | Carry the last-start decision across persistence | Restart just before and just after the next allowed start timestamp. | Only the eligible restart creates another occurrence. |
| APEX-34-20 | Stagger startup routines without delaying normal chat | Seed ten startup triggers and open the desktop composer during recovery. | Scheduled starts obey the stagger and an ordinary chat can settle during the batch. |
