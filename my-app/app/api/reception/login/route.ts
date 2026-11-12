import { z } from "zod";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
  setReceptionSessionCookie,
  verifyReceptionPasscode,
} from "@/lib/auth";
import {
  getClientIp,
  handleApiError,
  jsonError,
  readJsonBody,
} from "@/lib/api";
import { receptionLoginSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkLoginRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many sign-in attempts. Please wait a few minutes and try again.",
        code: "rate_limited",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = await readJsonBody(request);

  if (!body) {
    return jsonError("Enter the reception passcode.", 400);
  }

  const parsed = receptionLoginSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return jsonError("Enter the reception passcode.", 400, {
      fieldErrors: flattened.fieldErrors,
    });
  }

  if (!verifyReceptionPasscode(parsed.data.passcode)) {
    recordLoginFailure(clientIp);
    await new Promise((resolve) => setTimeout(resolve, 350));

    return jsonError("The passcode is incorrect.", 401, {
      code: "invalid_passcode",
    });
  }

  try {
    clearLoginFailures(clientIp);
    await setReceptionSessionCookie();

    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
