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
  /** Frontend codes or stable MeriAI backend `detail.code` values. */
  code: string;
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

function parseValidationIssues(
  issues: unknown,
  pathPrefix: string,
): ParseResult<ValidationIssue[]> {
  if (issues === undefined) {
    return { ok: true, value: [] };
  }
  if (!Array.isArray(issues)) {
    return {
      ok: false,
      issues: [{ path: pathPrefix, message: "Expected an array." }],
    };
  }
  const parsedIssues: ValidationIssue[] = [];
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
            path: `${pathPrefix}.${index}`,
            message: "Expected a validation issue.",
          },
        ],
      };
    }
    parsedIssues.push({ path: issue.path, message: issue.message });
  }
  return { ok: true, value: parsedIssues };
}

export function parseApiErrorResponse(value: unknown): ParseResult<ApiErrorResponse> {
  if (!isRecord(value)) {
    return {
      ok: false,
      issues: [{ path: "$", message: "Expected an error object." }],
    };
  }

  // Frontend-shaped errors: { error: { code, message, issues? } }
  if (isRecord(value.error)) {
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
    const parsedIssues = parseValidationIssues(issues, "error.issues");
    if (!parsedIssues.ok) {
      return parsedIssues;
    }
    return {
      ok: true,
      value: {
        error: {
          code,
          message,
          ...(parsedIssues.value.length > 0 ? { issues: parsedIssues.value } : {}),
        },
      },
    };
  }

  // MeriAI FastAPI errors: { detail: { code, message } }
  if (isRecord(value.detail)) {
    const { code, message } = value.detail;
    if (typeof code === "string" && typeof message === "string") {
      return { ok: true, value: { error: { code, message } } };
    }
  }

  // FastAPI string / validation-array detail
  if (typeof value.detail === "string" && value.detail.length > 0) {
    return {
      ok: true,
      value: { error: { code: "INVALID_REQUEST", message: value.detail } },
    };
  }
  if (Array.isArray(value.detail) && value.detail.length > 0) {
    return {
      ok: true,
      value: {
        error: {
          code: "INVALID_REQUEST",
          message: "The request failed validation.",
        },
      },
    };
  }

  return {
    ok: false,
    issues: [{ path: "error", message: "Expected an error object." }],
  };
}
