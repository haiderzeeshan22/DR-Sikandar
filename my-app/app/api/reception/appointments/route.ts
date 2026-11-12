import { listReceptionAppointments } from "@/lib/appointments";
import { getReceptionSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getReceptionSession();

  if (!session) {
    return jsonError("Please sign in to view appointment requests.", 401, {
      code: "unauthorized",
    });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.trim() ?? "";
  const date = searchParams.get("date")?.trim() ?? "";
  const search = searchParams.get("search")?.trim() ?? "";

  const status: AppointmentStatus | "all" =
    statusParam === "all" || !statusParam
      ? "all"
      : (statusParam as AppointmentStatus);

  if (status !== "all" && !APPOINTMENT_STATUSES.includes(status)) {
    return jsonError("Invalid status filter.", 400, { code: "invalid_status" });
  }

  try {
    const result = await listReceptionAppointments({
      status,
      date: date || undefined,
      search: search || undefined,
    });

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
