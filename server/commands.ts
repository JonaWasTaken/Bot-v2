// The receipt is written in the same SQLite transaction as the command's own rows, so only synchronous writes to this
// database belong in `apply`. Files, provider calls, caches and broadcasts are not transactional: prepare replay-safe files
// before and publish after. A receipt does not make external side effects exactly-once.
import { appendMessage, readMessage, readCommandReceipt, withCommandReceipt } from "./message-db.ts";
import type { Message } from "./store.ts";

export interface Command {
  /** Stable, dotted name of the mutation: "digest.append", "hook.ingest". */
  kind: string;
  /** Idempotency key within the kind — a turn id, a tool_use_id, a ticket. */
  key: string;
}

export type MessageCommand = Command & { receipt?: "message-id" };

export function persistMessage(threadId: string, message: Message, command?: MessageCommand): Message {
  const write = () => {
    appendMessage(threadId, message);
    return command?.receipt === "message-id" ? message.id : message;
  };
  const result = command ? runCommand(command, write) : write();
  if (typeof result !== "string") return result;
  if (result === message.id) return message;
  const original = readMessage(threadId, result);
  if (!original) throw new Error("The posted message is no longer available.");
  return original;
}

export interface CommandReceipt<T = unknown> {
  kind: string;
  key: string;
  at: number;
  result: T;
}

/** A repeat returns the stored result without calling `apply`; results must be JSON (`undefined` is stored as `null`). */
export function runCommand<T>(command: Command, apply: () => T, now: () => number = Date.now): T {
  const { result } = withCommandReceipt(
    command.kind,
    command.key,
    () => JSON.stringify(apply() ?? null),
    now(),
  );
  return JSON.parse(result) as T;
}

export function commandReceipt<T = unknown>(kind: string, key: string): CommandReceipt<T> | null {
  const stored = readCommandReceipt(kind, key);
  if (!stored) return null;
  return { kind: stored.kind, key: stored.key, at: stored.at, result: JSON.parse(stored.result) as T };
}
