import type {
  ApiErrorCode,
  ApiErrorResponse,
  ValidationIssue,
} from "@/lib/contracts/api";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly issues?: ValidationIssue[];

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    options?: { cause?: unknown; issues?: ValidationIssue[] },
  ) {
    super(message, { cause: options?.cause });
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.issues = options?.issues;
  }

  toResponse(): ApiErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.issues && this.issues.length > 0
          ? { issues: this.issues }
          : {}),
      },
    };
  }
}

export function normalizeApiError(
  error: unknown,
  fallback: {
    code: ApiErrorCode;
    message: string;
    status: number;
  } = {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
    status: 500,
  },
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError("REQUEST_ABORTED", "The request was aborted.", 499, {
      cause: error,
    });
  }

  return new ApiError(fallback.code, fallback.message, fallback.status, {
    cause: error,
  });
}
