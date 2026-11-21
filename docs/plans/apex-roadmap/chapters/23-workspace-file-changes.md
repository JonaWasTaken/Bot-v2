# 23 · Workspace file changes

[Project APEX ledger](../README.md) · Tools and computer interaction

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Host file operations

**Current state** Host file tools advertise explicit read/write limits and share the computer approval path. Existing case “lists them beside the screen tools, asks the approval gate, and saves on any full path”.

**Sources** [server/host-file-tools.ts](../../../../server/host-file-tools.ts) · [server/host-files.e2e.test.ts](../../../../server/host-files.e2e.test.ts) · [server/host-files.test.ts](../../../../server/host-files.test.ts)

**Dependencies** APEX-01-04

**Risk** A write outside the intended fixture or a false success destroys confidence in file operations.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host-files.e2e.test.ts`.

**Manual verification** Use only explicitly created temporary files and compare before/after bytes with the host-tool receipt.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-23-01 | Honor approval for an ordinary workspace write | Save reviewed fixture text to a new document through the normal host file tool. | One file has the requested bytes and the approval precedes the write. |
| APEX-23-02 | Report a write refused by the workspace filesystem | Mark the synthetic target unwritable and attempt one approved save. | The error names the failed operation and the original bytes remain. |
| APEX-23-03 | Respect the host reader's byte ceiling | Read a fixture document one byte above the published reader limit. | The receipt gives the documented bounded result and reports the limit explicitly. |
| APEX-23-04 | Keep identical basenames distinct across folders | Read two fixture notes named agenda.md from different absolute folders. | Each returned body matches its chosen path. |
| APEX-23-05 | Keep unavailable host tools out of turn memory | Start the fake driver with a bridge missing host-file capabilities. | Neither the advertised list nor the following turn claims those capabilities. |

## Team uploads

**Current state** Team files store uploader identity, ownership, relative paths and byte limits for the shared folder. Existing case “takes relative paths and names, and refuses every way out of the folder”.

**Sources** [server/host/team-files.ts](../../../../server/host/team-files.ts) · [server/host/team-files.test.ts](../../../../server/host/team-files.test.ts) · [server/routes/team-files.ts](../../../../server/routes/team-files.ts)

**Dependencies** APEX-17-01

**Risk** Team ownership errors can permit replacing a colleague's shared upload.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/team-files.test.ts`.

**Manual verification** Sign into the synthetic team as author, peer and admin and inspect the shared folder after each operation.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-23-06 | Preserve uploader identity through rename | Rename a shared fixture upload and reload its listing. | The original uploader and new file name both persist. |
| APEX-23-07 | Disallow a peer from replacing an owned upload | Attempt to replace A's note as B against a known fixture resource. | The response refuses the replacement and A's hash is unchanged. |
| APEX-23-08 | Expose a concurrent filename collision clearly | Upload different bytes for the same team filename concurrently. | The result follows one documented conflict policy and never silently loses an accepted version. |
| APEX-23-09 | Account for storage caps before replacing a file | Replace a near-cap file with a larger one in the synthetic folder. | An over-cap refusal preserves the old bytes and byte total. |
| APEX-23-10 | Keep member deletion independent of unrelated files | Remove one of three uploads owned by different fixture members. | Only the authorized target disappears and the remaining uploader IDs survive. |

## Message files

**Current state** Message-file resolution uses stored message references and pinned working folders with different read and download limits. Existing case “rejects a named pipe without waiting for a writer”.

**Sources** [server/message-file.ts](../../../../server/message-file.ts) · [server/message-file.test.ts](../../../../server/message-file.test.ts)

**Dependencies** APEX-01-04

**Risk** A preview may read a different file than the chat actually presented.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/message-file.test.ts`.

**Manual verification** Open the fixture message attachment from the transcript and compare the resolved source and payload.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-23-11 | Resolve a file by message source position | Place two identically labeled Markdown links in one message. | Selecting the second returns only the second file's hash. |
| APEX-23-12 | Preserve a deliberately unset working folder | Clear the pinned conversation folder while a bot default folder exists. | A relative reference cannot silently resolve against the default. |
| APEX-23-13 | Read a supported foreign path spelling consistently | Render Windows, UNC and Unix references in a fixture transcript on another OS. | The parser classifies each spelling correctly without guessing unrelated local files. |
| APEX-23-14 | Return promptly for a nonregular fixture entry | Open a synthetic pipe reference via the supported read API. | The read fails within the fixture deadline and does not wait for a writer. |
| APEX-23-15 | Keep preview and download limits legible | Request a document between preview and download size limits. | The UI distinguishes the preview limit from availability of the permitted full download. |

## Settled content

**Current state** The settled-file cache keys parsed content to a file stamp and avoids caching recent writes or failed parses. Existing case “parses once while the file is unchanged, again after it changes or forget()”.

**Sources** [server/settled-file.ts](../../../../server/settled-file.ts) · [server/settled-file.test.ts](../../../../server/settled-file.test.ts)

**Dependencies** APEX-01-03

**Risk** A cache can reuse partial or obsolete content during rapid writes.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/settled-file.test.ts`.

**Manual verification** Watch a fixture file settle and compare its parse count, stamp and displayed contents.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-23-16 | Avoid caching a file still being written | Append the second half inside the settlement interval after a first read. | A later settled read returns the complete document. |
| APEX-23-17 | Reuse parsing for a stable file | Read unchanged fixture content 20 times after the settle window. | Only one parse occurs and all reads return equivalent results. |
| APEX-23-18 | Invalidate a cached entry after atomic replacement | Rename a same-name fixture replacement into place after a successful read. | The next read parses the replacement and returns its new content. |
| APEX-23-19 | Recover from a deliberately failed parse | Present a partial fixture document then replace it with a valid one. | The failure is not cached and the next settled read succeeds. |
| APEX-23-20 | Forget one cached path without flushing all others | Cache A and B then explicitly forget A. | Only A incurs a new parse on the next paired read. |
