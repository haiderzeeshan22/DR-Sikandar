import { getBookingOptions } from "@/lib/appointments";
import { handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getBookingOptions());
  } catch (error) {
    return handleApiError(error);
  }
}
