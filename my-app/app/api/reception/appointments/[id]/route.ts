import { z } from "zod";
import { updateAppointmentStatus } from "@/lib/appointments";
import { getReceptionSession } from "@/lib/auth";
import {
  handleApiError,
  jsonError,
  readJsonBody,
} from "@/lib/api";
import { updateAppointmentSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getReceptionSession();

  if (!session) {
    return jsonError("Please sign in again to update appointments.", 401, {
      code: "unauthorized",
    });
  }

  const { id: rawId } = await params;
  const appointmentId = Number(rawId);

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return jsonError("Invalid appointment.", 400, { code: "invalid_id" });
  }

  const body = await readJsonBody(request);

  if (!body) {
    return jsonError("Choose an action for this appointment.", 400);
  }

  const parsed = updateAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return jsonError("Please check the appointment action.", 422, {
      code: "validation_error",
      fieldErrors: flattened.fieldErrors,
    });
  }

  try {
    const result = await updateAppointmentStatus(
      appointmentId,
      parsed.data.action,
      parsed.data.note,
    );

    return Response.json({
      message: "Appointment updated.",
      appointment: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
