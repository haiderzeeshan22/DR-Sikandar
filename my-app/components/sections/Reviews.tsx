"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ClinicReview } from "@/lib/reviews";

type ReviewErrors = Record<string, string[] | undefined>;

const fieldClasses =
  "min-h-12 w-full rounded-xl border border-white/10 bg-[#0b2038] px-4 py-3 text-base text-white outline-none transition focus:border-[var(--cyan-400)]/60 focus:ring-2 focus:ring-[var(--cyan-400)]/20";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-lg tracking-wide text-amber-300" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-white/20">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<ClinicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews", { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Could not load reviews.");
        }
        setReviews(payload.reviews as ClinicReview[]);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLoadError("Reviews could not be loaded right now. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadReviews();
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, review }),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (payload.fieldErrors) {
          setErrors(payload.fieldErrors as ReviewErrors);
        }
        setFormError(payload.error || "Your review could not be submitted. Please try again.");
        return;
      }

      setReviews((current) => [payload.review as ClinicReview, ...current].slice(0, 12));
      setName("");
      setRating("5");
      setReview("");
      setSuccess("Thank you — your review has been added.");
    } catch {
      setFormError("We could not reach the clinic server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient reviews"
          title="Share your experience."
          description="Your feedback helps our team keep improving care for every patient."
          align="center"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {loading ? (
              <p className="text-sm text-[var(--muted)]" role="status">Loading reviews…</p>
            ) : loadError ? (
              <p className="text-sm text-rose-200" role="alert">{loadError}</p>
            ) : reviews.length ? (
              reviews.slice(0, 6).map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-5"
                >
                  <Stars rating={item.rating} />
                  <p className="mt-3 break-words text-sm leading-6 text-[var(--soft-white)]">
                    {item.review}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-white">{item.name}</p>
                  <time
                    className="mt-1 block text-xs text-[var(--muted)]"
                    dateTime={item.createdAt}
                  >
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                      new Date(item.createdAt),
                    )}
                  </time>
                </article>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No reviews yet. Be the first to share your experience.
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel h-fit rounded-3xl p-5 sm:p-6"
          >
            <h3 className="text-xl font-semibold text-white">Leave a review</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Reviews appear on this page as soon as they are submitted.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="review-name" className="mb-2 block text-sm font-medium text-white">
                  Your name
                </label>
                <input
                  id="review-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClasses}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
                {errors.name?.[0] ? <p className="mt-2 text-sm text-rose-300">{errors.name[0]}</p> : null}
              </div>

              <div>
                <label htmlFor="review-rating" className="mb-2 block text-sm font-medium text-white">
                  Rating
                </label>
                <select
                  id="review-rating"
                  name="rating"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className={`${fieldClasses} [color-scheme:dark]`}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>
                {errors.rating?.[0] ? <p className="mt-2 text-sm text-rose-300">{errors.rating[0]}</p> : null}
              </div>

              <div>
                <label htmlFor="review-message" className="mb-2 block text-sm font-medium text-white">
                  Your experience
                </label>
                <textarea
                  id="review-message"
                  name="review"
                  rows={4}
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  className={`${fieldClasses} resize-y`}
                  maxLength={1200}
                  required
                />
                <p className="mt-1 text-right text-xs text-[var(--muted)]">{review.length}/1200</p>
                {errors.review?.[0] ? <p className="mt-2 text-sm text-rose-300">{errors.review[0]}</p> : null}
              </div>

              {formError ? <p className="text-sm text-rose-200" role="alert">{formError}</p> : null}
              {success ? <p className="text-sm text-emerald-300" role="status">{success}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="min-h-12 w-full rounded-xl bg-[var(--primary-500)] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
