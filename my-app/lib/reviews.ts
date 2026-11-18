import "server-only";
import { query } from "@/lib/db";

export type ClinicReview = {
  id: number;
  name: string;
  rating: number;
  review: string;
  createdAt: string;
};

type ReviewRow = {
  id: string | number;
  name: string;
  rating: number;
  review: string;
  created_at: Date | string;
};

function mapReview(row: ReviewRow): ClinicReview {
  return {
    id: Number(row.id),
    name: row.name,
    rating: row.rating,
    review: row.review,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

export async function listReviews(): Promise<ClinicReview[]> {
  const result = await query<ReviewRow>(
    `select id, name, rating, review, created_at
     from reviews
     order by created_at desc
     limit 12`,
  );

  return result.rows.map(mapReview);
}

export async function createReview(input: Omit<ClinicReview, "id" | "createdAt">) {
  const result = await query<ReviewRow>(
    `insert into reviews (name, rating, review)
     values ($1, $2, $3)
     returning id, name, rating, review, created_at`,
    [input.name, input.rating, input.review],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("The review could not be saved.");
  }

  return mapReview(row);
}
