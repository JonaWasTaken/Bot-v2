# 42 · Voice interaction

[Project APEX ledger](../README.md) · Multimodal, performance and reliability

**Status** Not started

**GitHub** Unfiled

**Completion evidence** Pending. Attach the scoped fixture result and the manual observation for the row’s acceptance criterion, with revision and platform. The existing source case is baseline context.

## Voice draft

**Current state** The voice settings draft is conditional on the selected provider. The desktop also exposes a voice sample control. Existing case “hides an unsaved key when another client changes providers”.

**Sources** [src/lib/voice-key-draft.ts](../../../../src/lib/voice-key-draft.ts) · [src/lib/voice-key-draft.test.ts](../../../../src/lib/voice-key-draft.test.ts) · [src/components/VoiceSettings.tsx](../../../../src/components/VoiceSettings.tsx) · [src/components/VoiceSettings.test.ts](../../../../src/components/VoiceSettings.test.ts) · [server/tts/index.ts](../../../../server/tts/index.ts)

**Dependencies** APEX-06-01

**Risk** Voice-provider changes can show or store an unsaved key for another provider.

**Risk level** Critical

**Automated verification** Extend the relevant draft and settings cases and run `corepack pnpm exec vitest run src/lib/voice-key-draft.test.ts src/components/VoiceSettings.test.ts` with fake provider settings and a recording speech sink.

**Manual verification** Use fake key markers in the isolated voice-settings panel and inspect each provider's masked draft.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-42-01 | Invalidate the visible key draft on a remote provider change | Set a synthetic unsaved key then change provider in a second fixture window. | The new provider's editor contains zero old-marker characters. |
| APEX-42-02 | Scope a voice draft to its owning provider | Switch between two configured synthetic providers with different saved status. | Each field shows only its own state and cannot submit the other's pending draft. |
| APEX-42-03 | Avoid logging a voice key while testing playback | Run the fixture's voice preview with a fake credential marker. | The preview and diagnostic logs contain zero marker occurrences. |
| APEX-42-04 | Keep the selected provider when a key save fails | Reject a fixture save and reopen voice settings. | The prior persisted provider/key association remains intact and the failure is visible. |
| APEX-42-05 | Confirm successful voice configuration by actual fixture synthesis | Save a synthetic provider configuration and play a local test sentence. | Exactly one fake synthesis request uses the selected provider and returns playable audio. |

## Transcription

**Current state** The native speech transcript tracks partial and final recognition callbacks across utterance boundaries. Existing case “retains Japanese utterances across pauses and revises only the current partial”.

**Sources** [electron/speech-transcript.mjs](../../../../electron/speech-transcript.mjs) · [electron/speech-transcript.node-test.mjs](../../../../electron/speech-transcript.node-test.mjs) · [src/components/Composer.dictation.test.ts](../../../../src/components/Composer.dictation.test.ts)

**Dependencies** APEX-06-01

**Risk** Partial recognition text may duplicate or erase dictated phrases.

**Risk level** Medium

**Automated verification** Extend the fixture and run `node --test electron/speech-transcript.node-test.mjs`.

**Manual verification** Dictate using the fixture callback stream and compare the final composer text with the expected utterances.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-42-06 | Replace a partial recognition with its corrected final | Emit three revisions of one spoken phrase. | The final draft contains only the final revision once. |
| APEX-42-07 | Preserve earlier Japanese utterances across pauses | Deliver two Japanese fixture phrases separated by an utterance boundary. | Both survive in spoken order after finalization. |
| APEX-42-08 | Ignore empty final callbacks after real text | Deliver one real phrase then two empty final results. | Existing text remains intact and zero blank utterances are added. |
| APEX-42-09 | Coalesce repeated utterance-end callbacks | Deliver a final callback before and after a duplicate boundary event. | The completed phrase occurs once in the draft. |
| APEX-42-10 | Keep dictated and typed segments distinct | Type a correction between two synthetic utterances and finish dictation. | The final draft preserves the correction at its position and both spoken segments. |

## Playback stream

**Current state** Spoken replies stream completed blocks through an owner-specific sink and reconcile them with a settled message. Existing case “pushes the first closed block before the completed message frame arrives”.

**Sources** [src/lib/spoken-reply-stream.ts](../../../../src/lib/spoken-reply-stream.ts) · [src/lib/spoken-reply-stream.test.ts](../../../../src/lib/spoken-reply-stream.test.ts)

**Dependencies** APEX-06-11

**Risk** Streamed speech can repeat text, speak secrets or continue in the wrong thread.

**Risk level** Critical

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run src/lib/spoken-reply-stream.test.ts`.

**Manual verification** Listen to the fake audio sink and compare its emitted blocks and stop events with the visible reply.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-42-11 | Start speaking at the first complete block | Stream an unfinished sentence followed by a block boundary before settlement. | The first speech starts after closure and before the final message arrives. |
| APEX-42-12 | Speak each streamed block once on replay | Reconnect while a reply's first block is already spoken. | The sink contains one copy of each completed block. |
| APEX-42-13 | Keep a synthetic credential split across deltas out of speech | Break a fixture marker across three adjacent chunks. | The spoken output contains no reconstructed marker. |
| APEX-42-14 | Stop old-thread speech when playback ownership changes | Switch the playback owner from task A to B while A still streams. | No new A block is spoken under B's active owner. |
| APEX-42-15 | Associate streamed audio with the settled message ID | Finish a previously unidentified streaming block with its canonical message. | Replay controls resolve to that message and do not enqueue a duplicate. |

## Voice notes

**Current state** Reply voice notes follow workspace or bot settings, have a character limit and attach to eligible final messages. Existing case “follows the Voice setting unless the bot made its own choice”.

**Sources** [server/host/reply-voice-notes.ts](../../../../server/host/reply-voice-notes.ts) · [server/host/reply-voice-notes.test.ts](../../../../server/host/reply-voice-notes.test.ts) · [server/tts/index.ts](../../../../server/tts/index.ts)

**Dependencies** APEX-01-04

**Risk** Voice generation can attach private speech or leave a note on a stopped turn.

**Risk level** High

**Automated verification** Extend the fixture and run `corepack pnpm exec vitest run server/host/reply-voice-notes.test.ts`.

**Manual verification** Play the generated fixture note and compare its transcript with the final message and voice setting.

| ID | Objective | Implementation plan | Acceptance |
| --- | --- | --- | --- |
| APEX-42-16 | Follow a per-bot voice choice across setting changes | Enable workspace voice but disable the chosen bot's reply notes. | That bot produces zero synthesis calls while an enabled fixture bot produces one. |
| APEX-42-17 | End a long voice note at a sentence boundary | Supply a synthetic reply exceeding the speech character cap. | The note fits the cap and its transcript ends at the final accepted sentence. |
| APEX-42-18 | Skip audio after a user-stopped turn | Stop before settlement then release a delayed fake synthesizer result. | No note attaches to the cancelled reply. |
| APEX-42-19 | Keep an existing recorded note from being synthesized again | Return a fixture turn that already carries voice media. | The final message contains one playable note and no second synthesis call. |
| APEX-42-20 | Handle an unavailable voice provider without losing the text | Fail synthetic speech generation after the written answer is ready. | The full written answer remains and voice failure is distinct from turn failure. |
