import { ApiError } from "@/lib/api/errors";
import {
  parseApiErrorResponse,
  type ParseResult,
} from "@/lib/contracts/api";

export interface FetchClientOptions {
  baseUrl?: string;
  defaultTimeoutMs?: number;
  fetchImplementation?: typeof fetch;
}

export interface RequestOptions<TBody, TResponse> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  parse: (value: unknown) => ParseResult<TResponse>;
}

interface RequestSignal {
  signal: AbortSignal;
  timedOut: () => boolean;
  cleanup: () => void;
}

function createRequestSignal(
  externalSignal: AbortSignal | undefined,
  timeoutMs: number,
): RequestSignal {
  const controller = new AbortController();
  let abortSource: "external" | "timeout" | undefined;

  const abortFromExternalSignal = () => {
    if (!controller.signal.aborted) {
      abortSource = "external";
      controller.abort(externalSignal?.reason);
    }
  };

  if (externalSignal?.aborted) {
    abortFromExternalSignal();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternalSignal, {
      once: true,
    });
  }

  const timeoutId = setTimeout(() => {
    if (!controller.signal.aborted) {
      abortSource = "timeout";
      controller.abort();
    }
  }, timeoutMs);

  return {
    signal: controller.signal,
    timedOut: () => abortSource === "timeout",
    cleanup: () => {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromExternalSignal);
    },
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "The server returned invalid JSON.",
      502,
    );
  }
}

export class FetchClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: FetchClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 15_000;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async request<TBody, TResponse>(
    path: string,
    options: RequestOptions<TBody, TResponse>,
  ): Promise<TResponse> {
    const requestSignal = createRequestSignal(
      options.signal,
      options.timeoutMs ?? this.defaultTimeoutMs,
    );

    try {
      const headers = new Headers(options.headers);
      if (options.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
        method: options.method ?? "GET",
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: requestSignal.signal,
      });
      const payload = await readJson(response);

      if (!response.ok) {
        const parsedError = parseApiErrorResponse(payload);
        if (parsedError.ok) {
          throw new ApiError(
            parsedError.value.error.code,
            parsedError.value.error.message,
            response.status,
            { issues: parsedError.value.error.issues },
          );
        }
        throw new ApiError(
          "INVALID_RESPONSE",
          `Request failed with status ${response.status}.`,
          response.status,
        );
      }

      const parsedResponse = options.parse(payload);
      if (!parsedResponse.ok) {
        throw new ApiError(
          "INVALID_RESPONSE",
          "The server response did not match the expected contract.",
          502,
          { issues: parsedResponse.issues },
        );
      }

      return parsedResponse.value;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (requestSignal.signal.aborted) {
        if (requestSignal.timedOut()) {
          throw new ApiError("TIMEOUT", "The request timed out.", 408, {
            cause: error,
          });
        }
        throw new ApiError(
          "REQUEST_ABORTED",
          "The request was aborted.",
          499,
          { cause: error },
        );
      }
      throw new ApiError(
        "NETWORK_ERROR",
        "The server could not be reached.",
        503,
        { cause: error },
      );
    } finally {
      requestSignal.cleanup();
    }
  }
}
