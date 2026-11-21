# 43 · Startup and navigation

[Project APEX ledger](../README.md) · Multimodal, performance and reliability

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Head start

**Current state** Boot head start begins work before its first consumer and handles later consumption and failures. Existing case “work begins at start and its one result is handed to the first taker”.

**Sources** [electron/boot-head-start.mjs](../../../../electron/boot-head-start.mjs) · [electron/boot-head-start.node-test.mjs](../../../../electron/boot-head-start.node-test.mjs) · [electron/launch-probes.mjs](../../../../electron/launch-probes.mjs)

**Dependencies** APEX-01-15

**Risk** Eager boot work can run twice or conceal a failure from the first consumer.

**Risk level** Medium

**Automated verification** Extend the fixture and run `node --test electron/boot-head-start.node-test.mjs`.

**Manual verification** Inspect timing marks, request counters and first visible chat in cold and warm fixture windows.

**APEX-43-04 Risk level** Critical

**APEX-43-04 Risk** A late result from a previously selected workspace could expose private workspace data in the new one.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-43-01 | Hand prestarted work to the first consumer exactly once | Start a held operation during boot then let the first chat request it. | The first request consumes that result with one producer invocation. |
| APEX-43-02 | Handle a second consumer after prestart consumption | Make two sequential consumers request the same boot work. | The second starts its documented fresh operation and neither hangs. |
| APEX-43-03 | Deliver an early prestart error to the eventual caller | Reject prestarted work before its consumer subscribes. | One handled failure reaches the caller and the app can recover normally. |
| APEX-43-04 | Cancel obsolete startup work after a workspace switch | Switch fixture places before A's prestarted work completes. | A's result never enters B's state and B only uses its own target. |
| APEX-43-05 | Measure the actual cold-start benefit of early work | Alternate enabled and disabled prestart on the same seeded desktop. | At least three matched pairs report first-visible-chat delta and duplicate operation counts. |

## Launch markers

**Current state** Launch marks distinguish whether chat was drawn and report coarse host kinds without addresses. Existing case “are posted once, a moment after the chat is drawn: times and counts by kind of host, never an address”.

**Sources** [src/lib/launch-marks.ts](../../../../src/lib/launch-marks.ts) · [src/lib/launch-marks.test.ts](../../../../src/lib/launch-marks.test.ts) · [electron/launch-record.mjs](../../../../electron/launch-record.mjs)

**Dependencies** APEX-01-15

**Risk** Timing markers may leak server addresses or conflate a blank window with usable chat.

**Risk level** Medium

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/launch-marks.test.ts`.

**Manual verification** Read the fixture launch record beside a recording of the first usable input.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-43-06 | Separate first draw from first usable composer | Delay chat input readiness after the shell paints. | Launch records include ordered shell, chat and usable-input marks for the same run. |
| APEX-43-07 | Keep a no-chat timeout visible in startup data | Start a fixture whose chat never mounts before the give-up limit. | The run records the timeout without inventing a chat mark. |
| APEX-43-08 | Avoid duplicate launch reports on renderer remount | Remount the synthetic chat during the settle interval. | One report represents that launch and any subsequent navigation stays distinct. |
| APEX-43-09 | Publish only coarse host kinds in telemetry | Launch against two synthetic workspace addresses with unique markers. | The report distinguishes host classes while containing neither address marker. |
| APEX-43-10 | Record an already drawn chat promptly | Attach the mark observer after a ready chat exists. | It records a valid first-chat observation without waiting for another render event. |

## Catalog boot

**Current state** The startup catalog may supply saved results while refresh runs and retains disabled entries as such. Existing case “keeps a model the organization turned off marked in the saved list, so no start offers it while its refresh waits”.

**Sources** [server/startup-model-catalog.ts](../../../../server/startup-model-catalog.ts) · [server/startup-model-catalog.test.ts](../../../../server/startup-model-catalog.test.ts)

**Dependencies** APEX-02-01

**Risk** A stale startup model list can momentarily offer a disabled provider.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/startup-model-catalog.test.ts`.

**Manual verification** Inspect the fixture picker before, during and after a delayed catalog refresh.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-43-11 | Use a fresh startup catalog without network delay | Seed a cache inside its freshness interval and hold the network fixture. | The desktop opens the cached list before any refresh response. |
| APEX-43-12 | Refresh an expired catalog in the background | Age the cache past its threshold while keeping the fixture reachable. | The saved list appears promptly and one refresh replaces it. |
| APEX-43-13 | Preserve disabled models in cached-state evaluation | Disable a synthetic model before shutdown and hold the next startup refresh. | No selection can launch that disabled model from stale display state. |
| APEX-43-14 | Keep first-run behavior distinct from cached boots | Remove the catalog cache and hold the first engine read. | The first refresh is not blocked behind a cache that does not exist. |
| APEX-43-15 | Discard a refresh from a superseded environment | Switch fixture workspace while the old catalog fetch is pending. | Only the new workspace's inventory can populate its picker. |

## Desktop benchmark

**Current state** The desktop harness includes synthetic seed generation, startup and reload marks, idle sampling and streaming scenarios.

**Sources** [scripts/bench-desktop.ts](../../../../scripts/bench-desktop.ts) · [scripts/testing/bench-desktop-page.ts](../../../../scripts/testing/bench-desktop-page.ts) · [scripts/testing/bench-desktop-seed.ts](../../../../scripts/testing/bench-desktop-seed.ts)

**Dependencies** APEX-01-15

**Risk** A startup improvement under one seed or load level may regress navigation elsewhere.

**Risk level** Medium

**Automated verification** Run `scripts/bench-desktop.ts` with the sprint seed counts, an explicit fixture browser and a fresh output JSON per arm. Compare the recorded marks and counters.

**Manual verification** Review the benchmark JSON alongside an isolated desktop recording using the sprint's named seed sizes.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-43-16 | Reproduce the sprint's large desktop seed | Seed 150 bots, 300 threads and 2,000 messages as in the sprint baseline. | A run records actual seed counts, machine, revision, first-visible-chat and renderer RSS. |
| APEX-43-17 | Interleave cold launches for a performance comparison | Alternate at least three cold launches per revision on the same idle host. | Both arms report median and range plus host and profile identity. |
| APEX-43-18 | Separate reload cost from cold start | Reload a seeded desktop six times per arm without reseeding the database. | Cold start and reload distributions use separate sample IDs and units. |
| APEX-43-19 | Measure time from bot selection to usable conversation | Alternate between a large and an empty fixture conversation from the sidebar. | Each pair records click, first content and usable composer timing. |
| APEX-43-20 | Expose the cost of a stream during navigation | Repeat the navigation benchmark with one continuous synthetic background stream. | Both conditions report selection latency and p95 frame time over equal observation windows. |
