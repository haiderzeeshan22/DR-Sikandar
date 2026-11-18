import { z } from "zod";
import { handleApiError, jsonError, readJsonBody } from "@/lib/api";
import { createReview, listReviews } from "@/lib/reviews";
import { createReviewSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ reviews: await listReviews() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body) {
    return jsonError("Send a valid review.", 400);
  }

  const parsed = createReviewSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return jsonError("Please check the review fields.", 422, {
      code: "validation_error",
      fieldErrors: flattened.fieldErrors,
    });
  }

  try {
    const review = await createReview(parsed.data);
    return Response.json({ review }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
