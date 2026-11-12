"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatDateLabel,
  formatSlotRange,
  formatTimestampLabel,
} from "@/lib/scheduling";
import type { AppointmentStatus, PublicAppointment } from "@/lib/types";

const STATUS_CONTENT: Record<
  AppointmentStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Waiting for clinic approval",
    description:
      "Reception has received your request. The booking is not confirmed yet; please wait for the clinic to approve it.",
  },
  approved: {
    title: "Your appointment is confirmed",
    description:
      "The clinic has approved this booking. Please arrive a few minutes before your appointment time.",
  },
  declined: {
    title: "The clinic could not accept this request",
    description:
      "This time may no longer be available. Please call the clinic or submit a new request for another time.",
  },
  completed: {
    title: "This appointment is complete",
    description:
      "Thank you for visiting Family Dental Clinic. Contact us if you need a follow-up appointment.",
  },
  cancelled: {
    title: "This appointment was cancelled",
    description:
      "The clinic cancelled this booking. Please call us if you would like to arrange another time.",
  },
};

const inputClasses =
  "min-h-12 w-full rounded-xl border border-white/10 bg-[#0b2038] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition focus:border-[var(--cyan-400)]/60 focus:ring-2 focus:ring-[var(--cyan-400)]/20";

function Progress({ status }: { status: AppointmentStatus }) {
  const stopped = status === "declined" || status === "cancelled";
  const approved = status === "approved" || status === "completed";

  const steps = [
    { label: "Request sent", state: "complete" as const },
    {
      label: "Clinic approval",
      state: stopped
        ? ("stopped" as const)
        : approved
          ? ("complete" as const)
          : ("current" as const),
    },
    {
      label: "Visit",
      state:
        status === "completed"
          ? ("complete" as const)
          : status === "approved"
            ? ("current" as const)
            : ("upcoming" as const),
    },
  ];

  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((step, index) => (
        <li key={step.label} className="relative">
          {index < steps.length - 1 ? (
            <span
              className={`absolute left-1/2 top-4 h-px w-full ${
                step.state === "complete" ? "bg-emerald-400/50" : "bg-white/10"
              }`}
              aria-hidden="true"
            />
          ) : null}
          <div className="relative flex flex-col items-center text-center">
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                step.state === "complete"
                  ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                  : step.state === "current"
                    ? "border-[var(--cyan-400)]/50 bg-[var(--cyan-400)]/15 text-[var(--cyan-400)]"
                    : step.state === "stopped"
                      ? "border-rose-400/40 bg-rose-400/15 text-rose-300"
                      : "border-white/10 bg-white/5 text-white/40",
              ].join(" ")}
            >
              {step.state === "complete" ? "✓" : step.state === "stopped" ? "×" : index + 1}
            </span>
            <span className="mt-2 text-[11px] leading-4 text-[var(--muted)] sm:text-xs">
              {step.label}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StatusLookup({
  initialReference = "",
}: {
  initialReference?: string;
}) {
  const [reference, setReference] = useState(initialReference.toUpperCase());
  const [phone, setPhone] = useState("");
  const [appointment, setAppointment] = useState<PublicAppointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        reference: reference.trim(),
        phone: phone.trim(),
      });

      const response = await fetch(
        `/api/appointments/lookup?${params.toString()}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        setAppointment(null);
        setError(
          payload.error ||
            "We could not find that appointment. Check your reference and phone number.",
        );
        return;
      }

      setAppointment(payload.appointment as PublicAppointment);
    } catch {
      setAppointment(null);
      setError(
        "We could not reach the clinic server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAppointment(null);
    setError("");
    setReference("");
    setPhone("");
  }

  if (appointment) {
    const content = STATUS_CONTENT[appointment.status];

    return (
      <div className="space-y-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cyan-400)]">
                {appointment.referenceCode}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {content.title}
              </h2>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {content.description}
          </p>

          <div className="mt-6">
            <Progress status={appointment.status} />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 sm:p-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Patient
              </dt>
              <dd className="mt-1 text-white">{appointment.patientName}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Doctor
              </dt>
              <dd className="mt-1 text-white">{appointment.doctorName}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Service
              </dt>
              <dd className="mt-1 text-white">{appointment.serviceName}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Appointment
              </dt>
              <dd className="mt-1 text-white">
                {formatDateLabel(appointment.appointmentDate)} ·{" "}
                {formatSlotRange(appointment.appointmentTime)}
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Requested
              </dt>
              <dd className="mt-1 text-white">
                {formatTimestampLabel(appointment.createdAt)}
              </dd>
            </div>
            {appointment.notes ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Your notes
                </dt>
                <dd className="mt-1 whitespace-pre-line leading-6 text-white">
                  {appointment.notes}
                </dd>
              </div>
            ) : null}
            {appointment.clinicNote ? (
              <div className="rounded-xl border border-[var(--cyan-400)]/20 bg-[var(--cyan-400)]/[0.06] p-3 sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--cyan-400)]">
                  Note from the clinic
                </dt>
                <dd className="mt-1 whitespace-pre-line leading-6 text-white">
                  {appointment.clinicNote}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={reset} className="w-full justify-center sm:w-auto">
              Check another appointment
            </Button>
            <Button href="/#book" className="w-full justify-center sm:w-auto">
              Book an appointment
            </Button>
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
            Need help? Call{" "}
            <a href="tel:03049420496" className="text-[var(--cyan-400)] hover:text-white">
              0304 9420496
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="status-reference"
            className="mb-2 block text-sm font-medium text-white"
          >
            Booking reference
          </label>
          <input
            id="status-reference"
            name="reference"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="FD-XXXXXX"
            value={reference}
            onChange={(event) => setReference(event.target.value.toUpperCase())}
            className={`${inputClasses} font-mono uppercase tracking-wider`}
            required
          />
        </div>
        <div>
          <label
            htmlFor="status-phone"
            className="mb-2 block text-sm font-medium text-white"
          >
            Phone number used to book
          </label>
          <input
            id="status-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0304 1234567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClasses}
            required
          />
        </div>
      </div>

      {error ? (
        <div
          className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-6 text-rose-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Checking…
          </>
        ) : (
          "Check appointment status"
        )}
      </Button>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
        Already have a booking? Enter the reference shown after you submitted
        your request.{" "}
        <Link href="/#book" className="text-[var(--cyan-400)] hover:text-white">
          Need to book?
        </Link>
      </p>
    </form>
  );
}
