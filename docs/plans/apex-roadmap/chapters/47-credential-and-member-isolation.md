# 47 · Credential and member isolation

[Project APEX ledger](../README.md) · Security, packaging and release

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Desktop vault

**Current state** Credential reads distinguish absent storage, valid credentials and temporary OS failures with delayed retry. Existing case “tries again when the OS says the store is temporarily unavailable”.

**Sources** [electron/secure-credentials.mjs](../../../../electron/secure-credentials.mjs) · [electron/secure-credentials.test.mjs](../../../../electron/secure-credentials.test.mjs)

**Dependencies** APEX-01-17

**Risk** Treating a temporarily locked credential store as empty can destroy valid credentials.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run electron/secure-credentials.test.mjs`.

**Manual verification** Use a synthetic credential backend and compare its read/write calls with the desktop sign-in state.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-47-01 | Distinguish a never-created store from a temporarily locked one | Launch with each synthetic backend state. | Only the absent case is reported empty and a locked case does not persist a reset. |
| APEX-47-02 | Space repeated credential reads under temporary OS lock | Make two reads transiently fail and the third succeed. | The retries follow the configured delays and recover the original fixture credential. |
| APEX-47-03 | Preserve a readable store through an unrelated account failure | Read two fixture credentials then reject one account's sign-in. | The persisted sibling credential remains intact and usable. |
| APEX-47-04 | Expose an unrecoverable read error without leaking values | Return a permanent synthetic backend failure containing a marker. | The desktop names the unavailable store and logs zero credential-marker values. |
| APEX-47-05 | Reset only after the existing explicit reset action | Start with a permanently unreadable disposable store then choose its reset control. | No write occurs before that action and one new empty store is created afterward. |

## Credential state

**Current state** Credential persistence is gated on the store having been read successfully. Existing case “refuses to persist when it was built from an unreadable store”.

**Sources** [electron/secure-credential-state.mjs](../../../../electron/secure-credential-state.mjs) · [electron/secure-credential-state.test.mjs](../../../../electron/secure-credential-state.test.mjs)

**Dependencies** APEX-01-17

**Risk** A settings change can persist a partial empty credential view over the real saved record.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run electron/secure-credential-state.test.mjs`.

**Manual verification** Inspect immutable fixture snapshots of the credential state before and after attempted writes.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-47-06 | Refuse writes from an unreadable initial state | Construct the fixture state from a failed keychain read then edit an unrelated field. | No persisted document replaces the unreadable one. |
| APEX-47-07 | Keep a read-only view usable for diagnostics | Request account availability while persistence is disabled. | The caller receives the documented safe view and no unhandled exception. |
| APEX-47-08 | Commit an update atomically to the synthetic store | Replace one entry while simulating a failed first save. | The last durable snapshot is intact and a successful retry produces the intended new state. |
| APEX-47-09 | Preserve unrelated credential namespaces during edits | Update a synthetic connector credential alongside a voice credential. | Only the intended namespace changes its stored digest. |
| APEX-47-10 | Handle two rapid account edits without losing the latest committed value | Delay the first save and issue a second explicit edit. | The final read matches the last accepted edit and both outcomes are attributable. |

## Request identity

**Current state** Request authentication combines origin, loopback trust, session identity and an operation allowlist for service callers. Existing case “accepts localhost, 127.x and ::1 with or without a port”.

**Sources** [server/request-auth.ts](../../../../server/request-auth.ts) · [server/request-auth.test.ts](../../../../server/request-auth.test.ts) · [server/request-auth.e2e.test.ts](../../../../server/request-auth.e2e.test.ts)

**Dependencies** APEX-01-02

**Risk** Confusing service, owner and member identities can expose workspace data.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/request-auth.test.ts`.

**Manual verification** Use fixture identities and supported routes only, then compare responses and audit decisions.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-47-11 | Recognize documented loopback forms consistently | Send a read-only fixture health request with supported IPv4 and IPv6 loopback forms. | All accepted forms map to the same documented trust class. |
| APEX-47-12 | Keep service identity limited to its declared operations | Use the synthetic service identity for one allowed read and one unsupported fixture operation. | The allowed read succeeds and the unsupported operation records no effect. |
| APEX-47-13 | Scope member session identity to the active workspace | Open equivalent session-backed routes on two isolated fixture servers. | Each resolves only its own synthetic workspace and member. |
| APEX-47-14 | Clear a retired session's access after logout | Log out a fixture member then refresh a formerly visible member page. | The stored session cannot read protected content and the owner session remains usable. |
| APEX-47-15 | Preserve auth decisions through proxy-origin normalization | Exercise known supported same-origin fixture requests with the documented proxy scheme. | The resolved origin and resulting access class match the expected route contract. |

## Member secrets

**Current state** The member-secret fixture contrasts personal and team credentials in private chats, shared chats and scheduled tasks. Existing case “Ledger gets it again in her own chat with no card”.

**Sources** [server/vault-store.ts](../../../../server/vault-store.ts) · [server/cloud-team-member-secrets.e2e.test.ts](../../../../server/cloud-team-member-secrets.e2e.test.ts) · [server/credential-env.ts](../../../../server/credential-env.ts) · [server/host/vault-readers.ts](../../../../server/host/vault-readers.ts) · [server/routes/vault.ts](../../../../server/routes/vault.ts)

**Dependencies** APEX-17-01

**Risk** A saved personal credential can silently be used on behalf of another member.

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/cloud-team-member-secrets.e2e.test.ts`.

**Manual verification** Use distinct synthetic keys in private, shared and routine chats and inspect the fake connector's received marker.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-47-16 | Reuse a saved key only in its member's eligible chat | Ask the same fixture bot for a harmless synthetic account read in A's and B's private chats. | Only A's eligible chat uses A's stored key. |
| APEX-47-17 | Keep a shared chat from using an owner's personal credential | Share the fixture chat then request the same account read. | No personal key is sent silently and the existing credential decision flow applies. |
| APEX-47-18 | Isolate member-specific scheduled work | Schedule the synthetic connector read for B while only A has a saved personal key. | A's key never reaches B's routine adapter. |
| APEX-47-19 | Restrict management of a member's secret | Inspect the supported credentials view as owner, admin and another member. | Only the owning member can list or change that personal fixture entry. |
| APEX-47-20 | Keep team-scoped credentials identifiable after a personal save | Store distinct synthetic team and personal markers for the same connector. | Each eligible context selects its documented scope and receipts disclose no raw marker. |
