import { expect, it } from "vitest";

import { runControlOmb } from "../scripts/control-omb.ts";
import type { MemoryJournalEntry } from "./memory-journal.ts";
import type { MemoryDoc } from "./memory-store.ts";
import { launchRestartableServer } from "./testing/restartable-server.ts";

type Change = { entry: Pick<MemoryJournalEntry, "id"> };

it("retains acknowledged Undo and reviewed delete entries across two immediate hard restarts", async () => {
  const fixture = await launchRestartableServer();
  try {
    const { bot } = await runControlOmb(["new-bot", "--name", "Memory restart", "--url", fixture.url]) as { bot: { id: string } };
    const root = `${fixture.url}/api/bots/${bot.id}/memory`;
    const api = async <T>(method: string, route: string, body?: unknown, status = 200) => {
      const response = await fetch(root + route, {
        method, headers: { "content-type": "application/json", origin: fixture.url }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      expect(response.status, `${method} ${route}`).toBe(status);
      return response.json() as Promise<T>;
    };
    const save = (path: string, text: string, expectedHash?: string) => api<Change & MemoryDoc>("PUT", "/file", { path, text, expectedHash });
    const read = (path: string) => api<MemoryDoc>("GET", `/file?path=${encodeURIComponent(path)}`);
    const undo = (id: string) => api<Change & MemoryDoc>("POST", `/journal/${id}/revert`, {});
    const restart = async () => {
      await fixture.stop("SIGKILL");
      await fixture.start();
    };

    const keepPath = "memory/keep.md", deletePath = "memory/delete.md";
    const first = await save(keepPath, "First version.");
    const oldDelete = await save(deletePath, "First version.");
    const corrected = await save(keepPath, "Corrected version.", first.hash);
    const confirmed = await save(deletePath, "Corrected version.", oldDelete.hash);
    const typo = await save(keepPath, "Typo.", corrected.hash);
    const restored = await undo(typo.entry.id);
    await restart();

    expect((await read(keepPath)).text).toBe("Corrected version.");
    expect((await read(deletePath)).text).toBe("Corrected version.");
    await api("POST", `/journal/${first.entry.id}/revert`, {}, 409);
    await api("DELETE", "/file", { path: deletePath, expectedHash: oldDelete.hash }, 409);
    expect(await read(keepPath)).toMatchObject({ exists: true, hash: restored.hash, text: "Corrected version." });
    const reviewed = await read(deletePath);
    expect(reviewed).toMatchObject({ exists: true, hash: confirmed.hash, text: "Corrected version." });
    const deleted = await api<Change>("DELETE", "/file", { path: deletePath, expectedHash: reviewed.hash });
    await restart();

    expect(await read(keepPath)).toMatchObject({ exists: true, hash: corrected.hash, text: "Corrected version." });
    expect(await read(deletePath)).toMatchObject({ exists: false, text: "" });
    const { entries }: { entries: Omit<MemoryJournalEntry, "before">[] } = await api("GET", "/journal");
    const notes = entries.filter((row) => row.path === keepPath || row.path === deletePath);
    expect(notes.map((row) => row.id)).toEqual([deleted, restored, typo, confirmed, corrected, oldDelete, first].map((ack) => ack.entry.id));
    expect(notes.filter((row) => row.kind === "deleted")).toMatchObject([{ id: deleted.entry.id, path: deletePath }]);
    expect(notes.find((row) => row.id === restored.entry.id)).toMatchObject({ via: "revert", afterHash: corrected.hash });
    expect(notes.every((row) => !("before" in row))).toBe(true);
    expect(await undo(deleted.entry.id)).toMatchObject({ exists: true, text: "Corrected version." });
  } finally {
    await fixture.close();
  }
}, 90_000);
