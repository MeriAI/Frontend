import { FetchClient } from "@/lib/api/fetch-client";
import {
  parseChatResponse,
  type ChatRequest,
  type ChatResponse,
} from "@/lib/contracts/chat";
import type {
  ChatCallOptions,
  ChatClientPort,
} from "@/lib/ports/chat";

export interface HttpChatClientOptions {
  fetchClient?: FetchClient;
  endpoint?: string;
  timeoutMs?: number;
}

export class HttpChatClient implements ChatClientPort {
  private readonly fetchClient: FetchClient;
  private readonly endpoint: string;
  private readonly timeoutMs?: number;

  constructor(options: HttpChatClientOptions = {}) {
    this.fetchClient = options.fetchClient ?? new FetchClient();
    this.endpoint = options.endpoint ?? "/api/chat";
    this.timeoutMs = options.timeoutMs;
  }

  send(
    request: ChatRequest,
    options: ChatCallOptions = {},
  ): Promise<ChatResponse> {
    return this.fetchClient.request<ChatRequest, ChatResponse>(this.endpoint, {
      method: "POST",
      body: request,
      signal: options.signal,
      timeoutMs: this.timeoutMs,
      parse: parseChatResponse,
    });
  }
}

export const chatClient: ChatClientPort = new HttpChatClient();
