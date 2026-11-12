import { getAvailability } from "@/lib/appointments";
import { handleApiError, jsonError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = Number(searchParams.get("doctorId"));
  const date = searchParams.get("date")?.trim() ?? "";

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return jsonError("Choose a doctor to check availability.", 400);
  }

  if (!date) {
    return jsonError("Choose a date to check availability.", 400);
  }

  try {
    const slots = await getAvailability(doctorId, date);
    return Response.json({ doctorId, date, slots });
  } catch (error) {
    return handleApiError(error);
  }
}
