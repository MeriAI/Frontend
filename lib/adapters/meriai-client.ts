import { FetchClient } from "@/lib/api/fetch-client";
import {
  parseReady,
  parseServices,
  parseSession,
  type MeriAiReady,
  type MeriAiService,
  type MeriAiSession,
} from "@/lib/contracts/meriai";

const DEFAULT_API_ORIGIN = "https://meriai-api.onrender.com";
/** Same-origin Next.js rewrite prefix (see next.config.ts). */
const DEFAULT_REST_BASE_URL = "/api/meriai";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Browser REST base.
 * - Absolute upstream: https://meriai-api.onrender.com
 * - Same-origin proxy (default): /api/meriai → rewritten to API_BASE_URL
 */
function configuredRestBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }
  return DEFAULT_REST_BASE_URL;
}

/**
 * WebSocket must target the real API origin. Relative proxy bases cannot carry WS.
 */
function configuredSocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL?.trim();
  if (explicit && isAbsoluteHttpUrl(explicit)) {
    return trimTrailingSlash(explicit);
  }
  const rest = configuredRestBaseUrl();
  if (isAbsoluteHttpUrl(rest)) {
    return rest;
  }
  return DEFAULT_API_ORIGIN;
}

export class MeriAiClient {
  private readonly restBaseUrl: string;
  private readonly socketBaseUrl: string;
  private readonly fetchClient: FetchClient;

  constructor(
    restBaseUrl = configuredRestBaseUrl(),
    socketBaseUrl = configuredSocketBaseUrl(),
  ) {
    this.restBaseUrl = restBaseUrl;
    this.socketBaseUrl = socketBaseUrl;
    this.fetchClient = new FetchClient({ baseUrl: restBaseUrl });
  }

  url(path: string): string {
    return `${this.restBaseUrl}${path}`;
  }

  ready(signal?: AbortSignal): Promise<MeriAiReady> {
    return this.fetchClient.request("/readyz", { signal, parse: parseReady });
  }

  createSession(body: {
    language: string;
    mode: string;
    client_capabilities: Record<string, boolean>;
  }): Promise<MeriAiSession> {
    return this.fetchClient.request("/api/sessions", {
      method: "POST",
      body,
      parse: parseSession,
    });
  }

  services(signal?: AbortSignal): Promise<MeriAiService[]> {
    return this.fetchClient.request("/api/services", {
      signal,
      parse: parseServices,
    });
  }

  getSessionState(sessionId: string): Promise<unknown> {
    return this.fetchClient.request(
      `/api/sessions/${encodeURIComponent(sessionId)}/state`,
      { parse: (value) => ({ ok: true, value }) },
    );
  }

  sendText(sessionId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.fetchClient.request(
      `/api/sessions/${encodeURIComponent(sessionId)}/text`,
      { method: "POST", body, parse: (value) => ({ ok: true, value }) },
    );
  }

  confirm(
    sessionId: string,
    body: { tool_call_id: string; accepted: boolean; confirmation_text: string },
  ): Promise<unknown> {
    return this.fetchClient.request(
      `/api/sessions/${encodeURIComponent(sessionId)}/confirm`,
      { method: "POST", body, parse: (value) => ({ ok: true, value }) },
    );
  }

  webSocketUrl(sessionId: string): string {
    const wsOrigin = this.socketBaseUrl.replace(/^http/i, "ws");
    return `${wsOrigin}/ws/v1/sessions/${encodeURIComponent(sessionId)}`;
  }
}

// Shared instance — no user-specific state; keeps request ownership explicit in the hook.
export const meriAiClient = new MeriAiClient();
