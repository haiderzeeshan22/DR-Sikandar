"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  addDaysISO,
  formatDateLabel,
  formatSlotRange,
  getClinicToday,
  MAX_ADVANCE_DAYS,
  validateAppointmentDate,
} from "@/lib/scheduling";
import type {
  BookingOptions,
  PublicAppointment,
  SlotAvailability,
} from "@/lib/types";

type FormState = {
  patientName: string;
  phone: string;
  email: string;
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
};

type FieldErrors = Record<string, string[] | undefined>;

const EMPTY_FORM: FormState = {
  patientName: "",
  phone: "",
  email: "",
  doctorId: "",
  serviceId: "",
  appointmentDate: "",
  appointmentTime: "",
  notes: "",
};

const inputClasses =
  "min-h-12 w-full rounded-xl border border-white/10 bg-[#0b2038] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition focus:border-[var(--cyan-400)]/60 focus:ring-2 focus:ring-[var(--cyan-400)]/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelClasses = "mb-2 block text-sm font-medium text-white";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p className="mt-2 text-sm text-rose-300" role="alert">
      {messages[0]}
    </p>
  );
}

export function AppointmentForm() {
  const [options, setOptions] = useState<BookingOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<PublicAppointment | null>(null);

  const dateBounds = useMemo(() => {
    const today = getClinicToday();
    return { today, max: addDaysISO(today, MAX_ADVANCE_DAYS) };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      setOptionsLoading(true);
      setOptionsError("");

      try {
        const response = await fetch("/api/booking-options", {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Could not load booking options.");
        }

        setOptions(payload as BookingOptions);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setOptionsError(
            "We could not load the doctors and services. Please refresh the page.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setOptionsLoading(false);
        }
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      doctorId: form.doctorId,
      date: form.appointmentDate,
    });

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError("");

      try {
        const response = await fetch(
          `/api/appointments/availability?${params.toString()}`,
          { signal: controller.signal },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Could not load available times.");
        }

        setSlots(payload.slots as SlotAvailability[]);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSlots([]);
          setSlotsError(
            error instanceof Error
              ? error.message
              : "Could not load available times.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [form.doctorId, form.appointmentDate, availabilityVersion]);

  const selectedService = useMemo(
    () =>
      options?.services.find((service) => String(service.id) === form.serviceId),
    [options, form.serviceId],
  );

  const visibleSlots = useMemo(
    () => slots.filter((slot) => !slot.past),
    [slots],
  );

  function updateField(field: keyof FormState, value: string) {
    if (field === "doctorId" || field === "appointmentDate") {
      setSlots([]);
      setSlotsError("");
      setSlotsLoading(false);
    }

    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "doctorId" || field === "appointmentDate") {
        next.appointmentTime = "";
      }

      return next;
    });

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError("");
  }

  function validateForm() {
    const errors: FieldErrors = {};

    if (form.patientName.trim().length < 2) {
      errors.patientName = ["Enter the patient's full name."];
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      errors.phone = ["Enter a valid phone number."];
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      errors.email = ["Enter a valid email address."];
    }

    if (!form.doctorId) {
      errors.doctorId = ["Choose a doctor."];
    }

    if (!form.serviceId) {
      errors.serviceId = ["Choose a service."];
    }

    const dateValidation = validateAppointmentDate(form.appointmentDate);
    if (!form.appointmentDate) {
      errors.appointmentDate = ["Choose an appointment date."];
    } else if (!dateValidation.ok) {
      errors.appointmentDate = [dateValidation.message];
    }

    if (!form.appointmentTime) {
      errors.appointmentTime = ["Choose an appointment time."];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          doctorId: Number(form.doctorId),
          serviceId: Number(form.serviceId),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload.fieldErrors) {
          setFieldErrors(payload.fieldErrors as FieldErrors);
        }

        if (payload.code === "slot_taken" || payload.code === "slot_unavailable") {
          setForm((current) => ({ ...current, appointmentTime: "" }));
          setAvailabilityVersion((version) => version + 1);
        }

        setFormError(
          payload.error || "The appointment could not be requested. Please try again.",
        );
        return;
      }

      setConfirmation(payload.appointment as PublicAppointment);
      window.scrollTo({ top: window.scrollY - 80, behavior: "smooth" });
    } catch {
      setFormError(
        "We could not reach the clinic server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function bookAnother() {
    setConfirmation(null);
    setForm((current) => ({
      ...EMPTY_FORM,
      patientName: current.patientName,
      phone: current.phone,
      email: current.email,
    }));
    setFieldErrors({});
    setFormError("");
    setSlots([]);
  }

  if (confirmation) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-400/25 bg-emerald-400/[0.06] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-2xl text-emerald-300">
              ✓
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">
              Request received
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
              Your appointment request has been sent to the clinic. Reception
              will review it and approve or decline the booking.
            </p>
          </div>
          <StatusBadge status={confirmation.status} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#081a2f] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Booking reference
          </p>
          <p className="mt-2 break-all font-mono text-2xl font-semibold tracking-[0.08em] text-white">
            {confirmation.referenceCode}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Save this reference. You will need it and your phone number to check
            the status later.
          </p>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Patient
            </dt>
            <dd className="mt-1 text-white">{confirmation.patientName}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Doctor
            </dt>
            <dd className="mt-1 text-white">{confirmation.doctorName}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Service
            </dt>
            <dd className="mt-1 text-white">{confirmation.serviceName}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Requested time
            </dt>
            <dd className="mt-1 text-white">
              {formatDateLabel(confirmation.appointmentDate)} at{" "}
              {formatSlotRange(confirmation.appointmentTime).split(" – ")[0]}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            href={`/appointment-status?reference=${encodeURIComponent(confirmation.referenceCode)}`}
            className="w-full justify-center sm:w-auto"
          >
            Check appointment status
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={bookAnother}
            className="w-full justify-center sm:w-auto"
          >
            Book another appointment
          </Button>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Need to change something? Call the clinic at{" "}
          <a href="tel:03049420496" className="text-[var(--cyan-400)] hover:text-white">
            0304 9420496
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {optionsError ? (
        <div
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200"
          role="alert"
        >
          {optionsError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className={labelClasses}>
            Full name <span className="text-[var(--cyan-400)]">*</span>
          </label>
          <input
            id="booking-name"
            name="patientName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Ayesha Khan"
            value={form.patientName}
            onChange={(event) => updateField("patientName", event.target.value)}
            className={inputClasses}
            aria-invalid={Boolean(fieldErrors.patientName)}
            aria-describedby={
              fieldErrors.patientName ? "booking-name-error" : undefined
            }
            required
          />
          <div id="booking-name-error">
            <FieldError messages={fieldErrors.patientName} />
          </div>
        </div>

        <div>
          <label htmlFor="booking-phone" className={labelClasses}>
            Phone number <span className="text-[var(--cyan-400)]">*</span>
          </label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0304 1234567"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={inputClasses}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? "booking-phone-error" : undefined
            }
            required
          />
          <div id="booking-phone-error">
            <FieldError messages={fieldErrors.phone} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="booking-email" className={labelClasses}>
          Email <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <input
          id="booking-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "booking-email-error" : undefined}
        />
        <div id="booking-email-error">
          <FieldError messages={fieldErrors.email} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-doctor" className={labelClasses}>
            Doctor <span className="text-[var(--cyan-400)]">*</span>
          </label>
          <select
            id="booking-doctor"
            name="doctorId"
            value={form.doctorId}
            onChange={(event) => updateField("doctorId", event.target.value)}
            className={inputClasses}
            disabled={optionsLoading}
            aria-invalid={Boolean(fieldErrors.doctorId)}
            aria-describedby={
              fieldErrors.doctorId ? "booking-doctor-error" : undefined
            }
            required
          >
            <option value="">
              {optionsLoading ? "Loading doctors…" : "Select a doctor"}
            </option>
            {options?.doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
                {doctor.role ? ` — ${doctor.role}` : ""}
              </option>
            ))}
          </select>
          <div id="booking-doctor-error">
            <FieldError messages={fieldErrors.doctorId} />
          </div>
        </div>

        <div>
          <label htmlFor="booking-service" className={labelClasses}>
            Service <span className="text-[var(--cyan-400)]">*</span>
          </label>
          <select
            id="booking-service"
            name="serviceId"
            value={form.serviceId}
            onChange={(event) => updateField("serviceId", event.target.value)}
            className={inputClasses}
            disabled={optionsLoading}
            aria-invalid={Boolean(fieldErrors.serviceId)}
            aria-describedby={
              fieldErrors.serviceId ? "booking-service-error" : undefined
            }
            required
          >
            <option value="">
              {optionsLoading ? "Loading services…" : "Select a service"}
            </option>
            {options?.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <div id="booking-service-error">
            <FieldError messages={fieldErrors.serviceId} />
          </div>
        </div>
      </div>

      {selectedService ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-[var(--muted)]">
          {selectedService.shortDescription}
        </p>
      ) : null}

      <div>
        <label htmlFor="booking-date" className={labelClasses}>
          Preferred date <span className="text-[var(--cyan-400)]">*</span>
        </label>
        <input
          id="booking-date"
          name="appointmentDate"
          type="date"
          min={dateBounds.today || undefined}
          max={dateBounds.max || undefined}
          value={form.appointmentDate}
          onChange={(event) => updateField("appointmentDate", event.target.value)}
          className={`${inputClasses} [color-scheme:dark]`}
          aria-invalid={Boolean(fieldErrors.appointmentDate)}
          aria-describedby={
            fieldErrors.appointmentDate ? "booking-date-error" : "booking-date-hint"
          }
          required
        />
        <p id="booking-date-hint" className="mt-2 text-xs text-[var(--muted)]">
          Clinic time (PKT). Appointments can be requested up to{" "}
          {MAX_ADVANCE_DAYS} days ahead.
        </p>
        <div id="booking-date-error">
          <FieldError messages={fieldErrors.appointmentDate} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClasses}>
          Preferred time <span className="text-[var(--cyan-400)]">*</span>
        </legend>

        {!form.doctorId || !form.appointmentDate ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-sm text-[var(--muted)]">
            Select a doctor and date to see available times.
          </p>
        ) : slotsLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        ) : slotsError ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
            <p>{slotsError}</p>
            <button
              type="button"
              onClick={() => setAvailabilityVersion((version) => version + 1)}
              className="mt-2 min-h-11 rounded-lg border border-rose-300/30 px-3 text-sm font-medium text-white hover:bg-rose-300/10"
            >
              Try again
            </button>
          </div>
        ) : visibleSlots.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-sm text-[var(--muted)]">
            No times are left for this date. Please choose another day.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {visibleSlots.map((slot) => {
              const selected = form.appointmentTime === slot.time;

              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => updateField("appointmentTime", slot.time)}
                  disabled={!slot.available}
                  aria-pressed={selected}
                  title={formatSlotRange(slot.time)}
                  className={[
                    "flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-2 text-center text-sm font-medium transition",
                    selected
                      ? "border-[var(--primary-500)] bg-[var(--primary-500)] text-white shadow-[0_10px_25px_rgba(30,94,255,0.3)]"
                      : slot.available
                        ? "border-white/10 bg-white/5 text-white hover:border-[var(--cyan-400)]/40 hover:bg-white/10"
                        : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/35",
                  ].join(" ")}
                >
                  <span>{slot.label}</span>
                  {slot.booked ? (
                    <span className="text-[10px] uppercase tracking-wide">
                      Booked
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        <div id="booking-time-error">
          <FieldError messages={fieldErrors.appointmentTime} />
        </div>
      </fieldset>

      <div>
        <label htmlFor="booking-notes" className={labelClasses}>
          Notes for the clinic <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <textarea
          id="booking-notes"
          name="notes"
          rows={3}
          placeholder="Tell us about any pain, concerns, or accessibility needs."
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className={`${inputClasses} resize-y`}
        />
        <div>
          <FieldError messages={fieldErrors.notes} />
        </div>
      </div>

      {formError ? (
        <div
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-6 text-rose-200"
          role="alert"
          aria-live="polite"
        >
          {formError}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitting || optionsLoading || Boolean(optionsError)}
        className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Sending request…
          </>
        ) : (
          "Request appointment"
        )}
      </Button>

      <p className="text-center text-xs leading-5 text-[var(--muted)]">
        Your request is not confirmed until the clinic approves it. You can check
        the status any time with your booking reference.
      </p>
    </form>
  );
}
