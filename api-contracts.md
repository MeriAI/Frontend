# API Contracts

## REST Endpoints

### `GET /healthz`

Returns process liveness.

```json
{ "status": "ok" }
```

### `GET /readyz`

Returns runtime readiness details. The service is `ready` only when the database is
reachable and a later KB loader has successfully loaded verified service data. Provider
states never include credentials.

```json
{
  "status": "ready",
  "database": "ok",
  "kb_loaded": true,
  "providers": {
    "addis_ai": "configured",
    "gemini": "configured",
    "addis_ai_voice": "configured",
    "elevenlabs": "configured",
    "elevenlabs_voice": "configured",
    "exa": "optional"
  }
}
```

### `POST /api/sessions`

Creates a chat/voice session. The response is reconnect-safe and does not include
raw user text or provider payloads.

```json
{
  "language": "am",
  "mode": "voice",
  "client_capabilities": {
    "audio": true,
    "subtitles": true,
    "keyboard": true,
    "browser_progress": true
  }
}
```

Response:

```json
{
  "session_id": "ses_...",
  "state": "NEW_SESSION",
  "selected_service_version_id": null,
  "answered_questions": [],
  "checklist": [],
  "missing_questions": [],
  "action_proposal": null
}
```

### `GET /api/services`

Lists active verified services.

```json
{
  "services": [
    {
      "id": "svc_passport_et",
      "slug": "ethiopian-passport",
      "name_am": "የኢትዮጵያ ፓስፖርት አገልግሎት",
      "name_en": "Ethiopian Passport Service",
      "agency": "Immigration and Citizenship Service",
      "verified_at": "2026-07-25T00:00:00Z"
    }
  ]
}
```

### `GET /api/sessions/{session_id}/state`

Returns current state for reconnect or text fallback. It includes answered question
keys, source-backed checklist items, missing questions, and at most one verified
action proposal. It never returns raw text answers.

```json
{
  "session_id": "ses_...",
  "state": "ASK_SITUATIONAL_QUESTION",
  "selected_service_version_id": "svc_passport_et:v1",
  "answered_questions": ["request_type"],
  "checklist": [
    {
      "key": "renewed_kebele_id",
      "status": "needed",
      "source_id": "src_ics_new_passport_2025",
      "label_am": "የታደሰ የቀበሌ መታወቂያ",
      "label_en": "Renewed Kebele ID",
      "explanation_am": null,
      "explanation_en": null
    }
  ],
  "missing_questions": [
    {
      "key": "age_band",
      "prompt_am": "ዕድሜዎ ከ40 ዓመት በታች ነው?",
      "prompt_en": "Are you under 40 years old?",
      "answer_type": "choice",
      "options": [
        {
          "value": "under_40",
          "label_am": "አዎ፣ ከ40 በታች",
          "label_en": "Yes, under 40"
        }
      ]
    }
  ],
  "action_proposal": null
}
```

### `POST /api/sessions/{session_id}/text`

Submits a text or structured turn. A service selection or confirmed answer may be
sent without a placeholder `text` value. For unstructured turns, `text` is used
only for the current turn by constrained Gemini reasoning and is not persisted.

```json
{
  "turn_id": "turn_07",
  "language": "am",
  "text": "I am applying for a new passport",
  "service_identifier": "ethiopian-passport",
  "answer": {
    "question_key": "request_type",
    "value": "new"
  }
}
```

Response:

```json
{
  "session_id": "ses_...",
  "state": "ASK_SITUATIONAL_QUESTION",
  "selected_service_version_id": "svc_passport_et:v1",
  "answered_questions": ["request_type"],
  "checklist": [],
  "missing_questions": [],
  "action_proposal": null,
  "turn_id": "turn_07",
  "trust_level": "verified_kb",
  "assistant_message": "Answer saved. More information is needed.",
  "tool_status": null,
  "tool_call_id": null,
  "browser_session_id": null
}
```

When task 012 orchestration proposes a confirmation-required action,
`action_proposal` includes `tool_call_id` and `status: "pending_confirmation"`.
The same deterministic turn retry returns the same `tool_call_id`.

### `POST /api/sessions/{session_id}/confirm`

Approves or rejects a pending conversation-level action created by task 012
orchestration. If no pending tool call exists, the route returns
`409 no_pending_confirmation`.

```json
{
  "tool_call_id": "tool_01H...",
  "accepted": true,
  "confirmation_text": "yes, submit this exact application"
}
```

Stable error response:

```json
{
  "detail": {
    "code": "no_pending_confirmation",
    "message": "There is no pending conversation action to confirm."
  }
}
```

### `POST /api/browser-sessions`

Creates a controlled browser session from a verified service/action reference.
The client must not send browser configuration, selectors, allowlists, or action
definitions. The backend looks up the action from the active verified service
version selected by the conversation session.

```json
{
  "session_id": "ses_...",
  "service_identifier": "ethiopian-passport",
  "tool_name": "service.prepare_application"
}
```

Response:

```json
{
  "session_id": "br_...",
  "conversation_session_id": "ses_...",
  "service_version_id": "svc_passport_et:v1",
  "action_definition_id": "svc_passport_et:v1:action:service.prepare_application",
  "tool_name": "service.prepare_application",
  "state": "idle",
  "filled_fields": {},
  "missing_questions": [],
  "preview": null,
  "current_url": "https://www.immigration.gov.et/",
  "confirmation_state": null,
  "idempotency_key": null,
  "activity": []
}
```

Creation returns stable errors for unknown sessions/services/actions, mismatched
selected service, and condition-inapplicable actions. A request containing a full
`action` object is rejected by validation.

### `POST /api/browser-sessions/{browser_session_id}/preview`

Builds an exact redacted preview from confirmed conversation answers only. Client
answer payloads are ignored; sensitive mappings become missing
questions and force `waiting_for_user_site_action`.

```json
{
  "turn_id": "turn_07"
}
```

Response state is `preview_required` when no handoff fields are missing, otherwise `waiting_for_user_site_action`.

### `POST /api/browser-sessions/{browser_session_id}/confirm`

Accepts or declines the current exact preview. Confirmation is same-turn and expires if preview or page fingerprint changes.
For a confirmed preview with no missing fields, the backend opens the allowlisted
portal and fills only configured non-sensitive fields. The response includes a
redacted `activity` feed for the client to display as agent progress; it never
includes a browser view, cookies, raw portal text, or field values.

```json
{
  "turn_id": "turn_07",
  "accepted": true
}
```

Example activity statuses are `opening`, `filling`, `filled`, `completed`,
`waiting_for_answer`, and `handoff_required`. Protected portal states such as
login, OTP, CAPTCHA, payment, upload, biometric, declaration, or signature
stop automation and return a user handoff. No browser submit is performed.

### `POST /api/browser-sessions/{browser_session_id}/submit`

Attempts final submit only for task-014-approved allowlisted pilot actions after
exact preview confirmation. In task 010, final submit remains policy-blocked for
all current actions.

```json
{
  "turn_id": "turn_07",
  "page_text": "Visible page text used for prohibited-step detection"
}
```

If the page asks for OTP, CAPTCHA, password, payment, upload, biometric, attestation, or signature, the backend returns `403` and moves to `waiting_for_user_site_action`.

Task 011 Playwright adapter behavior:

- Navigation accepts only HTTP(S) URLs whose final page URL remains on the
  configured service allowlist. Off-allowlist redirects return stable adapter
  errors and close the browser context.
- Visible text reads return a page fingerprint used by preview/confirmation
  checks. Prohibited terms such as OTP, CAPTCHA, password, payment, upload,
  biometric, declaration, or signature produce user handoff errors.
- Field filling uses only configured non-sensitive selectors. Sensitive or
  missing-selector fields force user handoff instead of being filled.
- Submit is guarded by submit locator, exact preview hash, current-turn
  confirmation, unchanged page fingerprint, and idempotency key match. Default
  tests use mocked pages and never contact public portals.

### `POST /api/research`

Research fallback for missing services, missing facts, source discovery, or
freshness checks during a live conversation. Responses must be labeled
`external_research`, include citations/source metadata when available, and cannot
become official checklist items until verified.

```json
{
  "query": "Where can I renew an Ethiopian passport?",
  "language": "en",
  "purpose": "missing_fact",
  "session_id": "ses_...",
  "turn_id": "turn_07",
  "max_results": 5,
  "persist_candidates": true
}
```

Successful response:

```json
{
  "status": "success",
  "trust_level": "external_research",
  "warning": "External research only; not verified KB guidance. Use citations until review.",
  "answer": "External research found sources. Review citations before relying on them.",
  "citations": [
    {
      "title": "Official agency page",
      "url": "https://example.gov.et/service",
      "publisher": "Example Agency",
      "snippet": "Short cited source excerpt...",
      "retrieved_at": "2026-07-26T00:00:00Z",
      "review_status": "unverified"
    }
  ],
  "provider": "exa",
  "reason_code": "ok",
  "research_result_id": "rsr_..."
}
```

Unavailable response when no provider is configured or the provider fails:

```json
{
  "status": "unavailable",
  "trust_level": "external_research",
  "warning": "External research only; not verified KB guidance. Use citations until review.",
  "answer": "External research unavailable; no verified KB guidance for this request.",
  "citations": [],
  "provider": null,
  "reason_code": "research_provider_not_configured",
  "research_result_id": null
}
```

The raw query is never returned and is not stored durably. If `persist_candidates`
is true, the backend stores only a query hash, unverified result metadata, and
candidate source rows for later maintainer review.

## WebSocket

Endpoint:

```text
WS /ws/v1/sessions/{session_id}
```

On connect, the backend validates the durable session and emits `session.ready`.
If the session or runtime services are unavailable, it emits an `error` event and
closes the socket. Reconnect uses the same endpoint and returns the current
durable session snapshot.

Every server event includes a common envelope:

```json
{
  "protocol_version": "1.0",
  "type": "event.name",
  "session_id": "ses_01H...",
  "turn_id": "turn_04",
  "sequence": 18,
  "timestamp": "2026-07-25T18:00:00Z",
  "payload": {}
}
```

`sequence` is monotonic for each WebSocket connection. Payloads contain only
session-scoped state, prompt metadata, and redacted operational details; they do
not include raw text answers, raw user messages, provider payloads, secrets,
audio bytes, payment data, or identity document values.

## Client Events

### `session.start`

Requests the current reconnect-safe snapshot.

```json
{ "type": "session.start" }
```

### `text.message`

Submits a text turn. `service_identifier` and `answer` mirror the REST fallback
fields and remain optional. Without structured fields, the gateway delegates to
the constrained Gemini reasoning path from task 006.

```json
{
  "type": "text.message",
  "turn_id": "turn_07",
  "language": "en",
  "text": "I need help with my passport",
  "service_identifier": "ethiopian-passport",
  "answer": {
    "question_key": "request_type",
    "value": "new"
  }
}
```

### `user.confirm`

Approves or rejects a pending conversation-level action. Accepted
`service.prepare_application` confirmations create a durable browser session and
emit `action.result`; unsafe or missing records return `error/no_pending_confirmation`
or a policy-specific error.

```json
{
  "type": "user.confirm",
  "turn_id": "turn_07",
  "tool_call_id": "tool_01H...",
  "accepted": true,
  "confirmation_text": "yes"
}
```

### `ping`

```json
{ "type": "ping", "turn_id": "turn_07" }
```

### `audio.start`

Starts a memory-only audio turn. The backend keeps binary frames only in the
current WebSocket connection until `audio.commit`, timeout, error, or disconnect.

```json
{
  "type": "audio.start",
  "turn_id": "turn_audio_01",
  "language": "am",
  "mime_type": "audio/webm"
}
```

After `audio.start`, the client may send binary audio frames. Raw bytes are never
persisted or returned in JSON events.

### `audio.commit`

Finishes the active audio turn. If the selected language's STT provider is
configured and succeeds, the gateway emits `transcript.final` and processes the
transcript through the same conversation path as `text.message`. Amharic uses
Addis AI; English uses ElevenLabs. If speech input is unavailable or fails, the
gateway emits a `status` event with `state: "text_only"` and keeps the session
open for keyboard input.

```json
{
  "type": "audio.commit",
  "turn_id": "turn_audio_01"
}
```

### Unsupported In Task 008

`browser.confirm_preview` and `browser.cancel` return ordered `error` events and
keep the socket open. Browser execution starts in tasks 010-011.

## Server Events

### `session.ready`

```json
{
  "protocol_version": "1.0",
  "type": "session.ready",
  "session_id": "ses_01H...",
  "sequence": 0,
  "timestamp": "2026-07-25T18:00:00Z",
  "payload": {
    "state": "ASK_SITUATIONAL_QUESTION",
    "selected_service_version_id": "svc_passport_et:v1",
    "answered_questions": ["request_type"],
    "checklist": [],
    "missing_questions": [],
    "action_proposal": null
  }
}
```

### `status`

```json
{
  "protocol_version": "1.0",
  "type": "status",
  "session_id": "ses_01H...",
  "turn_id": "turn_07",
  "sequence": 1,
  "timestamp": "2026-07-25T18:00:01Z",
  "payload": { "state": "thinking" }
}
```

Voice status events include a `speech` object so the client can stop recording
and keep typed input available when a capability falls back:

```json
{
  "state": "text_only",
  "speech": {
    "capability": "stt",
    "provider": "text_only",
    "status": "fallback",
    "reason_code": "stt_provider_unavailable"
  }
}
```

### `assistant.message`

```json
{
  "protocol_version": "1.0",
  "type": "assistant.message",
  "session_id": "ses_01H...",
  "turn_id": "turn_07",
  "sequence": 2,
  "timestamp": "2026-07-25T18:00:02Z",
  "payload": {
    "trust_level": "verified_kb",
    "message": "Answer saved. More information is needed.",
    "state": "ASK_SITUATIONAL_QUESTION",
    "tool_status": "pending_confirmation",
    "tool_call_id": "tool_...",
    "browser_session_id": null
  }
}
```

Tool fields are included only when an orchestration result is attached to the
turn.

### `action.result`

```json
{
  "protocol_version": "1.0",
  "type": "action.result",
  "session_id": "ses_01H...",
  "turn_id": "turn_07",
  "sequence": 3,
  "timestamp": "2026-07-25T18:00:03Z",
  "payload": {
    "status": "pending_confirmation",
    "tool_call_id": "tool_...",
    "browser_session_id": null
  }
}
```

Statuses include `pending_confirmation`, `executed`, `handoff`, `unknown`,
`action_required`, `rejected`, and `already_completed`. Payloads never include
raw user text or confirmation text.

### `checklist.updated`

Uses the same snapshot payload shape as `session.ready`.

### `transcript.final`

```json
{
  "protocol_version": "1.0",
  "type": "transcript.final",
  "session_id": "ses_01H...",
  "turn_id": "turn_audio_01",
  "sequence": 2,
  "timestamp": "2026-07-25T18:00:02Z",
  "payload": {
    "text": "I need help with my passport",
    "language": "am",
    "provider": "addis_ai",
    "confidence": 0.91
  }
}
```

### `speech.output`

Reports whether assistant speech output is available for the current turn. The
event includes ephemeral `audio_base64` when synthesis succeeds; clients must
decode and play it without persisting it. It never includes vendor keys or
provider URLs. Addis AI serves Amharic TTS and ElevenLabs serves English TTS.

```json
{
  "protocol_version": "1.0",
  "type": "speech.output",
  "session_id": "ses_01H...",
  "turn_id": "turn_audio_01",
  "sequence": 4,
  "timestamp": "2026-07-25T18:00:04Z",
  "payload": {
    "status": "available",
    "provider": "addis_ai",
    "reason_code": "ok",
    "mime_type": "audio/wav",
    "byte_length": 16384,
    "audio_base64": "..."
  }
}
```

### `pong`

```json
{
  "protocol_version": "1.0",
  "type": "pong",
  "session_id": "ses_01H...",
  "turn_id": "turn_07",
  "sequence": 3,
  "timestamp": "2026-07-25T18:00:03Z",
  "payload": {}
}
```

### `error`

```json
{
  "protocol_version": "1.0",
  "type": "error",
  "session_id": "ses_01H...",
  "turn_id": "turn_07",
  "sequence": 4,
  "timestamp": "2026-07-25T18:00:04Z",
  "payload": {
    "code": "unsupported_event",
    "message": "Client event type is not supported."
  }
}
```

Future tasks add `transcript.partial`, `browser.state`, `browser.preview_required`,
`browser.handoff_required`, and `action.confirmation_required`.

Allowed frontend states:

```text
idle, listening, thinking, asking_user, navigating, filling,
waiting_for_user_site_action, preview_required, submitting,
succeeded, failed, cancelled
```

Browser preview events include redacted filled fields, missing questions, start URL, action name, and idempotency key. They must not include raw secrets, full identity document numbers, payment data, OTPs, passwords, or uploaded documents.

## Media Analysis

`POST /api/sessions/{session_id}/media` accepts multipart `file` plus `consent=true`.
Only JPEG, PNG, WebP, and PDF uploads up to 10 MB are accepted. The response contains an
opaque attachment ID and a constrained non-sensitive category, quality-warning,
observation, confidence, and uncertainty result. It never returns a filename, extracted
text, identifier, or raw bytes. Stable errors include `unknown_session`,
`media_consent_required`, `invalid_media_type`, `invalid_media_content`,
`media_too_large`, and `media_analysis_unavailable`.

REST text turns and `text.message` WebSocket events may include up to five
`attachment_ids`. Each ID is scoped to the session, usable once, and expires after ten
minutes. The safe analysis may guide the next assistant turn but cannot confirm answers,
change checklist state, introduce verified facts, or populate browser fields.
