<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Bauhaus Voice AI Studio

Next.js voice and chat studio with typed, replaceable backend adapters. The UI
depends on application ports rather than provider SDKs, so a future backend can
replace Gemini, browser speech recognition, or browser speech synthesis without
changing visual components.

View your app in AI Studio: https://ai.studio/apps/be3703f9-e6f0-496a-a51a-1e4c523f2388

## Run locally

**Prerequisites:** Node.js 20+

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` when using
   Gemini. Without a key, `/api/chat` returns an explicit development response.
3. Run `npm run dev`.

## Backend integration boundary

- `lib/contracts` owns transport-safe request, response, and error contracts.
- `lib/ports` defines the interfaces consumed by feature hooks.
- `lib/adapters` contains the current HTTP and browser implementations.
- `lib/server` contains provider SDK code and is never imported by client UI.
- `app/api/chat/route.ts` validates requests and maps provider failures to the
  shared error contract.

To connect an external backend, implement `ChatClientPort`,
`VoiceRecognitionPort`, or `VoiceSynthesisPort` and inject that adapter into the
corresponding feature hook. Keep credentials and provider SDKs in server-only
modules.

## Quality checks

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
