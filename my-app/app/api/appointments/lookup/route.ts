import { lookupAppointment } from "@/lib/appointments";
import { handleApiError, jsonError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference")?.trim() ?? "";
  const phone = searchParams.get("phone")?.trim() ?? "";

  if (!reference || !phone) {
    return jsonError(
      "Enter your booking reference and phone number.",
      400,
      { code: "missing_fields" },
    );
  }

  try {
    const appointment = await lookupAppointment(reference, phone);
    return Response.json({ appointment });
  } catch (error) {
    return handleApiError(error);
  }
}
