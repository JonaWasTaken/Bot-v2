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

Five separate Electron parents exercise the production supervisor, PID health
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
- Repeat with a read-only Gmail grant and a fetch. The replacement must
  continue the same assignment once and finish it. A subsequent send attempt
  under the same grant must fail before reaching the service. Stop that turn
  and check the cancelled assignment and idle conversation.
- Quit through Electron's actual `before-quit` event during the first backoff.
  Wait beyond that retry deadline and verify no replacement was spawned.
- Crash the initial child and every replacement. Verify exactly three retries
  with the production 1/2/4-second delays, then a terminal exhausted state.

The printed evidence directory retains each scenario's JSON receipt and log.
The turn scenarios also check the replacement's PID, port, parent and child
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

This fixture exercises Electron main and its server child. Renderer draft
preservation, native failure dialogs and cleanup of real provider processes
require separate tests. A real connected app may have received a request
whose response the server lost, so the interruption directs the person to
check the app before continuing.
