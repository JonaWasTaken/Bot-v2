# Embedded desktop server recovery

Run the focused checks and real Electron utility-process fixture:

```sh
node --test electron/server-supervisor.node-test.mjs electron/server-boot-probe.node-test.mjs
pnpm build:server
node scripts/verify-server-recovery.mjs
```

The fixture runs on Windows, macOS and Linux (Linux needs a graphical session, or
`xvfb-run -a node scripts/verify-server-recovery.mjs`). It creates disposable
homes and profiles, copies the bundled server outside the repository, chooses
fresh loopback ports, and configures the repository's fake engine and loopback
connected-app service. The Electron parent starts in desktop mode even when
the invoking shell has `ELECTRON_RUN_AS_NODE` set.
It never launches `electron/main.mjs`, a real computer/browser driver, the
operator's installed app, or their data directory. It accepts no server URL.

Ten separate Electron parents exercise the production supervisor, PID health
probe, parent-held data-directory lease, private approval coordinator, and built
server:

- Send one synthetic Gmail message through the bot's connected-app bridge and
  crash the server after the provider records the successful batch result.
  Require one call at the service, one provider prompt, one terminal failure
  in the conversation, and a failed pinned job. A fresh user request in that
  conversation must complete with the send count still at one.
- Repeat while the service holds its reply, after counting the send. The
  transcript has no successful tool result at the crash. Require the same
  counts and terminal outcome.
- Crash at the actual approval card for a direct Gmail send. Verify that the
  dead card expires and a late Allow is unavailable. The failed turn says the
  request was never sent. Explicitly request it again, deny the fresh card,
  and check that the receiver count stays at zero.
- Repeat with a read-only Gmail grant and a fetch. The replacement must
  continue the same assignment once and finish it. A subsequent send attempt
  under the same grant must fail before reaching the service. Stop that turn
  and check the cancelled assignment and idle conversation.
- Crash the requester after sending and handing off to a teammate. Exercise
  a status-only acknowledgment, a one-way notification, and a running child
  stopped from the requester's conversation. Each keeps its own outcome and
  the original send reaches the service once. A fourth handoff with no send
  resumes the requester to report the teammate's substantive reply.
- Quit through Electron's actual `before-quit` event during the first backoff.
  Wait beyond that retry deadline and verify no replacement was spawned.
- Crash the initial child and every replacement. Verify exactly three retries
  with the production 1/2/4-second delays, then a terminal exhausted state.

The printed evidence directory retains each scenario's JSON receipt and log.
The send and fetch scenarios also check the replacement's PID, port, parent and child
leases, rejection of an outstanding approval, a fresh approval, authorized
mutations and a 403 for a write without the desktop capability. The receipt
includes the bounded transcript, wait response and counts at the crash and
after reconciliation.
Cleanup removes the copied server, temporary UI, and fixture homes. Keep the
receipts and exact command sequence when reporting a pass.
Unit checks also cover stable-uptime budget reset, old exit/ready results,
pending-boot shutdown, repeated quit requests, failed probes, and refusing to
fork a sibling when a child cannot be reaped.

On Windows x64 build 26300 with Node 24.22.0 and Electron 43.7.9, the baseline
at `f0bf6f7cd` repeated both sends and reported both jobs complete. With the
fix, each send reached the service once and each interrupted job reported a
failure. The read-only assignment resumed once on both revisions. The
[captured counts](evidence/desktop-server-recovery/windows-2026-11-21.jsonl)
include requests received by the loopback service and total provider prompts
through the end of reconciliation.

Saved work from an older release can identify the same batch by the
lowercase name exposed by the OpenAI-compatible and Pi drivers. Reopening a
pre-marker SQLite assignment originally sent the request twice for both
the team and personal app servers. With the driver aliases recognized,
the receiver counted one request for each, and neither assignment reran.
The matching read-only batch and an unrelated server keep their existing
recovery behavior. The last four rows in the evidence file record the
upgrade check.

At `cfd5f1fb7`, a legacy preview with 39 reads followed by a send was still
valid JSON even though the preview budget had replaced its final action name.
The team and personal connectors each delivered twice. Both now interrupt
after one delivery. A known read with only its argument shortened can resume.
The same revision left an unanswered outbound card open after restart and
misreported the marked requester when a child acknowledged or needed no reply.
The [review fixture counts](evidence/desktop-server-recovery/windows-review-2026-11-21.jsonl)
record the measured outcomes.

To test an upgrade, build the OSS server at `f0bf6f7cd` in a separate checkout
with `pnpm build:server`. After building the server under test in this checkout,
run the upgrade fixture against the old bundle.

```sh
node scripts/verify-server-recovery.mjs --upgrade-from /path/to/old/checkout/dist-server
```

The first utility process writes the assignments and conversation with the old
server. The supervisor replaces that process with the new server on the same
fixture data after a crash. The seven receipts cover a status-only child, a
notification, a substantive reply, a bounded batch with a hidden send, a live
child stopped after the crash, and two safe handoffs with a substantive result
(one read or no connector call). Each receipt records the child and requester
IDs, outcomes, executions, receiver counts and pinned wait result. The bundle
hashes are in `bundles.json` beside the receipts.

With `348c044f8` as the replacement, a recorded send followed by a handoff
could leave the requester completed or waiting. In the bounded case it ran
twice despite the old server having recorded a successful batch. The corrected
replacement keeps each such requester interrupted after one execution and one
delivery. Recovery on an upgrade can only recognize evidence the old server
persisted. [Windows upgrade receipts](evidence/desktop-server-recovery/windows-legacy-handoffs-2026-11-21.jsonl)

`pnpm exec vitest run server/chat-followups-restart.test.ts` exercises a queued
channel request across a server crash. It checks that the follow-up runs
successfully and that the earlier interruption stays attached to the earlier
user message.

This fixture exercises Electron main and its server child. Renderer draft
preservation, native failure dialogs and cleanup of real provider processes
require separate tests. A real connected app may have received a request
whose response the server lost, so the interruption directs the person to
check the app before continuing.
