# Project APEX mission ledger

Project APEX plans **1,000 independently testable missions across 50 release chapters** for the desktop-first OpenMausBot roadmap. The ten programs below follow the release directive. The November 21 sprint supplies the original stable IDs, source baseline and Chapter 1 receipts. Source paths refer to the fork's `feat/ultra-reliability` at `f0bf6f7cd2a85d0e25270be73dd69bef1799ebc1`. Later draft evidence identifies its own revision. [Sprint](../2026-11-21-first-cycle.md) · [Original Chapter 1](../2026-11-21-revision-parity.md) · [OSS baseline](../2026-11-21-oss-baseline.md)

**Thirteen missions are Verified, three are Integrated, one is In progress and 983 are Not started.** The 13 verification-only records establish observations on the tested revisions and machines. The three integrated changes cover notebook provenance, reviewed memory deletion and connection identity. The interrupted-effect recovery mission has new Windows fixture evidence in draft PR #5 and outstanding hard cases. The three remaining audit missions and the 980 missions in release chapters 02–50 still await their APEX acceptance work. [Audit records](chapters/01-revision-parity.md) · [Local answer trials](../2026-11-21-local-answer-trials.csv) · [Notebook reader trials](../2026-11-21-notebook-reader-trials.jsonl) · [Recovery PR #5](https://github.com/JonaWasTaken/Bot-v2/pull/5)

## Desktop-first delivery

1. Close the interrupted desktop journey. Draft #5 recorded the two duplicate-send cases dropping from two receiver calls to one. A read-only operation still resumed. Its ten-scenario Windows run also expired a pending approval and kept the receiver at zero when a fresh retry was denied. Exercise the interval after writing the marker and before transmission, a successful authorized retry of a confirmed unsent action, installed-renderer draft preservation, native failure dialogs and real provider cleanup. The reliability chapter expands the restart work into a three-boundary matrix. [APEX-01-16 evidence](chapters/01-revision-parity.md#interrupted-effect) · [APEX-34-01 matrix](chapters/34-restart-handling.md#supervisor)
2. Put the design system and shell under the normal desktop entry points. Check the same menu, rail, workspace selection and approval affordances at supported zoom settings. Record the native keyboard layout, visible focus and workspace identity through relaunch. [Design system](release-chapters.md#06-design-system) · [Application shell](release-chapters.md#07-application-shell) · [Accessibility](release-chapters.md#10-accessibility)
3. Follow a real composer submission through its first useful answer and terminal state. Reopen the thread and inspect its answer, execution trail and artifacts. Compare latency and quality on matched fixture inputs. [Chat experience](release-chapters.md#08-chat-experience) · [Execution visibility](release-chapters.md#09-execution-visibility) · [First useful answer](chapters/01-revision-parity.md#first-useful-answer)
4. Expand collaboration and autonomy after verifying the individual prerequisites. Compare optional delegation against a blind solo run, reconcile restarted occurrences with durable receipts and carry the measured outcomes into the installed desktop review. [Orchestration](release-chapters.md#26-orchestration) · [Durable tasks](release-chapters.md#33-durable-tasks) · [Final acceptance](release-chapters.md#50-final-acceptance)

## Programs and release chapters

| Program | Release chapters, each with 20 missions |
| --- | --- |
| Architecture and infrastructure | [01 Repository audit](release-chapters.md#01-repository-audit) · [02 Architecture](release-chapters.md#02-architecture) · [03 Build infrastructure](release-chapters.md#03-build-infrastructure) · [04 Storage](release-chapters.md#04-storage) · [05 Developer tooling](release-chapters.md#05-developer-tooling) |
| Desktop experience | [06 Design system](release-chapters.md#06-design-system) · [07 Application shell](release-chapters.md#07-application-shell) · [08 Chat experience](release-chapters.md#08-chat-experience) · [09 Execution visibility](release-chapters.md#09-execution-visibility) · [10 Accessibility](release-chapters.md#10-accessibility) |
| Core intelligence | [11 Models](release-chapters.md#11-models) · [12 Context](release-chapters.md#12-context) · [13 Sessions](release-chapters.md#13-sessions) · [14 Task routing](release-chapters.md#14-task-routing) · [15 Output verification](release-chapters.md#15-output-verification) |
| Advanced memory | [16 Persistence](release-chapters.md#16-persistence) · [17 Formation](release-chapters.md#17-formation) · [18 Retrieval](release-chapters.md#18-retrieval) · [19 Correction](release-chapters.md#19-correction) · [20 Personalization](release-chapters.md#20-personalization) |
| Tools and computer interaction | [21 Execution tools](release-chapters.md#21-execution-tools) · [22 MCP](release-chapters.md#22-mcp) · [23 Research](release-chapters.md#23-research) · [24 Browser](release-chapters.md#24-browser) · [25 Workspace capabilities](release-chapters.md#25-workspace-capabilities) |
| Multi-agent collaboration | [26 Orchestration](release-chapters.md#26-orchestration) · [27 Specialists](release-chapters.md#27-specialists) · [28 Parallelism](release-chapters.md#28-parallelism) · [29 Coding](release-chapters.md#29-coding) · [30 Independent review](release-chapters.md#30-independent-review) |
| Autonomous execution | [31 Scheduling](release-chapters.md#31-scheduling) · [32 Events](release-chapters.md#32-events) · [33 Durable tasks](release-chapters.md#33-durable-tasks) · [34 Proactive assistance](release-chapters.md#34-proactive-assistance) · [35 Governance](release-chapters.md#35-governance) |
| Projects and productivity | [36 Projects](release-chapters.md#36-projects) · [37 Documents](release-chapters.md#37-documents) · [38 Artifacts](release-chapters.md#38-artifacts) · [39 Integrations](release-chapters.md#39-integrations) · [40 Knowledge management](release-chapters.md#40-knowledge-management) |
| Multimodal, performance and reliability | [41 Voice](release-chapters.md#41-voice) · [42 Multimodal](release-chapters.md#42-multimodal) · [43 Performance](release-chapters.md#43-performance) · [44 Efficiency](release-chapters.md#44-efficiency) · [45 Reliability](release-chapters.md#45-reliability) |
| Security, packaging and release | [46 Authorization](release-chapters.md#46-authorization) · [47 Tool security](release-chapters.md#47-tool-security) · [48 Data protection](release-chapters.md#48-data-protection) · [49 Windows packaging](release-chapters.md#49-windows-packaging) · [50 Final acceptance](release-chapters.md#50-final-acceptance) |

The [release chapter map](release-chapters.md) gives the exact membership and presentation order. Each inclusive range points into a Markdown source book. Each source book keeps its original sprint title and each stable mission ID has one editable row. For example, design-system mission `APEX-09-04` lives in source book 09 and appears in release chapter 06. Dependencies use stable IDs and precede their consumers in the full JSONL export. Release chapter order expresses subject and delivery priority. A chapter can proceed once the requisites for its particular rows are satisfied.

## Reading and maintaining a mission

Each row defines a distinct objective, implementation plan and observable acceptance criterion. Its source section supplies current state, repository files, prerequisites, risk level, risk consequence and verification methods. Source book defaults supply status, completion evidence and individual implementation tracking. A field prefixed with a stable ID applies only to that mission and takes precedence over both defaults. A source section can contain overrides for any of its rows. An empty dependency array means the scenario can start without another mission's outcome.

| Risk level | Consequence used to assign it |
| --- | --- |
| Low | Local presentation or reporting defect with a straightforward recovery. |
| Medium | Reversible usability failure, misleading measurement or loss of local progress within one interaction. |
| High | Lost work, materially incorrect execution or evidence, or a major desktop or release failure. |
| Critical | Unauthorized access, confidential disclosure, repeated irreversible effects or unrecoverable data loss. |

Give an individual mission a different level when its consequence warrants it. For example, `APEX-09-04` rates a provider section's spacing Low, while `APEX-43-04` rates a stale result entering another workspace Critical. Each mission exports both `risk_level` and its `risk` narrative.

Automated verification combines the section's runner or test seam with the row's specific stimulus and assertion. Manual verification combines the section's procedure with the scenario and expected observation. Historical rows provide reproduction or inspection steps. Their completion evidence names the actual observation and its limits.

Use the published fixture launcher, explicit fixture URL, temporary homes and synthetic records for server or conversation mutations. Use local pages and disposable profiles for browser work, and a disposable OS for installed-package checks. Use synthetic artifacts for evidence with no visible UI. Optional model comparisons declare their model and endpoint. [Fixture verification](../../verification/README.md) · [Desktop design](../../../DESIGN.md) · [Offline and model evals](../../../evals/README.md)

Every exported record has a typed `planning` reference to the ledger PR. `implementation_tracker` is **Unfiled** until an individual issue or PR tracks the mission. Filed trackers also appear as typed `implementation` links. Typed `related` links give context, including upstream reports. Typed `evidence` links identify a PR that records observations. `completion_evidence` and `evidence_references` carry the actual receipts, such as a pinned fixture report. A planning link only records where the mission was specified. [APEX planning PR #7](https://github.com/JonaWasTaken/Bot-v2/pull/7)

A maintainer can add `**APEX-34-01 Risk level** Critical`, `**APEX-34-01 Risk** <consequence>`, `**APEX-34-01 Status** In progress`, or fields named `Current state`, `Sources`, `Dependencies`, `Automated verification`, `Manual verification`, `Completion evidence`, `GitHub`, `Evidence GitHub` and `Related GitHub` in the same source book. Add the receipt at the tested revision when advancing status. Keep the stable ID when refining the wording or moving a mission between release chapters.

| Status | Interpretation |
| --- | --- |
| Not started | The intended acceptance work has no recorded start. |
| Blocked | A named prerequisite or external condition prevents the next step. Record it alongside the evidence. |
| In progress | Work on this acceptance has a traceable intermediate result and outstanding checks. |
| Implemented | The deliverable exists at a cited revision. Verification has outstanding steps. |
| Verified | Evidence establishes the exact criterion for the cited revision and environment. |
| Integrated | The verified change belongs to the named integration branch, with commit or PR evidence. |
| Failed or requires rework | The recorded attempt misses its criterion. Preserve the outcome and required change. |

## Resolve and validate

Run the [read-only resolver](ledger.mjs) from the repository root with Node's standard library.

```sh
node docs/plans/apex-roadmap/ledger.mjs --check
node docs/plans/apex-roadmap/ledger.mjs --show APEX-21-01
node docs/plans/apex-roadmap/ledger.mjs --show APEX-01-16
node docs/plans/apex-roadmap/ledger.mjs --chapter 29
node docs/plans/apex-roadmap/ledger.mjs --jsonl
```

`--show` resolves one stable ID. `--chapter NN` emits the chapter's twenty records in release order. `--jsonl` emits every record once in dependency-safe stable-ID order. Both exports include the release program, chapter and position. `release_view` links to its current subject, and `chapter_file` locates the editable source book. The checker validates the directive's subject order, the sprint source titles, unique membership and IDs, objectives, plans, acceptance criteria, source paths, dependencies, risk levels, status, link types and required fields.
