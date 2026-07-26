# Frontend Integration

The frontend is a client of the MeriAI backend. It must not receive or retain
provider keys, browser cookies, portal credentials, service-policy configuration,
raw audio, identity-document values, OTPs, passwords, or payment data. The
authoritative field-level contract is [API Contracts](api-contracts.md).

## Configuration and availability

Set the public build-time `API_BASE_URL` to the HTTPS API origin. Use it for
REST requests and replace its `https` scheme with `wss` when connecting to
`/ws/v1/sessions/{session_id}`. In production, set the exact HTTPS frontend
origin in `ALLOWED_ORIGINS`; this protects REST CORS requests.

The current WebSocket gateway does not validate the browser `Origin` header.
Until that server-side check is added, deploy it behind an ingress or proxy that
allows WebSocket upgrades only from the intended frontend origin.

Call `GET /readyz` before creating a session. A `degraded` response means the
database or verified knowledge base is unavailable and the conversation cannot
be relied on. Treat the `providers` object as status information only: it does
not describe a complete language/capability matrix. Keep typed chat available
when an audio capability is unavailable, and use the per-turn speech status and
reason code to update voice controls.

## Session and conversation lifecycle

1. Create a session with `POST /api/sessions`, supplying the selected `language`,
   `mode`, and client capabilities. Keep the opaque `session_id` only for the
   active client session.
2. Fetch `GET /api/services` to populate service selection from active verified
   services. Do not hard-code public-service rules in the client.
3. Use either `POST /api/sessions/{session_id}/text` for a request/response
   interaction or `WS /ws/v1/sessions/{session_id}` for live text and voice.
   Include a client-generated `turn_id` on every text and audio turn, and on
   every WebSocket confirmation event.
4. Render the returned snapshot (`state`, `checklist`, `missing_questions`, and
   `action_proposal`) as the source of truth. `answered_questions` deliberately
   contains keys, not submitted values.
5. After a socket disconnect, reconnect using the same session ID and treat the
   new `session.ready` payload—or `GET /api/sessions/{session_id}/state`—as the
   authoritative snapshot. Server `sequence` values begin at zero for each
   connection; apply only increasing sequence values within that connection.

For structured selection, send `service_identifier`. For a prompted answer,
send `{ "question_key": "…", "value": "…" }` in `answer`. Otherwise send the
user's current text in `text`; it is processed only for that turn and is not
returned by the REST session-state endpoint.

## WebSocket event handling

The server sends `session.ready` immediately after a successful connection.
Then handle these events in their received order:

- `status` updates temporary UI state such as `thinking`, `listening`, or
  `text_only`. For `text_only`, keep keyboard input available and display the
  provided stable speech `reason_code`.
- `assistant.message` carries `trust_level`, displayable text, the current
  conversation state, optional research, and optional action metadata.
- `checklist.updated` carries the current structured snapshot. Use it instead
  of inferring eligibility or checklist contents locally.
- `action.result` reports a conversation-action outcome. Its payload differs
  from the REST confirmation response, which is a session snapshot.
- `error` has a stable `payload.code`; show a safe, localized client message
  rather than assuming an operation succeeded.
- `pong` answers `ping` and may be used for connection health.

An unrecognized client event, invalid JSON, malformed payload, or unsupported
browser event produces an ordered `error` event without closing the socket.
Binary frames are valid only after `audio.start`.

## Voice and accessibility

For an audio turn, send `audio.start` with a `turn_id`, language, and
`mime_type` (the supported client flow uses `audio/webm`), send binary frames,
then send `audio.commit` with the same turn ID. Audio is kept only in memory by
the backend. Keep a client-side recording within the 5 MB server limit.

On successful transcription, render `transcript.final` as an accessibility
caption, then handle the normal assistant and checklist events for that turn.
If transcription cannot run, the server emits `status` with `state: "text_only"`
and keeps the socket open.

`speech.output` is emitted after a text turn, including typed turns. Play audio
only when `payload.status` is available and the payload contains both
`audio_base64` and `mime_type`. Decode it into an in-memory Blob and do not put
the audio in analytics, logs, or browser storage. If it is unavailable, retain
the assistant text and inspect `reason_code`; it is not a failed conversation.

## Trust, research, and media

Label `trust_level: "verified_kb"` guidance as verified. When an assistant
payload includes `research`, label it external/unverified, show its warning and
all citations, and never merge it into verified checklist content. The direct
`POST /api/research` fallback has the same trust boundary.

Optional media analysis uses multipart `POST /api/sessions/{session_id}/media`
with `file` and `consent=true`. Accept only JPEG, PNG, WebP, or PDF files up to
10 MB. The returned `attachment_id` is session-scoped, usable once, and expires
after ten minutes; send no more than five IDs in `attachment_ids` on the next
REST or WebSocket text turn. Show only the returned safe analysis fields—never
the original filename, raw file, or extracted text.

## Confirmations and controlled browser actions

For a conversation-level proposal, use either `POST
/api/sessions/{session_id}/confirm` with the exact `tool_call_id` and explicit
user decision, or the WebSocket `user.confirm` event with those fields plus the
current `turn_id`. Never auto-confirm or reuse confirmation text. A REST
confirmation returns the next session snapshot; a socket confirmation emits
`action.result` and `checklist.updated`.

For browser work, the REST lifecycle is:

1. `POST /api/browser-sessions` with the conversation `session_id`, selected
   `service_identifier`, and approved `tool_name`.
2. `POST /api/browser-sessions/{browser_session_id}/preview` with the current
   `turn_id`; display the returned redacted preview and missing questions.
3. Ask for an explicit same-turn decision, then `POST
   /api/browser-sessions/{browser_session_id}/confirm` with that `turn_id` and
   `accepted`.
4. Render the returned redacted `activity` and `state`; retrieve the same view
   with `GET /api/browser-sessions/{browser_session_id}` when needed.

Never send selectors, allowlists, browser configuration, client-computed field
values, or a full action object. Confirmation expires when the turn, preview, or
page fingerprint changes. `waiting_for_user_site_action` is a required user
handoff, not an error to bypass. Login, OTP, CAPTCHA, password/PIN, payment,
document upload, biometric, declaration/attestation, signature, and protected
portal states always require the user to continue directly on the official site.
Final submit is policy-blocked for the current pilot actions.

## Errors and privacy

REST errors use `{ "detail": { "code": "…", "message": "…" } }`; branch on
the stable `code`, not the display message. Common recoverable cases include
`no_pending_confirmation`, `attachment_unavailable`, `media_consent_required`,
and `browser_handoff_required`. Do not retry a browser confirmation after its
turn changes; request a fresh preview.

Do not log complete request or WebSocket payloads on the client. In particular,
exclude user text, transcripts, media, attachment IDs, confirmation text,
browser previews, and audio from analytics and crash reporting.
