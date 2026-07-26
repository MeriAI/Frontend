import { isRecord, type ParseResult, type ValidationIssue } from "@/lib/contracts/api";

export interface MeriAiReady {
  ready: boolean;
  missingProviders: string[];
  reasonCode?: string;
  /** Backend `/readyz` provider map (`configured` | `missing` | `optional`). */
  providers?: Record<string, string>;
}

export interface MeriAiSession {
  sessionId: string;
}

export interface MeriAiService {
  identifier: string;
  label: string;
}

export interface SessionSnapshot {
  state?: string;
  checklist?: Checklist;
  missingQuestions: MissingQuestion[];
  actionProposal?: BrowserActionPreview;
}

export interface MissingQuestion {
  key: string;
  prompt: string;
  answerType: "choice" | "yes_no" | "text" | "number" | "date";
  options: Array<{ value: string; label: string }>;
}

export interface ChecklistItem {
  id: string;
  label: string;
  complete?: boolean;
  detail?: string;
}

export interface Checklist {
  title?: string;
  items: ChecklistItem[];
  verified: boolean;
}

export interface Citation {
  title: string;
  url: string;
}

export interface Research {
  warning: string;
  citations: Citation[];
}

export interface BrowserActionPreview {
  id: string;
  preview: string;
  toolName?: string;
  browserSessionId?: string;
}

export interface ActivityEntry {
  id: string;
  text: string;
  timestamp?: string;
}

export type MeriAiEvent =
  | { type: "session.ready"; sequence?: number; snapshot: SessionSnapshot }
  | { type: "assistant.message"; sequence?: number; text: string; verified: boolean; research?: Research; snapshot?: SessionSnapshot }
  | { type: "checklist.updated"; sequence?: number; checklist: Checklist; snapshot?: SessionSnapshot }
  | { type: "transcript.final"; sequence?: number; text: string }
  | { type: "speech.output"; sequence?: number; audioBase64?: string; mimeType?: string; status?: string; reasonCode?: string }
  | {
      type: "status";
      sequence?: number;
      status: string;
      reasonCode?: string;
      speechStatus?: string;
    }
  | { type: "action.result"; sequence?: number; entry?: ActivityEntry; snapshot?: SessionSnapshot }
  | { type: "error"; sequence?: number; code: string };

function string(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function sequence(value: Record<string, unknown>): number | undefined {
  return typeof value.sequence === "number" ? value.sequence : undefined;
}

function payloadOf(value: Record<string, unknown>): Record<string, unknown> {
  return isRecord(value.payload) ? value.payload : value;
}

function parseChecklist(payload: Record<string, unknown>): Checklist {
  const rawItems = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.checklist) ? payload.checklist : [];
  return {
    title: string(payload.title),
    verified: payload.verified_kb === true || payload.verified === true,
    items: rawItems.flatMap((item, index) => {
      if (typeof item === "string") return [{ id: String(index), label: item }];
      if (!isRecord(item)) return [];
      const label = string(item.label_en) ?? string(item.label_am) ?? string(item.label) ?? string(item.text) ?? string(item.title);
      return label
        ? [{ id: string(item.key) ?? string(item.id) ?? String(index), label, complete: item.status === "complete" || item.complete === true || item.checked === true, detail: string(item.explanation_en) ?? string(item.explanation_am) ?? string(item.detail) }]
        : [];
    }),
  };
}

function parseActionProposal(value: unknown): BrowserActionPreview | undefined {
  if (!isRecord(value)) return undefined;
  const id = string(value.tool_call_id) ?? string(value.id);
  const preview = string(value.preview) ?? string(value.summary) ?? string(value.description) ?? "Review the proposed action before continuing.";
  return id ? { id, preview, toolName: string(value.tool_name), browserSessionId: string(value.browser_session_id) } : undefined;
}

export function parseSessionSnapshot(value: unknown): SessionSnapshot | undefined {
  if (!isRecord(value)) return undefined;
  return {
    state: string(value.state),
    checklist: Array.isArray(value.checklist) ? parseChecklist(value) : isRecord(value.checklist) ? parseChecklist(value.checklist) : undefined,
    missingQuestions: Array.isArray(value.missing_questions) ? value.missing_questions.flatMap((question, index) => {
      if (typeof question === "string") return [{ key: String(index), prompt: question, answerType: "text", options: [] }];
      if (!isRecord(question)) return [];
      const key = string(question.key);
      const prompt = string(question.prompt_en) ?? string(question.prompt_am) ?? key;
      if (!key || !prompt) return [];
      const rawAnswerType = string(question.answer_type);
      const answerType = rawAnswerType === "choice" || rawAnswerType === "yes_no" || rawAnswerType === "number" || rawAnswerType === "date"
        ? rawAnswerType
        : "text";
      const options = Array.isArray(question.options) ? question.options.flatMap((option) => {
        if (!isRecord(option)) return [];
        const optionValue = string(option.value);
        const label = string(option.label_en) ?? string(option.label_am) ?? optionValue;
        return optionValue && label ? [{ value: optionValue, label }] : [];
      }) : [];
      return [{ key, prompt, answerType, options }];
    }) : [],
    actionProposal: parseActionProposal(value.action_proposal),
  };
}

function parseResearch(value: unknown): Research | undefined {
  if (!isRecord(value)) return undefined;
  const citations = (Array.isArray(value.citations) ? value.citations : []).flatMap((citation) => {
    if (!isRecord(citation)) return [];
    const url = string(citation.url) ?? string(citation.href);
    if (!url) return [];
    return [{ title: string(citation.title) ?? url, url }];
  });
  return {
    warning:
      string(value.warning) ??
      string(value.external_research) ??
      "External research: verify this information with its cited sources.",
    citations,
  };
}

function assistantMessageFromPayload(
  payload: Record<string, unknown>,
  eventSequence: number | undefined,
  text: string,
): MeriAiEvent {
  const action = parseActionProposal({
    tool_call_id: payload.tool_call_id,
    tool_name: payload.tool_name,
    browser_session_id: payload.browser_session_id,
    summary: text,
    preview: text,
  });
  return {
    type: "assistant.message",
    sequence: eventSequence,
    text,
    verified: payload.trust_level === "verified_kb",
    research: parseResearch(payload.research),
    snapshot: {
      ...(parseSessionSnapshot(payload) ?? { missingQuestions: [] }),
      ...(payload.tool_status === "pending_confirmation" && action
        ? { actionProposal: action }
        : {}),
    },
  };
}

/** Accepts both the documented event envelope and common flat event forms. */
export function parseMeriAiEvent(value: unknown): ParseResult<MeriAiEvent> {
  if (!isRecord(value)) return { ok: false, issues: [{ path: "$", message: "Expected an event object." }] };
  const type = string(value.type) ?? string(value.event);
  const payload = payloadOf(value);
  const eventSequence = sequence(value);
  const text =
    string(payload.text) ??
    string(payload.message) ??
    string(payload.transcript) ??
    string(payload.assistant_message) ??
    string(value.assistant_message);

  // REST `POST .../text` returns a flat SessionTextResponse with assistant_message.
  const restAssistant = string(value.assistant_message);
  if (!type && restAssistant) {
    return {
      ok: true,
      value: assistantMessageFromPayload(value, eventSequence, restAssistant),
    };
  }

  if (type === "session.ready") {
    return { ok: true, value: { type: "session.ready", sequence: eventSequence, snapshot: parseSessionSnapshot(payload) ?? { missingQuestions: [] } } };
  }
  if (type === "assistant.message") {
    return text
      ? { ok: true, value: assistantMessageFromPayload(payload, eventSequence, text) }
      : { ok: false, issues: [{ path: "payload.text", message: "Expected assistant text." }] };
  }
  if (type === "checklist.updated") return { ok: true, value: { type: "checklist.updated", sequence: eventSequence, checklist: parseChecklist(payload), snapshot: parseSessionSnapshot(payload) } };
  if (type === "transcript.final") return text ? { ok: true, value: { type: "transcript.final", sequence: eventSequence, text } } : { ok: false, issues: [{ path: "payload.transcript", message: "Expected transcript text." }] };
  if (type === "speech.output") {
    const audioBase64 = string(payload.audio_base64);
    const mimeType = string(payload.mime_type);
    return { ok: true, value: { type: "speech.output", sequence: eventSequence, audioBase64, mimeType, status: string(payload.status), reasonCode: string(payload.reason_code) } };
  }
  if (type === "status") {
    const status = string(payload.state) ?? string(payload.status);
    const speech = isRecord(payload.speech) ? payload.speech : undefined;
    return status
      ? {
          ok: true,
          value: {
            type: "status",
            sequence: eventSequence,
            status,
            reasonCode: string(payload.reason_code) ?? string(speech?.reason_code),
            speechStatus: string(speech?.status),
          },
        }
      : { ok: false, issues: [{ path: "payload.status", message: "Expected a status." }] };
  }
  if (type === "action.result") {
    const entryText = string(payload.text) ?? string(payload.message) ?? string(payload.summary);
    return { ok: true, value: { type: "action.result", sequence: eventSequence, entry: entryText ? { id: string(payload.id) ?? crypto.randomUUID(), text: entryText, timestamp: string(payload.timestamp) } : undefined, snapshot: parseSessionSnapshot(payload) } };
  }
  if (type === "error") return { ok: true, value: { type: "error", sequence: eventSequence, code: string(payload.code) ?? "request_failed" } };

  // REST text turns return a session snapshot instead of a WebSocket envelope.
  // Normalize it so typed chat and live voice share one rendering path.
  const assistantMessage = string(value.assistant_message);
  if (assistantMessage) {
    const action = parseActionProposal({ tool_call_id: value.tool_call_id, tool_name: value.tool_name, browser_session_id: value.browser_session_id, summary: assistantMessage });
    const snapshot = parseSessionSnapshot(value) ?? { missingQuestions: [] };
    return { ok: true, value: { type: "assistant.message", text: assistantMessage, verified: value.trust_level === "verified_kb", research: parseResearch(value.research), snapshot: { ...snapshot, ...(value.tool_status === "pending_confirmation" && action ? { actionProposal: action } : {}) } } };
  }
  const issues: ValidationIssue[] = [{ path: "type", message: `Unsupported MeriAI event: ${type ?? "missing"}.` }];
  return { ok: false, issues };
}

export function parseReady(value: unknown): ParseResult<MeriAiReady> {
  if (!isRecord(value)) return { ok: false, issues: [{ path: "$", message: "Expected readiness object." }] };
  const providers = isRecord(value.providers)
    ? Object.fromEntries(
        Object.entries(value.providers).flatMap(([name, status]) =>
          typeof status === "string" ? [[name, status]] : [],
        ),
      )
    : undefined;
  const missingFromList = Array.isArray(value.missing_providers)
    ? value.missing_providers.filter((provider): provider is string => typeof provider === "string")
    : [];
  const missingFromProviders = providers
    ? Object.entries(providers)
        .filter(([, status]) => status === "missing")
        .map(([name]) => name)
    : [];
  const missing = missingFromList.length > 0 ? missingFromList : missingFromProviders;
  const status = string(value.status);
  // Session creation requires `/readyz` status "ready" (DB + verified KB loaded).
  const ready = typeof value.ready === "boolean" ? value.ready : status === "ready";
  return {
    ok: true,
    value: {
      ready,
      missingProviders: missing,
      reasonCode: string(value.reason_code) ?? (status === "degraded" ? "degraded" : undefined),
      ...(providers ? { providers } : {}),
    },
  };
}

/** Voice is available when the API is ready and at least one speech path is configured. */
export function isVoiceReady(ready: MeriAiReady): boolean {
  if (!ready.ready) return false;
  if (ready.providers) {
    const addis =
      ready.providers.addis_ai === "configured" &&
      ready.providers.addis_ai_voice === "configured";
    const eleven = ready.providers.elevenlabs === "configured";
    return addis || eleven;
  }
  return ready.missingProviders.length === 0;
}

export function parseSession(value: unknown): ParseResult<MeriAiSession> {
  const sessionId = isRecord(value) ? string(value.session_id) : undefined;
  return sessionId ? { ok: true, value: { sessionId } } : { ok: false, issues: [{ path: "session_id", message: "Expected a session ID." }] };
}

export function parseServices(value: unknown): ParseResult<MeriAiService[]> {
  const raw = Array.isArray(value) ? value : isRecord(value) && Array.isArray(value.services) ? value.services : undefined;
  if (!raw) return { ok: false, issues: [{ path: "services", message: "Expected an active service list." }] };
  return { ok: true, value: raw.flatMap((service) => {
    if (!isRecord(service)) return [];
    const identifier = string(service.slug) ?? string(service.identifier) ?? string(service.service_identifier);
    const label = string(service.name_en) ?? string(service.name_am) ?? string(service.label) ?? string(service.name) ?? string(service.title);
    return identifier && label ? [{ identifier, label }] : [];
  }) };
}
