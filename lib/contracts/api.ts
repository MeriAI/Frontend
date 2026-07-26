export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "METHOD_NOT_ALLOWED"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "REQUEST_ABORTED"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE"
  | "INTERNAL_ERROR";

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  issues?: ValidationIssue[];
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const API_ERROR_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  "INVALID_REQUEST",
  "METHOD_NOT_ALLOWED",
  "UPSTREAM_ERROR",
  "TIMEOUT",
  "REQUEST_ABORTED",
  "NETWORK_ERROR",
  "INVALID_RESPONSE",
  "INTERNAL_ERROR",
]);

export function parseApiErrorResponse(value: unknown): ParseResult<ApiErrorResponse> {
  if (!isRecord(value) || !isRecord(value.error)) {
    return {
      ok: false,
      issues: [{ path: "error", message: "Expected an error object." }],
    };
  }

  const { code, message, issues } = value.error;
  if (typeof code !== "string" || !API_ERROR_CODES.has(code)) {
    return {
      ok: false,
      issues: [{ path: "error.code", message: "Unknown API error code." }],
    };
  }
  if (typeof message !== "string") {
    return {
      ok: false,
      issues: [{ path: "error.message", message: "Expected a string." }],
    };
  }

  const parsedIssues: ValidationIssue[] = [];
  if (issues !== undefined) {
    if (!Array.isArray(issues)) {
      return {
        ok: false,
        issues: [{ path: "error.issues", message: "Expected an array." }],
      };
    }
    for (let index = 0; index < issues.length; index += 1) {
      const issue = issues[index];
      if (
        !isRecord(issue) ||
        typeof issue.path !== "string" ||
        typeof issue.message !== "string"
      ) {
        return {
          ok: false,
          issues: [
            {
              path: `error.issues.${index}`,
              message: "Expected a validation issue.",
            },
          ],
        };
      }
      parsedIssues.push({ path: issue.path, message: issue.message });
    }
  }

  return {
    ok: true,
    value: {
      error: {
        code: code as ApiErrorCode,
        message,
        ...(parsedIssues.length > 0 ? { issues: parsedIssues } : {}),
      },
    },
  };
}
