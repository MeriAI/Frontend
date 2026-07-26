import { NextRequest, NextResponse } from "next/server";

import { ApiError, normalizeApiError } from "@/lib/api/errors";
import type { ApiErrorResponse } from "@/lib/contracts/api";
import {
  parseChatRequest,
  type ChatRequest,
  type ChatResponse,
} from "@/lib/contracts/chat";
import type { ChatProviderPort } from "@/lib/ports/chat";
import { createGeminiChatProvider } from "@/lib/server/gemini-chat-provider";

const DEVELOPMENT_FALLBACKS = {
  en: {
    chat:
      "Welcome to AI Service Desk. I can help you prepare for Ethiopian government services.",
    voice:
      "Welcome to AI Service Desk. Ask me about requirements, documents, fees, or next steps for Ethiopian government services.",
  },
  am: {
    chat:
      "ወደ AI Service Desk እንኳን በደህና መጡ። ለኢትዮጵያ የመንግስት አገልግሎቶች እንዲዘጋጁ ልረዳዎት እችላለሁ።",
    voice:
      "ወደ AI Service Desk እንኳን በደህና መጡ። ስለ አገልግሎቶቹ መስፈርቶች፣ ሰነዶች፣ ክፍያዎች ወይም ቀጣይ ደረጃዎች ይጠይቁኝ።",
  },
} as const;

function errorResponse(error: ApiError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(error.toResponse(), { status: error.status });
}

async function readRequest(request: NextRequest): Promise<ChatRequest> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (cause: unknown) {
    throw new ApiError("INVALID_REQUEST", "Request body must be valid JSON.", 400, {
      cause,
      issues: [{ path: "$", message: "Expected a valid JSON object." }],
    });
  }

  const parsed = parseChatRequest(payload);
  if (!parsed.ok) {
    throw new ApiError("INVALID_REQUEST", "Invalid chat request.", 400, {
      issues: parsed.issues,
    });
  }

  return parsed.value;
}

async function completeChat(
  provider: ChatProviderPort | null,
  request: ChatRequest,
  signal: AbortSignal,
): Promise<ChatResponse> {
  if (!provider) {
    return { text: DEVELOPMENT_FALLBACKS[request.language][request.mode] };
  }

  try {
    return await provider.complete(request, { signal });
  } catch (error: unknown) {
    throw normalizeApiError(error, {
      code: "UPSTREAM_ERROR",
      message: "The chat provider could not complete the request.",
      status: 502,
    });
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ChatResponse | ApiErrorResponse>> {
  try {
    const chatRequest = await readRequest(request);
    const provider = createGeminiChatProvider();
    const response = await completeChat(provider, chatRequest, request.signal);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const normalized = normalizeApiError(error);
    if (normalized.status >= 500) {
      console.error("Chat route error:", error);
    }
    return errorResponse(normalized);
  }
}
