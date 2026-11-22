# Project APEX release chapters

The release directive defines ten programs with five chapters each. Every chapter below lists its twenty missions in release order. A range is inclusive and links to the source section containing its editable records. The numbers in stable mission IDs identify their original sprint source book and row. Query a release chapter with `node docs/plans/apex-roadmap/ledger.mjs --chapter NN`. [Ledger and evidence policy](README.md)

For each chapter, the sentence under its heading defines the objective. The linked source sections identify the architecture boundary, current behavior, files, dependencies, risks and test procedures for those twenty scenarios. Each mission exports its current status, evidence and responsible workstream. The [system map](systems.md) identifies the existing components and the next integration exercise for the affected systems.

To close a chapter, verify all twenty acceptance criteria through their intended entry points, record the revision and environment for every result, and integrate the reviewed changes into the named fork branch. For a chapter that handles private data, permissions or effects, include the unauthorized case for that boundary and inspect the actual resulting data or effect. For release chapters, use the installed desktop and the recorded upgrade and recovery inputs.

## Program I · Architecture and infrastructure

### 01 Repository audit

Reproduce the revision, edition, workflow and installed-desktop comparisons recorded in the first sprint. Carry their measured limitations forward.

- `APEX-01-01..APEX-01-20` [Chapter 1 baseline receipts](chapters/01-revision-parity.md)

### 02 Architecture

Preserve driver ownership and event delivery when conversations reconnect, replay a gap or outpace a reader.

- `APEX-02-01..APEX-02-05` [Instance registry](chapters/02-driver-contracts.md#instance-registry)
- `APEX-02-06..APEX-02-10` [Streaming protocol](chapters/02-driver-contracts.md#streaming-protocol)
- `APEX-03-01..APEX-03-05` [Replay window](chapters/03-http-and-sse-event-continuity.md#replay-window)
- `APEX-03-06..APEX-03-10` [Slow readers](chapters/03-http-and-sse-event-continuity.md#slow-readers)

### 03 Build infrastructure

Tie CI lanes and native package inputs to a reproducible desktop artifact, including platform-specific build gates.

- `APEX-50-01..APEX-50-05` [Check matrix](chapters/50-release-acceptance.md#check-matrix)
- `APEX-48-11..APEX-48-15` [Native dependencies](chapters/48-dependency-and-attribution-review.md#native-dependencies)
- `APEX-48-16..APEX-48-20` [Mac architecture](chapters/48-dependency-and-attribution-review.md#mac-architecture)
- `APEX-49-06..APEX-49-10` [Linux package](chapters/49-native-installer-testing.md#linux-package)

### 04 Storage

Keep tasks, thread ownership, registry writes and the settled transcript consistent across concurrent writes and reloads.

- `APEX-04-01..APEX-04-05` [Task records](chapters/04-persisted-task-state.md#task-records)
- `APEX-04-06..APEX-04-10` [Registry commits](chapters/04-persisted-task-state.md#registry-commits)
- `APEX-04-16..APEX-04-20` [Thread tenancy](chapters/04-persisted-task-state.md#thread-tenancy)
- `APEX-23-16..APEX-23-20` [Settled content](chapters/23-workspace-file-changes.md#settled-content)

### 05 Developer tooling

Make the fixture launcher, scripted provider, control surface and frozen receipts repeatable on a clean checkout.

- `APEX-05-01..APEX-05-05` [Launcher](chapters/05-fixture-reproducibility.md#launcher)
- `APEX-05-06..APEX-05-10` [Scripted provider](chapters/05-fixture-reproducibility.md#scripted-provider)
- `APEX-05-11..APEX-05-15` [Control surface](chapters/05-fixture-reproducibility.md#control-surface)
- `APEX-05-16..APEX-05-20` [Frozen evidence](chapters/05-fixture-reproducibility.md#frozen-evidence)

## Program II · Desktop experience

### 06 Design system

Apply the documented type scale, semantic colors, frame insets and disclosure states to real desktop controls.

- `APEX-09-01..APEX-09-05` [Menu surfaces and type scale](chapters/09-model-selection.md#menu-surfaces-and-type-scale)
- `APEX-09-16..APEX-09-20` [Theme palette and state colors](chapters/09-model-selection.md#theme-palette-and-state-colors)
- `APEX-08-16..APEX-08-20` [Frame geometry and rail states](chapters/08-workspace-connection.md#frame-geometry-and-rail-states)
- `APEX-07-11..APEX-07-15` [Disclosure and settings primitives](chapters/07-conversation-navigation.md#disclosure-and-settings-primitives)

### 07 Application shell

Switch threads and workspaces through the sidebar and connection sheet while preserving navigation and target identity.

- `APEX-07-01..APEX-07-05` [Thread routing](chapters/07-conversation-navigation.md#thread-routing)
- `APEX-07-06..APEX-07-10` [Sidebar selection](chapters/07-conversation-navigation.md#sidebar-selection)
- `APEX-08-01..APEX-08-05` [Probe identity](chapters/08-workspace-connection.md#probe-identity)
- `APEX-08-06..APEX-08-10` [Saved places](chapters/08-workspace-connection.md#saved-places)

### 08 Chat experience

Preserve the user's draft, attachments, reading position and streamed answer through normal composer entry points.

- `APEX-06-01..APEX-06-05` [Composition](chapters/06-composer-and-stream.md#composition)
- `APEX-06-06..APEX-06-10` [Draft commands](chapters/06-composer-and-stream.md#draft-commands)
- `APEX-06-11..APEX-06-15` [Rich stream](chapters/06-composer-and-stream.md#rich-stream)
- `APEX-06-16..APEX-06-20` [Reading position](chapters/06-composer-and-stream.md#reading-position)

### 09 Execution visibility

Expose which goal, handoff or scheduled run is active and where the user can inspect its outcome.

- `APEX-27-11..APEX-27-15` [Working status](chapters/27-dependency-ordering.md#working-status)
- `APEX-12-16..APEX-12-20` [Goal card](chapters/12-planning-thresholds.md#goal-card)
- `APEX-35-06..APEX-35-10` [Run card](chapters/35-history-and-result-delivery.md#run-card)
- `APEX-30-06..APEX-30-10` [Sent work](chapters/30-result-verification.md#sent-work)

### 10 Accessibility

Exercise native shortcuts, localized help, focus restoration and screen-reader announcements in the desktop shell.

- `APEX-10-01..APEX-10-05` [Native shortcuts](chapters/10-keyboard-and-accessibility.md#native-shortcuts)
- `APEX-10-06..APEX-10-10` [Shortcut labels](chapters/10-keyboard-and-accessibility.md#shortcut-labels)
- `APEX-10-11..APEX-10-15` [Shortcut discovery](chapters/10-keyboard-and-accessibility.md#shortcut-discovery)
- `APEX-10-16..APEX-10-20` [Screen reader](chapters/10-keyboard-and-accessibility.md#screen-reader)

## Program III · Core intelligence

### 11 Models

Select a model and its reasoning level against the account, context window and active turn that will actually use it.

- `APEX-11-11..APEX-11-15` [Window selection](chapters/11-intent-and-model-policy.md#window-selection)
- `APEX-11-16..APEX-11-20` [Checker selection](chapters/11-intent-and-model-policy.md#checker-selection)
- `APEX-09-06..APEX-09-10` [Mid-turn switch](chapters/09-model-selection.md#mid-turn-switch)
- `APEX-09-11..APEX-09-15` [Reasoning choice](chapters/09-model-selection.md#reasoning-choice)

### 12 Context

Account for tokens and cost, compact histories and reconstruct an engine session with its required context.

- `APEX-13-01..APEX-13-05` [Token accounting](chapters/13-context-allocation.md#token-accounting)
- `APEX-13-06..APEX-13-10` [Compaction](chapters/13-context-allocation.md#compaction)
- `APEX-13-11..APEX-13-15` [Session rebuild](chapters/13-context-allocation.md#session-rebuild)
- `APEX-13-16..APEX-13-20` [Cost breakdown](chapters/13-context-allocation.md#cost-breakdown)

### 13 Sessions

Retain ownership, tool history and the intended thread when leases expire or a session resumes.

- `APEX-02-11..APEX-02-15` [Session leases](chapters/02-driver-contracts.md#session-leases)
- `APEX-03-16..APEX-03-20` [Tool history](chapters/03-http-and-sse-event-continuity.md#tool-history)
- `APEX-29-06..APEX-29-10` [Resume policy](chapters/29-cancellation-and-recovery.md#resume-policy)
- `APEX-34-11..APEX-34-15` [Recovery selection](chapters/34-restart-handling.md#recovery-selection)

### 14 Task routing

Choose the direct, delegated or goal-driven turn path and keep the selected task bound to the requesting turn.

- `APEX-11-01..APEX-11-05` [Turn classification](chapters/11-intent-and-model-policy.md#turn-classification)
- `APEX-11-06..APEX-11-10` [Routing labels](chapters/11-intent-and-model-policy.md#routing-labels)
- `APEX-12-01..APEX-12-05` [Goal contract](chapters/12-planning-thresholds.md#goal-contract)
- `APEX-12-06..APEX-12-10` [One-to-one goals](chapters/12-planning-thresholds.md#one-to-one-goals)

### 15 Output verification

Check late tool outcomes, user-visible effects and answer quality against independent observations and calibrated judgments.

- `APEX-14-11..APEX-14-15` [Late results](chapters/14-action-verification.md#late-results)
- `APEX-14-16..APEX-14-20` [Visible effects](chapters/14-action-verification.md#visible-effects)
- `APEX-15-01..APEX-15-05` [Answer trials](chapters/15-controlled-comparisons.md#answer-trials)
- `APEX-15-11..APEX-15-15` [Judge calibration](chapters/15-controlled-comparisons.md#judge-calibration)

## Program IV · Advanced memory

### 16 Persistence

Recover notebook bytes, retention metadata and project instruction mirrors after a write, move or maintenance pass.

- `APEX-20-01..APEX-20-05` [Notebook storage](chapters/20-retention-and-inspection.md#notebook-storage)
- `APEX-20-06..APEX-20-10` [Upkeep cadence](chapters/20-retention-and-inspection.md#upkeep-cadence)
- `APEX-20-11..APEX-20-15` [Note relocation](chapters/20-retention-and-inspection.md#note-relocation)
- `APEX-37-01..APEX-37-05` [Bot folder](chapters/37-project-knowledge.md#bot-folder)

### 17 Formation

Form notes from allowed conversations and room turns, preserve provenance and honor capture settings.

- `APEX-16-01..APEX-16-05` [Capture boundary](chapters/16-durable-formation-and-consent.md#capture-boundary)
- `APEX-16-06..APEX-16-10` [Nightly synthesis](chapters/16-durable-formation-and-consent.md#nightly-synthesis)
- `APEX-16-11..APEX-16-15` [Fact filter](chapters/16-durable-formation-and-consent.md#fact-filter)
- `APEX-16-16..APEX-16-20` [Room capture](chapters/16-durable-formation-and-consent.md#room-capture)

### 18 Retrieval

Select the right authorized topics, disclose their source and measure what an independent reader can recover.

- `APEX-18-01..APEX-18-05` [Match selection](chapters/18-retrieval-evaluation.md#match-selection)
- `APEX-18-06..APEX-18-10` [Recall disclosure](chapters/18-retrieval-evaluation.md#recall-disclosure)
- `APEX-18-11..APEX-18-15` [Topic revisions](chapters/18-retrieval-evaluation.md#topic-revisions)
- `APEX-18-16..APEX-18-20` [Independent reader](chapters/18-retrieval-evaluation.md#independent-reader)

### 19 Correction

Correct or forget the reviewed entries and preserve concurrent edits and journal history.

- `APEX-19-01..APEX-19-05` [Forget matching](chapters/19-corrections-and-forgetting.md#forget-matching)
- `APEX-19-06..APEX-19-10` [Entry correction](chapters/19-corrections-and-forgetting.md#entry-correction)
- `APEX-19-11..APEX-19-15` [Journal undo](chapters/19-corrections-and-forgetting.md#journal-undo)
- `APEX-19-16..APEX-19-20` [Reviewed deletes](chapters/19-corrections-and-forgetting.md#reviewed-deletes)

### 20 Personalization

Apply the requesting member's preferences and controls without borrowing another member's private context.

- `APEX-17-11..APEX-17-15` [Layered recall](chapters/17-notebook-boundaries.md#layered-recall)
- `APEX-17-16..APEX-17-20` [Personal context on borrowed environments](chapters/17-notebook-boundaries.md#personal-context-on-borrowed-environments)
- `APEX-20-16..APEX-20-20` [Member inspection](chapters/20-retention-and-inspection.md#member-inspection)
- `APEX-15-06..APEX-15-10` [Personalized answers and controls](chapters/15-controlled-comparisons.md#personalized-answers-and-controls)

## Program V · Tools and computer interaction

### 21 Execution tools

Exercise approval callbacks, tool result persistence and confirmed external effects through real execution seams.

- `APEX-21-01..APEX-21-05` [Permission broker](chapters/21-capability-grants.md#permission-broker)
- `APEX-14-06..APEX-14-10` [Tool result storage](chapters/14-action-verification.md#tool-result-storage)
- `APEX-21-16..APEX-21-20` [Cloud actions](chapters/21-capability-grants.md#cloud-actions)
- `APEX-25-16..APEX-25-20` [Tool result wire](chapters/25-tool-interoperability.md#tool-result-wire)

### 22 MCP

Discover MCP servers, complete their handshake, validate arguments and apply each connection's grants.

- `APEX-25-01..APEX-25-05` [Server health](chapters/25-tool-interoperability.md#server-health)
- `APEX-25-06..APEX-25-10` [Handshake](chapters/25-tool-interoperability.md#handshake)
- `APEX-25-11..APEX-25-15` [Argument schemas](chapters/25-tool-interoperability.md#argument-schemas)
- `APEX-21-06..APEX-21-10` [MCP grants](chapters/21-capability-grants.md#mcp-grants)

### 23 Research

Acquire bounded sources, reconcile citations with the returned evidence and account for refusals, cost and missing results.

- `APEX-07-16..APEX-07-20` [Evidence selection and citation navigation](chapters/07-conversation-navigation.md#evidence-selection-and-citation-navigation)
- `APEX-22-06..APEX-22-10` [Source acquisition and pagination](chapters/22-browser-action-confirmation.md#source-acquisition-and-pagination)
- `APEX-26-06..APEX-26-10` [Research costs and evidence yields](chapters/26-delegation-economics.md#research-costs-and-evidence-yields)
- `APEX-02-16..APEX-02-20` [Research catalogs and provider refusals](chapters/02-driver-contracts.md#research-catalogs-and-provider-refusals)

### 24 Browser

Exercise tab navigation, DOM actions, live input and downloaded files using disposable browser fixtures.

- `APEX-22-01..APEX-22-05` [DOM actions](chapters/22-browser-action-confirmation.md#dom-actions)
- `APEX-46-16..APEX-46-20` [Browser tab navigation and recovery](chapters/46-electron-boundaries.md#browser-tab-navigation-and-recovery)
- `APEX-22-11..APEX-22-15` [Live input](chapters/22-browser-action-confirmation.md#live-input)
- `APEX-22-16..APEX-22-20` [Downloads](chapters/22-browser-action-confirmation.md#downloads)

### 25 Workspace capabilities

Apply workspace file changes and uploads and lease a shared computer to the correct task and member.

- `APEX-23-01..APEX-23-05` [Host file operations](chapters/23-workspace-file-changes.md#host-file-operations)
- `APEX-23-06..APEX-23-10` [Team uploads](chapters/23-workspace-file-changes.md#team-uploads)
- `APEX-24-01..APEX-24-05` [Lazy claims](chapters/24-computer-ownership.md#lazy-claims)
- `APEX-24-06..APEX-24-10` [VM leases](chapters/24-computer-ownership.md#vm-leases)

## Program VI · Multi-agent collaboration

### 26 Orchestration

Order handoffs, wait for required children and bound fan-out and handoff loops.

- `APEX-27-01..APEX-27-05` [Dispatch queue](chapters/27-dependency-ordering.md#dispatch-queue)
- `APEX-12-11..APEX-12-15` [Waiting decisions](chapters/12-planning-thresholds.md#waiting-decisions)
- `APEX-27-16..APEX-27-20` [Mutual handoffs](chapters/27-dependency-ordering.md#mutual-handoffs)
- `APEX-26-11..APEX-26-15` [Fan-out limits](chapters/26-delegation-economics.md#fan-out-limits)

### 27 Specialists

Assign work by specialist capability, inherited permission, measured skill and an explicit fallback.

- `APEX-26-01..APEX-26-05` [Specialist profiles and assignment](chapters/26-delegation-economics.md#specialist-profiles-and-assignment)
- `APEX-28-01..APEX-28-05` [Effective level](chapters/28-child-permissions.md#effective-level)
- `APEX-15-16..APEX-15-20` [Specialist skill evaluation](chapters/15-controlled-comparisons.md#specialist-skill-evaluation)
- `APEX-28-16..APEX-28-20` [Unavailable specialists and fallback](chapters/28-child-permissions.md#unavailable-specialists-and-fallback)

### 28 Parallelism

Dispatch independent children concurrently and preserve results and cancellation across interruptions.

- `APEX-27-06..APEX-27-10` [Concurrent handoff inputs](chapters/27-dependency-ordering.md#concurrent-handoff-inputs)
- `APEX-29-01..APEX-29-05` [Interrupted child](chapters/29-cancellation-and-recovery.md#interrupted-child)
- `APEX-29-11..APEX-29-15` [Parallel dispatch pacing](chapters/29-cancellation-and-recovery.md#parallel-dispatch-pacing)
- `APEX-29-16..APEX-29-20` [Parallel work across suspend and resume](chapters/29-cancellation-and-recovery.md#parallel-work-across-suspend-and-resume)

### 29 Coding

Carry scoped source and reviewed diffs into coding assignments and verify the resulting patch, UI or evaluation.

- `APEX-04-11..APEX-04-15` [Code checkpoints and scoped diffs](chapters/04-persisted-task-state.md#code-checkpoints-and-scoped-diffs)
- `APEX-28-06..APEX-28-10` [Coding assignments and source bundles](chapters/28-child-permissions.md#coding-assignments-and-source-bundles)
- `APEX-28-11..APEX-28-15` [Frontend coding acceptance](chapters/28-child-permissions.md#frontend-coding-acceptance)
- `APEX-30-16..APEX-30-20` [Coding evaluation and reproducible tests](chapters/30-result-verification.md#coding-evaluation-and-reproducible-tests)

### 30 Independent review

Give an independent reviewer the accepted task, actual artifact, scoped authority and inspectable verdict.

- `APEX-30-01..APEX-30-05` [Checker brief](chapters/30-result-verification.md#checker-brief)
- `APEX-30-11..APEX-30-15` [Independent artifact verdicts](chapters/30-result-verification.md#independent-artifact-verdicts)
- `APEX-26-16..APEX-26-20` [Independent review traces](chapters/26-delegation-economics.md#independent-review-traces)
- `APEX-38-11..APEX-38-15` [Peer reviewer authority](chapters/38-artifact-provenance.md#peer-reviewer-authority)

## Program VII · Autonomous execution

### 31 Scheduling

Compute due occurrences across time zones, discard stale schedules and recover the right schedule after restart.

- `APEX-31-01..APEX-31-05` [Cron expression](chapters/31-trigger-and-timezone-semantics.md#cron-expression)
- `APEX-31-06..APEX-31-10` [Due computation](chapters/31-trigger-and-timezone-semantics.md#due-computation)
- `APEX-31-11..APEX-31-15` [Catch-up](chapters/31-trigger-and-timezone-semantics.md#catch-up)
- `APEX-34-16..APEX-34-20` [Restart delivery](chapters/34-restart-handling.md#restart-delivery)

### 32 Events

Tie incoming events and renderer subscriptions to the accepted run while preserving delivery order and idempotency.

- `APEX-32-01..APEX-32-05` [Event receipts](chapters/32-receipts-and-idempotency.md#event-receipts)
- `APEX-32-06..APEX-32-10` [Conversation send](chapters/32-receipts-and-idempotency.md#conversation-send)
- `APEX-35-16..APEX-35-20` [Run updates](chapters/35-history-and-result-delivery.md#run-updates)
- `APEX-03-11..APEX-03-15` [Renderer subscription](chapters/03-http-and-sse-event-continuity.md#renderer-subscription)

### 33 Durable tasks

Recover saved runs and occurrences and reconcile their durable history after partial writes and restarts.

- `APEX-32-11..APEX-32-15` [Run ledger](chapters/32-receipts-and-idempotency.md#run-ledger)
- `APEX-32-16..APEX-32-20` [Save faults](chapters/32-receipts-and-idempotency.md#save-faults)
- `APEX-34-06..APEX-34-10` [Interrupted occurrence](chapters/34-restart-handling.md#interrupted-occurrence)
- `APEX-35-01..APEX-35-05` [History query](chapters/35-history-and-result-delivery.md#history-query)

### 34 Proactive assistance

Surface actionable changes, missed work and routine results to the right person at a useful time.

- `APEX-40-06..APEX-40-10` [Routine health](chapters/40-health-summaries.md#routine-health)
- `APEX-40-01..APEX-40-05` [Actionable daily assistance](chapters/40-health-summaries.md#actionable-daily-assistance)
- `APEX-35-11..APEX-35-15` [Outcome delivery](chapters/35-history-and-result-delivery.md#outcome-delivery)
- `APEX-40-16..APEX-40-20` [Anticipating missed work](chapters/40-health-summaries.md#anticipating-missed-work)

### 35 Governance

Apply unattended approval, access levels and unanswered-question policy before any consequential action.

- `APEX-33-01..APEX-33-05` [Unattended turns](chapters/33-unattended-approval.md#unattended-turns)
- `APEX-33-06..APEX-33-10` [Approval handling](chapters/33-unattended-approval.md#approval-handling)
- `APEX-33-11..APEX-33-15` [Cloud access level](chapters/33-unattended-approval.md#cloud-access-level)
- `APEX-33-16..APEX-33-20` [Unanswered questions](chapters/33-unattended-approval.md#unanswered-questions)

## Program VIII · Projects and productivity

### 36 Projects

Keep project folders, conversations and ownership coherent as members join, share work and depart.

- `APEX-36-01..APEX-36-05` [Project folders and member access](chapters/36-workspace-membership.md#project-folders-and-member-access)
- `APEX-36-06..APEX-36-10` [Shared conversations](chapters/36-workspace-membership.md#shared-conversations)
- `APEX-36-11..APEX-36-15` [Departing member](chapters/36-workspace-membership.md#departing-member)
- `APEX-36-16..APEX-36-20` [Owner rights](chapters/36-workspace-membership.md#owner-rights)

### 37 Documents

Read, revise, transfer and export project documents and transcripts while preserving original bytes and provenance.

- `APEX-23-11..APEX-23-15` [Message files](chapters/23-workspace-file-changes.md#message-files)
- `APEX-37-16..APEX-37-20` [Project document reading and revisions](chapters/37-project-knowledge.md#project-document-reading-and-revisions)
- `APEX-41-01..APEX-41-05` [Originals](chapters/41-file-and-image-fidelity.md#originals)
- `APEX-44-16..APEX-44-20` [Transcript export](chapters/44-large-transcripts.md#transcript-export)

### 38 Artifacts

Bind an artifact's bytes, origin and action receipt to the execution and message that produced it.

- `APEX-38-01..APEX-38-05` [Attachment lineage](chapters/38-artifact-provenance.md#attachment-lineage)
- `APEX-38-06..APEX-38-10` [Page bytes](chapters/38-artifact-provenance.md#page-bytes)
- `APEX-38-16..APEX-38-20` [Origin labels](chapters/38-artifact-provenance.md#origin-labels)
- `APEX-14-01..APEX-14-05` [Action receipts](chapters/14-action-verification.md#action-receipts)

### 39 Integrations

Reconcile connector health, file transfers and calendar or mail checks with the selected account and returned receipt.

- `APEX-40-11..APEX-40-15` [Connection health](chapters/40-health-summaries.md#connection-health)
- `APEX-39-01..APEX-39-05` [Connector file transfer receipts](chapters/39-reviewed-workflows.md#connector-file-transfer-receipts)
- `APEX-39-11..APEX-39-15` [Connected calendars and mail contracts](chapters/39-reviewed-workflows.md#connected-calendars-and-mail-contracts)
- `APEX-31-16..APEX-31-20` [Connected checks](chapters/31-trigger-and-timezone-semantics.md#connected-checks)

### 40 Knowledge management

Maintain team knowledge, project sources and reviewed workflows as documents change or access is withdrawn.

- `APEX-39-16..APEX-39-20` [Stored workflow](chapters/39-reviewed-workflows.md#stored-workflow)
- `APEX-37-06..APEX-37-10` [Project knowledge sources](chapters/37-project-knowledge.md#project-knowledge-sources)
- `APEX-37-11..APEX-37-15` [Project notes](chapters/37-project-knowledge.md#project-notes)
- `APEX-17-06..APEX-17-10` [Team notebook](chapters/17-notebook-boundaries.md#team-notebook)

## Program IX · Multimodal, performance and reliability

### 41 Voice

Preserve the intended recording, transcription, playback stream and voice note as the user switches context.

- `APEX-42-01..APEX-42-05` [Voice draft](chapters/42-voice-interaction.md#voice-draft)
- `APEX-42-06..APEX-42-10` [Transcription](chapters/42-voice-interaction.md#transcription)
- `APEX-42-11..APEX-42-15` [Playback stream](chapters/42-voice-interaction.md#playback-stream)
- `APEX-42-16..APEX-42-20` [Voice notes](chapters/42-voice-interaction.md#voice-notes)

### 42 Multimodal

Carry text, image, screen and file inputs from the composer into the correct driver with observable evidence.

- `APEX-41-06..APEX-41-10` [Conversation media](chapters/41-file-and-image-fidelity.md#conversation-media)
- `APEX-41-11..APEX-41-15` [Driver images](chapters/41-file-and-image-fidelity.md#driver-images)
- `APEX-41-16..APEX-41-20` [Composer attachments](chapters/41-file-and-image-fidelity.md#composer-attachments)
- `APEX-39-06..APEX-39-10` [Text, image and screen evidence](chapters/39-reviewed-workflows.md#text-image-and-screen-evidence)

### 43 Performance

Measure startup and navigation with pinned inputs, visible milestones and a reproducible desktop benchmark.

- `APEX-43-01..APEX-43-05` [Head start](chapters/43-startup-and-navigation.md#head-start)
- `APEX-43-06..APEX-43-10` [Launch markers](chapters/43-startup-and-navigation.md#launch-markers)
- `APEX-43-11..APEX-43-15` [Catalog boot](chapters/43-startup-and-navigation.md#catalog-boot)
- `APEX-43-16..APEX-43-20` [Desktop benchmark](chapters/43-startup-and-navigation.md#desktop-benchmark)

### 44 Efficiency

Limit rendering and process-sampling work while preserving transcript content, selections and usage attribution.

- `APEX-44-01..APEX-44-05` [Transcript window](chapters/44-large-transcripts.md#transcript-window)
- `APEX-44-06..APEX-44-10` [Derived rows](chapters/44-large-transcripts.md#derived-rows)
- `APEX-44-11..APEX-44-15` [Selection](chapters/44-large-transcripts.md#selection)
- `APEX-45-01..APEX-45-05` [Process sampler](chapters/45-sustained-process-profiling.md#process-sampler)

### 45 Reliability

Bound crash recovery and diagnose event-loop stalls and resource pressure throughout a desktop soak.

- `APEX-34-01..APEX-34-05` [Supervisor](chapters/34-restart-handling.md#supervisor)
- `APEX-45-06..APEX-45-10` [Event loop](chapters/45-sustained-process-profiling.md#event-loop)
- `APEX-45-11..APEX-45-15` [Stall watchdog](chapters/45-sustained-process-profiling.md#stall-watchdog)
- `APEX-45-16..APEX-45-20` [Engine pressure](chapters/45-sustained-process-profiling.md#engine-pressure)

## Program X · Security, packaging and release

### 46 Authorization

Authorize the exact member, audience, lent session and renderer origin for a requested operation.

- `APEX-17-01..APEX-17-05` [Audience selection](chapters/17-notebook-boundaries.md#audience-selection)
- `APEX-47-11..APEX-47-15` [Request identity](chapters/47-credential-and-member-isolation.md#request-identity)
- `APEX-24-16..APEX-24-20` [Lent sessions](chapters/24-computer-ownership.md#lent-sessions)
- `APEX-46-11..APEX-46-15` [Origin recognition](chapters/46-electron-boundaries.md#origin-recognition)

### 47 Tool security

Constrain native, embedded, shell and computer-tool capability requests at their owning boundary.

- `APEX-21-11..APEX-21-15` [Command grants](chapters/21-capability-grants.md#command-grants)
- `APEX-46-01..APEX-46-05` [Preload tool capability contracts](chapters/46-electron-boundaries.md#preload-tool-capability-contracts)
- `APEX-46-06..APEX-46-10` [Tool authority in embedded pages](chapters/46-electron-boundaries.md#tool-authority-in-embedded-pages)
- `APEX-24-11..APEX-24-15` [Computer asks](chapters/24-computer-ownership.md#computer-asks)

### 48 Data protection

Protect stored credentials, connection secrets and per-member data through inspection, replacement and cleanup.

- `APEX-47-01..APEX-47-05` [Desktop vault](chapters/47-credential-and-member-isolation.md#desktop-vault)
- `APEX-47-06..APEX-47-10` [Credential state](chapters/47-credential-and-member-isolation.md#credential-state)
- `APEX-47-16..APEX-47-20` [Member secrets](chapters/47-credential-and-member-isolation.md#member-secrets)
- `APEX-08-11..APEX-08-15` [Connection secrets](chapters/08-workspace-connection.md#connection-secrets)

### 49 Windows packaging

Install, run, update, repair and remove a Windows candidate using its own packaged server, browser and fixture profile.

- `APEX-49-01..APEX-49-05` [Windows installer](chapters/49-native-installer-testing.md#windows-installer)
- `APEX-48-06..APEX-48-10` [Windows browser bundle](chapters/48-dependency-and-attribution-review.md#windows-browser-bundle)
- `APEX-50-06..APEX-50-10` [Windows packaged backend isolation](chapters/50-release-acceptance.md#windows-packaged-backend-isolation)
- `APEX-49-16..APEX-49-20` [Windows update and repair handoff](chapters/49-native-installer-testing.md#windows-update-and-repair-handoff)

### 50 Final acceptance

Reconcile platform sign-off, third-party notices, release notes and outstanding blockers against one candidate revision.

- `APEX-49-11..APEX-49-15` [Mac package](chapters/49-native-installer-testing.md#mac-package)
- `APEX-48-01..APEX-48-05` [CUA notices](chapters/48-dependency-and-attribution-review.md#cua-notices)
- `APEX-50-11..APEX-50-15` [Promotion decision](chapters/50-release-acceptance.md#promotion-decision)
- `APEX-50-16..APEX-50-20` [Release notes](chapters/50-release-acceptance.md#release-notes)
