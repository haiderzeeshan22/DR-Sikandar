import { clearReceptionSessionCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearReceptionSessionCookie();
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
