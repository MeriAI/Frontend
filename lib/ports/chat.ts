import type {
  ChatRequest,
  ChatResponse,
} from "@/lib/contracts/chat";

export interface ChatCallOptions {
  signal?: AbortSignal;
}

/** Application-facing client boundary. Replace this to change API transports. */
export interface ChatClientPort {
  send(
    request: ChatRequest,
    options?: ChatCallOptions,
  ): Promise<ChatResponse>;
}

/** Server-facing provider boundary. Replace this to change model vendors. */
export interface ChatProviderPort {
  complete(
    request: ChatRequest,
    options?: ChatCallOptions,
  ): Promise<ChatResponse>;
}
