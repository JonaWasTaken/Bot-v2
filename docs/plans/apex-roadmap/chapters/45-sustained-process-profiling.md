# 45 · Sustained-process profiling

[Project APEX ledger](../README.md) · Multimodal, performance and reliability

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Process sampler

**Current state** The process sampler attributes known PIDs and process families to subsystem buckets and handles incomplete trees. Existing case “names the server, engines, browsers, a cloud computer, MCP servers, builds and a bot's commands”.

**Sources** [server/perf/process-sampler.ts](../../../../server/perf/process-sampler.ts) · [server/perf/process-sampler.test.ts](../../../../server/perf/process-sampler.test.ts)

**Dependencies** APEX-01-15

**Risk** Incorrect process attribution can make the wrong subsystem look responsible for a slowdown.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/perf/process-sampler.test.ts`.

**Manual verification** Compare the specimen process tree, sampled bucket table and aggregate totals in the fixture report.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-45-01 | Attribute engine descendants separately from the server | Seed synthetic process trees for two engines and their MCP children. | Every known PID belongs to one intended bucket and subtree totals reconcile. |
| APEX-45-02 | Handle transient orphan processes during sampling | Remove a parent between consecutive fixture snapshots. | The child is still counted once and the report completes. |
| APEX-45-03 | Terminate traversal on a malformed process-parent cycle | Introduce a synthetic two-PID loop in the process table. | The sample finishes within one fixture interval and no PID is counted twice. |
| APEX-45-04 | Keep known engine identity across executable renames | Register a fake engine PID whose executable label changes. | Both samples attribute it to the same registered engine. |
| APEX-45-05 | Report missing platform counters as unavailable | Collect a synthetic platform sample without per-process memory. | CPU remains usable and absent memory is not represented as a measured zero. |

## Event loop

**Current state** Event-loop sampling records stalls over defined observation windows. Existing case “are seen in the window they fall in, and not in one that ended before them”.

**Sources** [server/event-loop-stalls.ts](../../../../server/event-loop-stalls.ts) · [server/event-loop-stalls.test.ts](../../../../server/event-loop-stalls.test.ts) · [scripts/bench-desktop.ts](../../../../scripts/bench-desktop.ts)

**Dependencies** APEX-01-15

**Risk** Event-loop stalls may be attributed to the wrong task or observation window.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/event-loop-stalls.test.ts`.

**Manual verification** Compare fixture stall timestamps and the desktop latency trace over the same interval.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-45-06 | Assign a stall to the interval containing it | Place a synthetic stall exactly at a sampling boundary. | One intended interval owns it and adjacent windows do not double-count. |
| APEX-45-07 | Report p95 and maximum lag during a fixed soak | Feed a repeatable sequence with two known long stalls over ten minutes of fixture time. | Reported p95 and maximum agree with an independent calculation. |
| APEX-45-08 | Keep idle event-loop telemetry quiet | Run the fixture under its idle baseline without deliberate stalls. | No event crosses the configured stall threshold in the controlled synthetic trace. |
| APEX-45-09 | Relate a UI delay to server stalls without claiming causation | Inject one renderer-only delay and one server-only delay in separate runs. | The report preserves both timelines and identifies which process observed each delay. |
| APEX-45-10 | Bound retained stall history over a long session | Simulate 24 hours of intermittent delays. | Retained samples stay within the declared horizon and recent qualifying stalls remain queryable. |

## Stall watchdog

**Current state** The independent watchdog can capture where the main thread is stuck and reduces capture work under memory pressure. Existing case “records where the main thread is stuck, in the data folder, while it is stuck”.

**Sources** [server/perf/stall-watch.ts](../../../../server/perf/stall-watch.ts) · [server/perf/stall-watch.test.ts](../../../../server/perf/stall-watch.test.ts) · [server/stall-watch.worker.ts](../../../../server/stall-watch.worker.ts)

**Dependencies** APEX-01-15

**Risk** Profiling a distressed process can worsen the stall or hide missing diagnostics.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/perf/stall-watch.test.ts`.

**Manual verification** Review fixture watchdog files next to the controlled stall and memory-pressure timeline.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-45-11 | Capture a stack while the main thread is still stalled | Block the fixture thread for a known window using the existing diagnostic harness. | A timestamped in-stall stack record exists before recovery. |
| APEX-45-12 | Skip expensive profiling under constrained memory | Report low memory before triggering a synthetic stall. | A minimal diagnostic is written and zero expensive profiles are taken. |
| APEX-45-13 | Exclude deliberate process suspension from ordinary stalls | Suspend and resume the disposable worker through the fixture's supported signal model. | The watchdog does not label the suspended interval as an application stall. |
| APEX-45-14 | Recover after one unreadable diagnostic record | Truncate a copied watchdog file between two complete records. | The report keeps both readable observations or identifies the exact unavailable record. |
| APEX-45-15 | Bound repeated captures for a sustained stall | Hold one synthetic stall across multiple watchdog intervals. | Capture count follows the configured sampling policy and the final report names the incident duration. |

## Engine pressure

**Current state** Engine memory accounting uses process groups and available kernel counters to inform pressure handling. Existing case “reads memory, swap, the OOM kill count and the memory stall from /proc”.

**Sources** [server/engine-memory.ts](../../../../server/engine-memory.ts) · [server/engine-memory.test.ts](../../../../server/engine-memory.test.ts)

**Dependencies** APEX-01-15

**Risk** Pressure handling can terminate useful work or conceal the actual source of memory growth.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/engine-memory.test.ts`.

**Manual verification** Inspect engine, browser and server memory samples alongside fixture user-visible progress.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-45-16 | Separate shared from resident memory in the report | Supply controlled process counters with known shared pages. | The reported total uses the available proportional measure and labels RSS fallback. |
| APEX-45-17 | Prefer reclaiming an unused browser to stopping a busy engine | Seed one idle fixture browser and one actively responding engine under pressure. | The idle browser is reclaimed first and the answer continues when sufficient memory returns. |
| APEX-45-18 | Identify the final pressure action under sustained thrashing | Hold pressure after all idle resources are exhausted. | Any stopped fixture engine has a recorded reason and one visible terminal outcome. |
| APEX-45-19 | Recover normal admission after pressure subsides | Reduce reported memory load during a queued synthetic turn. | The turn becomes eligible once and no stale pressure warning blocks the next one. |
| APEX-45-20 | Measure residual resources after 100 completed turns | Run identical fake turns with periodic browser use and allow idle cleanup. | The report includes per-bucket start/end RSS, process count, slope and any surviving child PIDs. |
