import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const RECEPTION_SESSION_COOKIE = "reception_session";
export const RECEPTION_SESSION_TTL_SECONDS = 60 * 60 * 8;

type ReceptionSession = {
  role: "reception";
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== "production") {
      return "local-development-only-secret-change-this-in-env-local";
    }

    throw new Error("AUTH_SECRET must be at least 32 characters long.");
  }

  return secret;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createReceptionSessionToken(now = Date.now()) {
  const payload: ReceptionSession = {
    role: "reception",
    exp: Math.floor(now / 1000) + RECEPTION_SESSION_TTL_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyReceptionSessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, suppliedSignature] = token.split(".");
  if (!encodedPayload || !suppliedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<ReceptionSession>;

    if (
      payload.role !== "reception" ||
      typeof payload.exp !== "number" ||
      payload.exp * 1000 <= Date.now()
    ) {
      return null;
    }

    return payload as ReceptionSession;
  } catch {
    return null;
  }
}

export async function getReceptionSession() {
  const cookieStore = await cookies();
  return verifyReceptionSessionToken(
    cookieStore.get(RECEPTION_SESSION_COOKIE)?.value,
  );
}

export async function setReceptionSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(
    RECEPTION_SESSION_COOKIE,
    createReceptionSessionToken(),
    {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: RECEPTION_SESSION_TTL_SECONDS,
    },
  );
}

export async function clearReceptionSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(RECEPTION_SESSION_COOKIE);
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyReceptionPasscode(passcode: string) {
  const expectedPasscode = process.env.RECEPTION_PASSCODE;

  if (!expectedPasscode) {
    return false;
  }

  const supplied = hashValue(passcode);
  const expected = hashValue(expectedPasscode);

  return timingSafeEqual(supplied, expected);
}

type LoginAttempt = {
  count: number;
  windowStartedAt: number;
};

const loginAttempts = new Map<string, LoginAttempt>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

function pruneOldLoginAttempts(now: number) {
  if (loginAttempts.size < 100) {
    return;
  }

  for (const [key, attempt] of loginAttempts) {
    if (now - attempt.windowStartedAt > LOGIN_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}

export function checkLoginRateLimit(key: string) {
  const now = Date.now();
  pruneOldLoginAttempts(now);

  const attempt = loginAttempts.get(key);

  if (!attempt || now - attempt.windowStartedAt > LOGIN_WINDOW_MS) {
    return { allowed: true as const };
  }

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return {
      allowed: false as const,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((attempt.windowStartedAt + LOGIN_WINDOW_MS - now) / 1000),
      ),
    };
  }

  return { allowed: true as const };
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || now - attempt.windowStartedAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, windowStartedAt: now });
    return;
  }

  attempt.count += 1;
}

export function clearLoginFailures(key: string) {
  loginAttempts.delete(key);
}
