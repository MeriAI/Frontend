<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# MeriAI Voice and Chat Studio

Next.js client for the MeriAI backend. The browser communicates only with the
public HTTPS/WebSocket API; it never receives provider keys, official portal
credentials, cookies, or service policy configuration.

View your app in AI Studio: https://ai.studio/apps/be3703f9-e6f0-496a-a51a-1e4c523f2388

## Run locally

**Prerequisites:** Node.js 20+

1. Run `npm install`.
2. Optionally copy `.env.example` to `.env.local` to override the default
   `https://meriai-api.onrender.com` API origin with `API_BASE_URL` (or the
   equivalent `NEXT_PUBLIC_API_BASE_URL` override).
3. Run `npm run dev`.

## MeriAI integration

- `GET /readyz` gates voice capture when required providers are unavailable.
- An opaque in-memory session ID is created with `POST /api/sessions` and
  reused for REST, WebSocket, reconnect, and session-state requests.
- Live audio uses `audio/webm` frames over `/ws/v1/sessions/{session_id}`.
  Server-produced `speech.output` audio is played immediately and is never
  written to browser storage.
- Checklist, research citations, action previews, and redacted activity feed
  are rendered from structured backend events. Action confirmation is explicit
  and remains within the current conversation turn.

## Quality checks

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
