import { FetchClient } from "@/lib/api/fetch-client";
import { parseReady, parseServices, parseSession, type MeriAiReady, type MeriAiService, type MeriAiSession } from "@/lib/contracts/meriai";

const DEFAULT_API_ORIGIN = "https://meriai-api.onrender.com";
const DEFAULT_REST_BASE_URL = "/api/meriai";

function configuredSocketBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_ORIGIN).replace(/\/$/, "");
}

export class MeriAiClient {
  private readonly restBaseUrl: string;
  private readonly socketBaseUrl: string;
  private readonly fetchClient: FetchClient;

  constructor(
    restBaseUrl = DEFAULT_REST_BASE_URL,
    socketBaseUrl = configuredSocketBaseUrl(),
  ) {
    this.restBaseUrl = restBaseUrl;
    this.socketBaseUrl = socketBaseUrl;
    this.fetchClient = new FetchClient({ baseUrl: restBaseUrl });
  }

  url(path: string): string { return `${this.restBaseUrl}${path}`; }
  ready(signal?: AbortSignal): Promise<MeriAiReady> { return this.fetchClient.request("/readyz", { signal, parse: parseReady }); }
  createSession(body: { language: string; mode: string; client_capabilities: Record<string, boolean> }): Promise<MeriAiSession> { return this.fetchClient.request("/api/sessions", { method: "POST", body, parse: parseSession }); }
  services(signal?: AbortSignal): Promise<MeriAiService[]> { return this.fetchClient.request("/api/services", { signal, parse: parseServices }); }
  getSessionState(sessionId: string): Promise<unknown> { return this.fetchClient.request(`/api/sessions/${encodeURIComponent(sessionId)}/state`, { parse: (value) => ({ ok: true, value }) }); }
  sendText(sessionId: string, body: Record<string, unknown>): Promise<unknown> { return this.fetchClient.request(`/api/sessions/${encodeURIComponent(sessionId)}/text`, { method: "POST", body, parse: (value) => ({ ok: true, value }) }); }
  confirm(sessionId: string, body: { tool_call_id: string; accepted: boolean; confirmation_text: string }): Promise<unknown> { return this.fetchClient.request(`/api/sessions/${encodeURIComponent(sessionId)}/confirm`, { method: "POST", body, parse: (value) => ({ ok: true, value }) }); }
  webSocketUrl(sessionId: string): string { return `${this.socketBaseUrl.replace(/^http/, "ws")}/ws/v1/sessions/${encodeURIComponent(sessionId)}`; }
}

// This client has no user-specific state. Sharing one instance prevents
// duplicate configuration and makes request ownership explicit in the hook.
export const meriAiClient = new MeriAiClient();
