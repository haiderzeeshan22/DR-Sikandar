import "server-only";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "invalid_request") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function jsonError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
) {
  return Response.json({ error: message, ...extra }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status, { code: error.code });
  }

  console.error("Unexpected API error:", error);
  return jsonError(
    "Something went wrong on the clinic server. Please try again.",
    500,
    { code: "internal_error" },
  );
}

export async function readJsonBody(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "local";
}
