# Desktop 6.0 systems and workstreams

The release chapter numbers below refer to the [50-chapter release map](release-chapters.md). Each of its 1,000 stable missions inherits one implementation lead and the product systems its chapter supports. The chapter's source book supplies the individual dependencies, code paths, risks, acceptance criteria and test procedures. A chapter is done when all twenty criteria have verification evidence and the changes pass their integration gates. System coverage expresses scope. Completion is counted from individual mission receipts.

| Code | Workstream | Release chapters |
| --- | --- | --- |
| A | Agent Core | 02, 04, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 39, 40 |
| B | Desktop Product | 06, 07, 08, 09, 10, 36, 37, 38, 41, 42 |
| C | Quality Infrastructure | 01, 03, 05, 15, 30, 43, 44, 45, 46, 47, 48, 49, 50 |

| Code | Product system | Release chapters | Existing implementation boundary | Evidence still needed for the full system |
| --- | --- | --- | --- | --- |
| AI | Adaptive AI brain | 02, 11, 12, 14 | [Admission](../../../server/admission.ts) and [bounded mission planning](../../../server/missions/plan.ts) | Compare ordinary answers, planning and tool admission on matched tasks. |
| MISSION | Mission intelligence | 04, 09, 26, 33, 36 | [Root and step assignments](../../../server/missions/assignments.ts) | Interrupt approved work at each effect boundary and reopen the project. |
| TEAM | Advanced multi-agent teams | 26, 27, 28, 30 | [Assignment coordinator](../../../server/runtime-coordinator.ts) and [Burst routes](../../../server/routes/burst.ts) | Compare solo and specialist runs with equal budgets and blinded grading. |
| MODEL | Intelligent model router | 11, 14, 44 | [Configured instances](../../../server/routes/instances.ts) and [engine registry](../../../server/harness/registry.ts) | Check explicit selections, unavailable providers and fallback quality together. |
| MEM | Advanced personal memory | 16, 17, 18, 19, 20 | [Memory documents](../../../server/memory-store.ts) and [recall](../../../server/recall.ts) | Exercise corrections, deletion and cross-project recall through restart. |
| CTX | Universal context engine | 12, 13, 18, 40 | [Context budgets](../../../server/context-budget.ts) | Check retained constraints, provenance and budget under long conversations. |
| DESKTOP | Desktop computer workspace | 21, 25, 46 | [Computer controls](../../../server/computer-control.ts) | Qualify previews, cancellation and observable outcomes on Windows. |
| BROWSER | Advanced browser workspace | 21, 23, 24 | [Browser service](../../../server/browser/service.ts) | Verify navigation failures and provenance in a permitted multi-page task. |
| RESEARCH | Research intelligence lab | 15, 23, 30, 37 | [Versioned package observations and report checks](../../../server/missions/research.ts) | Evaluate multi-publisher claims, contradictions and API suitability. |
| CODE | Professional coding workspace | 05, 25, 29, 30 | [File checkpoints](../../../server/checkpoints.ts) | Qualify a bounded change through diff, actual test execution and independent review. |
| PROJECT | Project operating system | 04, 13, 36, 40 | [Project and conversation ownership](../../../server/store.ts) and [mission routes](../../../server/routes/missions.ts) | Verify remaining folder lifecycle and project-context isolation cases. |
| ARTIFACT | Artifact studio | 37, 38 | [Attachments](../../../server/attachments.ts) and [message-scoped file access](../../../server/routes/threads.ts) | Qualify editing, revision comparison and export for each supported format. |
| AUTO | Proactive automation engine | 31, 32, 33, 34, 35 | [Routine scheduling](../../../server/routines.ts) | Run scheduled work with the UI closed and confirm one delivered result. |
| FLOW | Visual workflow studio | 21, 26, 31, 33, 35 | [Saved steps](../../../server/saved-steps/saved-steps.ts) and [mission plan dependencies](../../../server/missions/plan.ts) | Author, validate and run a user-owned branching template in the desktop UI. |
| CONNECT | Universal integration hub | 22, 39, 46 | [MCP connections](../../../server/mcp-app-connections.ts) | Qualify credential revocation and tool visibility across agents. |
| SKILL | Skills and extensions platform | 05, 22, 25, 47 | [Skill loader](../../../server/skills.ts) and [desktop controls](../../../src/components/SkillsSection.tsx) | Install, activate, exercise and disable a locally authored skill. |
| UX | Desktop command center | 06, 07, 08, 09, 10 | [Sidebar](../../../src/components/Sidebar.tsx) and [Mission Control](../../../src/components/missions/MissionControl.tsx) | Exercise keyboard, zoom and accessibility on an installed Windows build. |
| VOICE | Voice and multimodal experience | 41, 42 | [Multimodal turn inputs](../../../server/turn-images.test.ts) and [voice-note chat cases](../../../server/voice-notes-chat.e2e.test.ts) | Verify actual supported microphone, transcription and image outcomes on desktop. |
| SEARCH | Unified knowledge and search | 18, 36, 40 | [Scoped recall](../../../server/recall.ts) | Measure precision and isolation across conversations, documents and mission artifacts. |
| VERIFY | Execution verification engine | 09, 15, 30, 38 | [Stored report checks](../../../server/missions/control.ts) and [command receipts](../../../server/commands.ts) | Extend measurable completion contracts beyond public package comparisons. |
| RELIABILITY | Reliability and recovery | 03, 04, 13, 32, 33, 45 | [Durable runtime](../../../server/runtime/runtime.ts) and [existing Windows crash evidence](../apex-001-windows.md) | Qualify more crash boundaries and provider cleanup on the release candidate. |
| PERF | Performance and cost optimizer | 43, 44 | [Runtime read benchmark](../../../scripts/bench-runtime-reads.ts) | Profile matched workloads and record tail latency and resource use. |
| SEC | Security and permission center | 35, 46, 47, 48 | [Request authority](../../../server/request-auth.ts) and [bot tool scopes](../../../shared/tool-scope.ts) | Close the outstanding permission, dependency and release reachability reviews. |
| EVAL | Evaluation and improvement lab | 01, 05, 15, 30, 43, 50 | [Offline and live evaluations](../../../evals/README.md) | Repeat real-model trials and review correctness alongside latency and usage. |
| RELEASE | Production desktop platform | 01, 03, 45, 48, 49, 50 | [Desktop packaging](../../../electron-builder.yml) and [Windows baseline](../apex-001-windows.md) | Install, update, restore and repeat the project mission on the same Windows candidate. |
