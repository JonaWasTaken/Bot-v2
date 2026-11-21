# 05 · Fixture reproducibility

[Project APEX ledger](../README.md) · Architecture and infrastructure

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Launcher

**Current state** The verification launcher supplies an isolated home, explicit ports, bundled catalog and allowlisted fake-provider environment. Existing case “lets the Claude fake's knobs and the Codex fake's background-call knobs cross, and nothing else”.

**Sources** [scripts/control-omb.ts](../../../../scripts/control-omb.ts) · [scripts/control-omb.test.ts](../../../../scripts/control-omb.test.ts)

**Dependencies** APEX-01-02

**Risk** A verification command that targets the wrong instance can alter a user's chat.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run scripts/control-omb.test.ts`.

**Manual verification** Inspect the fixture launch banner, doctor output and temporary home before sending any synthetic input.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-05-01 | Bind every mutating fixture command to an explicit URL | Start two isolated servers and direct one message to the second URL. | Only the second database records it and an invocation without an explicit target refuses mutation. |
| APEX-05-02 | Demonstrate environment isolation with synthetic markers | Set one fake-engine knob and one unrelated sentinel in the launching shell. | Only the approved knob reaches the child's environment snapshot. |
| APEX-05-03 | Give concurrent fixtures independent port pairs | Launch four fixture servers concurrently and record both ports per child. | All eight listeners belong to the correct PID and each doctor reads its own marker. |
| APEX-05-04 | Keep catalog selection deterministic offline | Block the fixture model-catalog network stub and launch twice. | Both starts expose the same bundled inventory without an external request. |
| APEX-05-05 | Clean up after a startup probe fails | Hold health unavailable until the launcher times out. | Its child exits and its chosen ports can be rebound by a new fixture. |

## Scripted provider

**Current state** The fake Claude CLI logs setup and health traffic separately from scored turn output. Existing case “keeps the server's connection check out of every turn and one-shot capture, logging it on its own”.

**Sources** [server/testing/fake-claude-cli.ts](../../../../server/testing/fake-claude-cli.ts) · [server/testing/fake-claude-dump.test.ts](../../../../server/testing/fake-claude-dump.test.ts)

**Dependencies** APEX-01-04

**Risk** Setup and health checks can contaminate the evidence attributed to a real turn.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/testing/fake-claude-dump.test.ts`.

**Manual verification** Inspect the fake engine's per-turn dump and separate connection-check log after the stimulus.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-05-06 | Separate setup from a scored reply | Run onboarding and then one arithmetic turn in the same fixture. | The answer corpus has one scored record and zero setup replies. |
| APEX-05-07 | Capture two simultaneous fake sessions independently | Hold a marked reply in each of two chats and release in reverse order. | Two dumps retain their original task and marker associations. |
| APEX-05-08 | Make chunk timing reproducible | Configure a four-chunk scripted response and freeze the fixture's cadence. | All four sequence numbers occur once in order on two replays. |
| APEX-05-09 | Record a controlled failure without poisoning the next run | Exit the first fake provider before settlement then start a fresh conversation. | The first trace records the interruption and the second completes with its own marker. |
| APEX-05-10 | Detect an accidental live-model fallback | Remove the fake executable from the selected fixture instance. | The run fails with an unavailable provider and observes zero non-loopback requests. |

## Control surface

**Current state** The control UI has an accessibility-tree driver and can skip its browser-dependent e2e lane when the prerequisite is missing.

**Sources** [scripts/testing/control-omb-ui.ts](../../../../scripts/testing/control-omb-ui.ts) · [scripts/testing/control-omb-ui.e2e.test.ts](../../../../scripts/testing/control-omb-ui.e2e.test.ts) · [scripts/verify-server-connection.mjs](../../../../scripts/verify-server-connection.mjs)

**Dependencies** APEX-01-11

**Risk** A smoke that exits before its final interaction can look green despite missing UI coverage.

**Automated verification** Extend `scripts/testing/control-omb-ui.e2e.test.ts` and run it with the pinned fixture browser available. Save the final action and accessible snapshot for the case. An unavailable browser counts as skipped.

**Manual verification** Use the fixture's accessibility tree to replay the control action and inspect the final active window.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-05-11 | Wait for a meaningful renderer-ready state | Launch the fixture UI with its first chat delayed. | The control handle reports ready only after the chat textbox becomes addressable. |
| APEX-05-12 | Keep controls tied to the selected fixture window | Open two isolated desktop windows with distinct bot names. | A send issued through B appears once in B and zero times in A. |
| APEX-05-13 | Expose skipped browser prerequisites as skipped | Run the UI recipe with its pinned browser absent then with it available. | The report distinguishes skipped from passed and records the actual executable in the passing run. |
| APEX-05-14 | Identify the last successful UI step when a smoke stops early | Remove one fixture control after the first three actions of a five-action recipe. | The run fails at action four, names the missing control, saves the last accessibility snapshot and never marks action five passed. |
| APEX-05-15 | Make teardown independent of the last UI action | Close the renderer while the control process waits for a missing button. | The wait ends with an error and the fixture child and temporary profile are released. |

## Frozen evidence

**Current state** Offline scorers evaluate frozen snapshots of turns, activities, prompt evidence and handoff trees. Existing case “counts activities and pins a gate answer HTTP status”.

**Sources** [evals/scorers/assertions.ts](../../../../evals/scorers/assertions.ts) · [evals/scorers/assertions.test.ts](../../../../evals/scorers/assertions.test.ts)

**Dependencies** APEX-01-12

**Risk** An assertion that cannot discriminate a broken run can hide a regression.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run --config evals/vitest.config.ts evals/scorers/assertions.test.ts`.

**Manual verification** Open the frozen evaluation snapshot and trace the expected consequence to its assertion result.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-05-16 | Make an unexpected dispatch fail scoring | Add one unrequested child to an otherwise valid synthetic handoff tree. | Only the dispatch cardinality criterion flips from pass to fail. |
| APEX-05-17 | Differentiate queued sends from immediate sends | Replay identical messages once to a busy and once to an idle target. | The two snapshots produce opposite immediate-send verdicts. |
| APEX-05-18 | Pin the order of similarly named tool calls | Switch the arguments of two same-name calls in a captured trace. | The argument-order assertion fails and names the differing position. |
| APEX-05-19 | Make an absent terminal event observable | Remove only the settled event from a passing fixture snapshot. | The completion assertion fails even when the final text is present. |
| APEX-05-20 | Re-evaluate evidence without a running server | Freeze a scripted world, shut it down and score its snapshot twice. | Both verdict lists are byte-identical and neither attempts a network read. |
