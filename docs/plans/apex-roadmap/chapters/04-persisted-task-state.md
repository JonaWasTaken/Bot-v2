# 04 · Persisted task state

[Project APEX ledger](../README.md) · Architecture and infrastructure

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Task records

**Current state** Task creation derives a title and resolves a thread's approval level against bot defaults and uncommitted grants. Existing case “starts at the default Full access on a bot nobody set a level on, while the open chat's grant is pending”.

**Sources** [server/task-record.ts](../../../../server/task-record.ts) · [server/task-record.test.ts](../../../../server/task-record.test.ts) · [shared/approval-mode.ts](../../../../shared/approval-mode.ts)

**Dependencies** APEX-01-03

**Risk** A default copied at the wrong time can elevate a newly created thread.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/task-record.test.ts`.

**Manual verification** Create two fixture chats, restart only the fixture and compare their stored and displayed levels.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-04-01 | Retain an explicit Ask level on thread creation | Create an Ask thread on a Full access bot and reopen it. | Both disk and the reopened chat report Ask. |
| APEX-04-02 | Keep an uncommitted grant out of a restored thread | Interrupt a fixture save between grant review and task creation. | The restored task uses the last committed permission level. |
| APEX-04-03 | Derive titles deterministically for multiline input | Seed leading whitespace, an emoji and a blank first paragraph. | Two reloads produce the same bounded visible title without a split character. |
| APEX-04-04 | Preserve a person's renamed title through later messages | Rename an untitled task before the first assistant reply. | All later title derivations leave the chosen title intact. |
| APEX-04-05 | Keep thread creation identifiers unique under a burst | Create 25 named tasks for one fixture bot before its list refresh. | All 25 stored IDs reopen their own title and message history. |

## Registry commits

**Current state** Registry changes distinguish committed, deferred and failed saves, including rollback of visible thread metadata. Existing case “keeps the selected thread, its session and its pin when a switch cannot be saved”.

**Sources** [server/registry-save.ts](../../../../server/registry-save.ts) · [server/registry-save.test.ts](../../../../server/registry-save.test.ts)

**Dependencies** APEX-01-03

**Risk** Partial registry saves can desynchronize the UI, permissions and disk.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/registry-save.test.ts`.

**Manual verification** Trigger the named save fault with the fixture store and inspect the old and reopened state.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-04-06 | Roll back unread state on a failed thread edit | Mark a thread read during an edit whose commit fails. | Both thread metadata and unread count match the last successful snapshot. |
| APEX-04-07 | Keep active selection on failed pin-and-switch | Select a pinned sibling while the next registry commit is refused. | Reload restores the original selected ID and both original pin values. |
| APEX-04-08 | Preserve a stricter live grant after save failure | Revoke a grant under a synthetic write fault and perform a gated operation. | The current process refuses the operation and displays the persistence failure. |
| APEX-04-09 | Coalesce harmless edits without losing the final value | Burst ten display-name updates and hold the deferred save. | One flushed record holds the tenth name after restart. |
| APEX-04-10 | Return a recoverable receipt for failed creation | Make the first registry save fail and resubmit the same create interaction. | One task appears after the successful retry and no ghost appears before it. |

## Restore points

**Current state** Workspace checkpoints track usable revisions and throttle collection of obsolete data. Existing case “cancels optional digest capture without disabling later checkpoints”.

**Sources** [server/checkpoints.ts](../../../../server/checkpoints.ts) · [server/checkpoints.test.ts](../../../../server/checkpoints.test.ts)

**Dependencies** APEX-01-03

**Risk** A restore point can capture the wrong directory or displace the last usable snapshot.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/checkpoints.test.ts`.

**Manual verification** Compare fixture checkpoint trees and worktree contents before and after each transition.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-04-11 | Preserve the preceding checkpoint when capture aborts | Interrupt optional digest collection midway through a changed fixture directory. | The last completed checkpoint remains readable and the next capture succeeds. |
| APEX-04-12 | Deduplicate checkpoints for a no-op turn | Run five text-only turns against identical workspace bytes. | The usable checkpoint count and tree ID remain constant. |
| APEX-04-13 | Bound checkpoint garbage collection during active work | Cross the GC interval while holding a settled diff reader open. | The diff reads completely and obsolete content is reclaimed after that read. |
| APEX-04-14 | Restore both renamed and edited files as one change | Rename a fixture document and edit its body after snapshotting. | Restore reproduces the original path and hash and removes the renamed path. |
| APEX-04-15 | Report a refused checkpoint visibly | Select a fixture folder the checkpoint implementation refuses. | The refusal includes a reason and zero unusable restore points enter the list. |

## Thread tenancy

**Current state** The store reads old task state and persists selections, grants, history and provider cursors independently for each task.

**Sources** [server/store.ts](../../../../server/store.ts) · [server/independent-task-store.test.ts](../../../../server/independent-task-store.test.ts) · [server/task-record.ts](../../../../server/task-record.ts)

**Dependencies** APEX-01-03

**Risk** A bot-wide action can overwrite independent histories, cursors or archived preferences.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/independent-task-store.test.ts`.

**Manual verification** Open the fixture bot's active and archived chats after reloading its store.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-04-16 | Preserve archived model selection in a bulk level change | Apply one bot-wide level to active and archived fixture threads. | Archived model ID, resume cursor and archived timestamp all match their originals. |
| APEX-04-17 | Refresh just one thread from bot defaults | Change the bot's defaults then refresh the middle of three tasks. | Only that task's effective grant and inheritance flag change. |
| APEX-04-18 | Migrate a legacy task without dropping its main chat | Load one pre-thread registry record beside a modern task. | Both reopen with their own histories and saving twice produces equivalent state. |
| APEX-04-19 | Keep an inactive sibling's resume cursor during writes | Append alternating model replies to two tasks then restart. | Each resumes with the provider cursor attached to its own last reply. |
| APEX-04-20 | Remove one archived task without retargeting another | Archive two named threads, remove the first and reopen the second. | The second ID, messages and selected model are identical before and after removal. |
