# Project APEX mission ledger

Project APEX contains **50 chapters and 1,000 independently accepted missions** for the OpenMausBot desktop-first roadmap. The ledger uses the ten programs and chapter order from the November 21 sprint. Stable IDs run from `APEX-01-01` through `APEX-50-20`. The source snapshot is the fork’s `feat/ultra-reliability` at `f0bf6f7cd2a85d0e25270be73dd69bef1799ebc1`. [Sprint](../2026-11-21-first-cycle.md) · [Original Chapter 1](../2026-11-21-revision-parity.md) · [OSS baseline](../2026-11-21-oss-baseline.md)

**Chapter 1 carries the measured baseline.** Thirteen missions have recorded verification, three also have their application changes in the fork’s base history, and the interrupted-effect recovery smoke requires rework. The three remaining Chapter 1 missions and all 980 missions in Chapters 2–50 await their APEX acceptance work. The historical tests, trial counts and installation results retain the limits of the revisions and machines where they ran. [Local answer trials](../2026-11-21-local-answer-trials.csv) · [Notebook reader trials](../2026-11-21-notebook-reader-trials.jsonl)

## Desktop-first delivery

1. Start with the failed restart journey. Reproduce the crash between a counted fixture effect and settlement. Accept one effect, a legible terminal outcome and an explicit retry in isolated Electron. The historical failure is `APEX-01-16`. Mission `APEX-34-01` expands this into three crash boundaries, each repeated three times. [Recovery baseline](chapters/01-revision-parity.md#interrupted-effect) · [Supervisor work](chapters/34-restart-handling.md#supervisor)
2. Exercise everyday desktop entry points on the installed build. The existing Windows result covers one install and launch. The first keyboard batch adds two layouts and actual zoom factors. The connection batch covers switching targets, cancellation and the saved place after relaunch. [Windows keyboard](chapters/10-keyboard-and-accessibility.md#native-shortcuts) · [Workspace connection](chapters/08-workspace-connection.md)
3. Establish the user's visible result before expanding orchestration. Track a fresh message from composer to the first useful answer, then to settlement. Reopen the thread and inspect the retained answer and file. Use bounded local comparisons for quality, time and usage. [Composer](chapters/06-composer-and-stream.md) · [First useful answer](chapters/01-revision-parity.md#first-useful-answer) · [Comparison runs](chapters/15-controlled-comparisons.md)
4. Open the collaboration and autonomy work against accepted primitives. Optional delegation needs a blind solo control. A restarted routine needs durable receipts. Carry those proofs to installed desktop release review alongside the scoped authorization matrix. [Delegation](chapters/26-delegation-economics.md) · [Receipts](chapters/32-receipts-and-idempotency.md) · [Release acceptance](chapters/50-release-acceptance.md)

## Programs and chapters

| Program | Chapters, each with 20 missions |
| --- | --- |
| Architecture and infrastructure | [01 Revision parity](chapters/01-revision-parity.md) · [02 Driver contracts](chapters/02-driver-contracts.md) · [03 HTTP and SSE event continuity](chapters/03-http-and-sse-event-continuity.md) · [04 Persisted task state](chapters/04-persisted-task-state.md) · [05 Fixture reproducibility](chapters/05-fixture-reproducibility.md) |
| Desktop experience | [06 Composer and stream](chapters/06-composer-and-stream.md) · [07 Conversation navigation](chapters/07-conversation-navigation.md) · [08 Workspace connection](chapters/08-workspace-connection.md) · [09 Model selection](chapters/09-model-selection.md) · [10 Keyboard and accessibility](chapters/10-keyboard-and-accessibility.md) |
| Core intelligence | [11 Intent and model policy](chapters/11-intent-and-model-policy.md) · [12 Planning thresholds](chapters/12-planning-thresholds.md) · [13 Context allocation](chapters/13-context-allocation.md) · [14 Action verification](chapters/14-action-verification.md) · [15 Controlled comparisons](chapters/15-controlled-comparisons.md) |
| Advanced memory | [16 Durable formation and consent](chapters/16-durable-formation-and-consent.md) · [17 Notebook boundaries](chapters/17-notebook-boundaries.md) · [18 Retrieval evaluation](chapters/18-retrieval-evaluation.md) · [19 Corrections and forgetting](chapters/19-corrections-and-forgetting.md) · [20 Retention and inspection](chapters/20-retention-and-inspection.md) |
| Tools and computer interaction | [21 Capability grants](chapters/21-capability-grants.md) · [22 Browser action confirmation](chapters/22-browser-action-confirmation.md) · [23 Workspace file changes](chapters/23-workspace-file-changes.md) · [24 Computer ownership](chapters/24-computer-ownership.md) · [25 Tool interoperability](chapters/25-tool-interoperability.md) |
| Multi-agent collaboration | [26 Delegation economics](chapters/26-delegation-economics.md) · [27 Dependency ordering](chapters/27-dependency-ordering.md) · [28 Child permissions](chapters/28-child-permissions.md) · [29 Cancellation and recovery](chapters/29-cancellation-and-recovery.md) · [30 Result verification](chapters/30-result-verification.md) |
| Autonomous execution | [31 Trigger and timezone semantics](chapters/31-trigger-and-timezone-semantics.md) · [32 Receipts and idempotency](chapters/32-receipts-and-idempotency.md) · [33 Unattended approval](chapters/33-unattended-approval.md) · [34 Restart handling](chapters/34-restart-handling.md) · [35 History and result delivery](chapters/35-history-and-result-delivery.md) |
| Projects and productivity | [36 Workspace membership](chapters/36-workspace-membership.md) · [37 Project knowledge](chapters/37-project-knowledge.md) · [38 Artifact provenance](chapters/38-artifact-provenance.md) · [39 Reviewed workflows](chapters/39-reviewed-workflows.md) · [40 Health summaries](chapters/40-health-summaries.md) |
| Multimodal, performance and reliability | [41 File and image fidelity](chapters/41-file-and-image-fidelity.md) · [42 Voice interaction](chapters/42-voice-interaction.md) · [43 Startup and navigation](chapters/43-startup-and-navigation.md) · [44 Large transcripts](chapters/44-large-transcripts.md) · [45 Sustained-process profiling](chapters/45-sustained-process-profiling.md) |
| Security, packaging and release | [46 Electron boundaries](chapters/46-electron-boundaries.md) · [47 Credential and member isolation](chapters/47-credential-and-member-isolation.md) · [48 Dependency and attribution review](chapters/48-dependency-and-attribution-review.md) · [49 Native installer testing](chapters/49-native-installer-testing.md) · [50 Release acceptance](chapters/50-release-acceptance.md) |

## Reading one mission

Each row has its own objective, implementation plan and observable acceptance criterion. The nearest section supplies its current state, actual source and test files, prerequisites, risk and verification methods. Chapter defaults supply the initial completion evidence, GitHub tracking and status unless the section or a named mission overrides them. An empty dependency list means the mission has no prerequisite ID. Dependency IDs name earlier ledger work whose result the scenario uses. Chapters can run independently once their particular prerequisites are available.

For automated verification, apply the row’s stimulus at the cited seam and assert its acceptance in the indicated suite or runner. For manual verification, use the section’s procedure with that row’s inputs and observe the same criterion through the desktop, fixture artifact, or native package as specified. A new mission may turn an existing unit case into an end-to-end acceptance check. For historical rows, the verification fields describe how to reproduce or inspect the result. The completion-evidence field states which observations the sprint actually recorded.

Use the published fixture launcher, explicit fixture URL, temporary homes and synthetic records for any server or conversation mutation. Browser scenarios use local pages and temporary profiles. Native install scenarios use disposable OS environments. Manual review of synthetic timing, file or trace evidence applies where the behavior has no visible UI. Loopback model benchmarks and approved model comparisons have separate prerequisites from the offline scripted suites. Follow the project's actual launch and UI conventions. [Fixture verification](../../verification/README.md) · [Design](../../../DESIGN.md) · [Offline and optional model evals](../../../evals/README.md)

## Resolve and validate

From the repository root, the read-only [ledger resolver](ledger.mjs) uses Node’s standard library. It needs no package installation, provider credentials, live server or application data.

```sh
node docs/plans/apex-roadmap/ledger.mjs --check
node docs/plans/apex-roadmap/ledger.mjs --show APEX-34-01
node docs/plans/apex-roadmap/ledger.mjs --jsonl
```

The JSONL stream emits every field for every mission, with explicit source paths, dependency IDs, automation method and assertion, manual procedure and observation, completion evidence, tracking and final status. Validation checks all ten programs against the sprint chapter table, the 50 indexed files, 20 ordered IDs per chapter, normalized objective uniqueness, local link targets, repo-relative source paths, earlier-only dependencies, nonempty resolved fields, GitHub reference form and allowed statuses.

Record actual completion evidence separately from the planned check. A completed record cites the artifact or report, the tested revision, the platform or fixture, its observed result and relevant exclusions. Record an issue or PR URL when one exists. **Unfiled** means no fork tracking item is recorded for that mission. A related upstream report supplies context without assigning work there.

Update one mission by adding a bold metadata field beginning with its stable ID anywhere in its chapter. A row override takes precedence over section and chapter fields. For example, `**APEX-34-01 Status** In progress` changes only that mission. Use the same prefix with `Completion evidence` and `GitHub` for receipts and tracking. Keep the IDs when revising wording.

| Status | Required interpretation |
| --- | --- |
| Not started | The defined acceptance work has no recorded start. |
| Blocked | A named prerequisite or external condition prevents the next step. Record it with the evidence. |
| In progress | Work on this specific acceptance is underway and has a traceable intermediate result. |
| Implemented | The deliverable exists at a cited revision. Its verification still has outstanding steps. |
| Verified | Recorded evidence establishes the mission’s exact criterion for the cited revision and environment. |
| Integrated | The verified change also belongs to the named integration branch, with commit or PR evidence. |
| Failed or requires rework | The recorded attempt misses its criterion. Preserve the failing observation and needed change. |
