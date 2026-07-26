import { describe, expect, it } from "vitest";

import { parseMeriAiEvent, parseReady, parseServices, parseSession, parseSessionSnapshot } from "@/lib/contracts/meriai";

describe("MeriAI contracts", () => {
  it("parses the readiness and opaque session responses", () => {
    expect(parseReady({ ready: true, missing_providers: [] })).toEqual({ ok: true, value: { ready: true, missingProviders: [], reasonCode: undefined } });
    expect(parseSession({ session_id: "opaque-session" })).toEqual({ ok: true, value: { sessionId: "opaque-session" } });
  });

  it("normalizes ordered assistant, checklist, and voice events", () => {
    expect(parseMeriAiEvent({ type: "assistant.message", sequence: 2, payload: { text: "Bring your ID." } })).toMatchObject({ ok: true, value: { type: "assistant.message", sequence: 2, text: "Bring your ID." } });
    expect(parseMeriAiEvent({ type: "checklist.updated", payload: { verified_kb: true, items: [{ id: "id", label: "National ID", checked: true }] } })).toMatchObject({ ok: true, value: { checklist: { verified: true, items: [{ id: "id", label: "National ID", complete: true }] } } });
    expect(parseMeriAiEvent({ type: "speech.output", payload: { audio_base64: "YQ==", mime_type: "audio/webm" } })).toMatchObject({ ok: true, value: { type: "speech.output", audioBase64: "YQ==", mimeType: "audio/webm" } });
  });

  it("retains research warnings and action previews as structured UI data", () => {
    expect(parseMeriAiEvent({ type: "assistant.message", payload: { text: "Here is external context.", research: { external_research: "Not verified guidance.", citations: [{ title: "Official portal", url: "https://example.gov" }] } } })).toMatchObject({ ok: true, value: { research: { warning: "Not verified guidance.", citations: [{ title: "Official portal" }] } } });
    expect(parseMeriAiEvent({ type: "assistant.message", payload: { text: "Ready to continue.", action_proposal: { tool_call_id: "go", summary: "Open passport portal" } } })).toMatchObject({ ok: true, value: { snapshot: { actionProposal: { id: "go", preview: "Open passport portal" } } } });
  });

  it("uses service slugs and structured snapshots from the authoritative API contract", () => {
    expect(parseServices({ services: [{ id: "svc_passport_et", slug: "ethiopian-passport", name_en: "Ethiopian Passport Service" }] })).toEqual({ ok: true, value: [{ identifier: "ethiopian-passport", label: "Ethiopian Passport Service" }] });
    expect(parseSessionSnapshot({ checklist: [{ key: "renewed_kebele_id", status: "needed", label_en: "Renewed Kebele ID" }], missing_questions: [{ key: "age_band", prompt_en: "Are you under 40?", options: [{ value: "under_40", label_en: "Yes" }] }] })).toMatchObject({ checklist: { items: [{ id: "renewed_kebele_id", label: "Renewed Kebele ID" }] }, missingQuestions: [{ key: "age_band", prompt: "Are you under 40?", options: [{ value: "under_40", label: "Yes" }] }] });
  });
});
