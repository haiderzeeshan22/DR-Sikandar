import { z } from "zod";
import { createAppointment } from "@/lib/appointments";
import {
  handleApiError,
  jsonError,
  readJsonBody,
} from "@/lib/api";
import { createAppointmentSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body) {
    return jsonError("Send a valid appointment request.", 400);
  }

  const parsed = createAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);

    return jsonError("Please check the highlighted fields.", 422, {
      code: "validation_error",
      fieldErrors: flattened.fieldErrors,
    });
  }

  try {
    const appointment = await createAppointment(parsed.data);

    return Response.json(
      {
        message: "Appointment request received.",
        appointment,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
