import type { Metadata } from "next";
import Link from "next/link";
import { StatusLookup } from "@/components/booking/StatusLookup";

export const metadata: Metadata = {
  title: "Track your appointment | Family Dental Clinic",
  description:
    "Check whether your dental appointment request has been approved by the clinic.",
};

export default async function AppointmentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const reference =
    typeof query.reference === "string" ? query.reference : "";

  return (
    <main className="relative overflow-hidden pb-20 pt-8 md:pb-28 md:pt-12">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,_rgba(93,214,255,0.14),_transparent_55%)]" />

      <div className="relative mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cyan-400)] hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to the clinic
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cyan-400)]">
            Appointment status
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
            Check your booking
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Enter the reference you received after requesting an appointment and
            the phone number used to book. You will see whether the clinic has
            approved, declined, or completed your visit.
          </p>
        </div>

        <div className="mt-8">
          <StatusLookup initialReference={reference} />
        </div>
      </div>
    </main>
  );
}
