"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatDateLabel,
  formatSlotRange,
  formatTimestampLabel,
  getClinicToday,
} from "@/lib/scheduling";
import type {
  AppointmentAction,
  DashboardStats,
  ReceptionAppointment,
} from "@/lib/types";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
] as const;

type FilterStatus = (typeof FILTERS)[number]["value"];

type Toast = {
  type: "success" | "error";
  message: string;
};

const ACTION_SUCCESS: Record<AppointmentAction, string> = {
  approve: "Appointment approved. The patient now sees it as confirmed.",
  decline: "Request declined. The patient can see the updated status.",
  complete: "Appointment marked as completed.",
  cancel: "Appointment cancelled.",
};

const actionButtonClasses =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const inputClasses =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/15 sm:text-sm";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "amber" | "emerald" | "sky" | "slate";
}) {
  const tones = {
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    sky: "border-sky-100 bg-sky-50 text-sky-700",
    slate: "border-slate-200 bg-white text-slate-700",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function DeclinePanel({
  patientName,
  note,
  onNoteChange,
  onCancel,
  onConfirm,
  busy,
}: {
  patientName: string;
  note: string;
  onNoteChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
      <label
        htmlFor={`decline-note-${patientName.replace(/\s+/g, "-")}`}
        className="block text-sm font-medium text-rose-900"
      >
        Note for the patient (optional)
      </label>
      <textarea
        id={`decline-note-${patientName.replace(/\s+/g, "-")}`}
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Example: This time is no longer available. Please call us to rebook."
        className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 sm:text-sm"
      />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`${actionButtonClasses} bg-rose-600 text-white hover:bg-rose-700`}
        >
          {busy ? "Declining…" : "Confirm decline"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={`${actionButtonClasses} border border-rose-200 bg-white text-rose-700 hover:bg-rose-100`}
        >
          Keep request
        </button>
      </div>
    </div>
  );
}

function ActionButtons({
  appointment,
  busy,
  onAction,
  onDecline,
}: {
  appointment: ReceptionAppointment;
  busy: boolean;
  onAction: (action: AppointmentAction) => void;
  onDecline: () => void;
}) {
  if (appointment.status === "pending") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAction("approve")}
          disabled={busy}
          aria-label={`Approve appointment for ${appointment.patientName}`}
          className={`${actionButtonClasses} bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          {busy ? "Updating…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={busy}
          aria-label={`Decline appointment for ${appointment.patientName}`}
          className={`${actionButtonClasses} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
        >
          Decline
        </button>
      </div>
    );
  }

  if (appointment.status === "approved") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAction("complete")}
          disabled={busy}
          aria-label={`Mark appointment for ${appointment.patientName} as completed`}
          className={`${actionButtonClasses} bg-sky-600 text-white hover:bg-sky-700`}
        >
          {busy ? "Updating…" : "Mark completed"}
        </button>
        <button
          type="button"
          onClick={() => onAction("cancel")}
          disabled={busy}
          aria-label={`Cancel appointment for ${appointment.patientName}`}
          className={`${actionButtonClasses} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
        >
          Cancel
        </button>
      </div>
    );
  }

  return <span className="text-sm text-slate-400">No actions</span>;
}

export function ReceptionDashboard() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState<ReceptionAppointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [declineTarget, setDeclineTarget] = useState<number | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const hasLoadedRef = useRef(false);
  const autoRefreshRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const auto = autoRefreshRef.current;
    autoRefreshRef.current = false;

    const timer = window.setTimeout(async () => {
      if (!auto && hasLoadedRef.current) {
        setRefreshing(true);
      }

      try {
        const params = new URLSearchParams({ status: filterStatus });

        if (filterDate) {
          params.set("date", filterDate);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(
          `/api/reception/appointments?${params.toString()}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const payload = await response.json();

        if (response.status === 401) {
          router.replace("/reception/login");
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Could not load appointments.");
        }

        setAppointments(payload.appointments as ReceptionAppointment[]);
        setStats(payload.stats as DashboardStats);
        setLoadError("");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load appointments. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          setRefreshing(false);
          hasLoadedRef.current = true;
        }
      }
    }, search.trim() ? 300 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filterStatus, filterDate, search, refreshToken, router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        autoRefreshRef.current = true;
        setRefreshToken((token) => token + 1);
      }
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function refreshList() {
    setRefreshToken((token) => token + 1);
  }

  async function handleAction(
    appointmentId: number,
    action: AppointmentAction,
    note = "",
  ) {
    if (busyId !== null) {
      return false;
    }

    if (
      action === "cancel" &&
      !window.confirm("Cancel this appointment? The patient will see it as cancelled.")
    ) {
      return false;
    }

    setBusyId(appointmentId);

    try {
      const response = await fetch(
        `/api/reception/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, note }),
        },
      );
      const payload = await response.json();

      if (response.status === 401) {
        router.replace("/reception/login");
        return false;
      }

      if (!response.ok) {
        setToast({
          type: "error",
          message: payload.error || "The appointment could not be updated.",
        });
        return false;
      }

      setToast({ type: "success", message: ACTION_SUCCESS[action] });
      setDeclineTarget(null);
      setDeclineNote("");
      autoRefreshRef.current = true;
      setRefreshToken((token) => token + 1);
      return true;
    } catch {
      setToast({
        type: "error",
        message: "Could not reach the clinic server. Please try again.",
      });
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    setSigningOut(true);

    try {
      await fetch("/api/reception/logout", { method: "POST" });
    } finally {
      router.replace("/reception/login");
      router.refresh();
    }
  }

  function startDecline(appointmentId: number) {
    setDeclineTarget((current) => (current === appointmentId ? null : appointmentId));
    setDeclineNote("");
  }

  function clearFilters() {
    setFilterStatus("pending");
    setFilterDate("");
    setSearch("");
  }

  const hasActiveFilters = Boolean(
    filterDate || search || filterStatus !== "pending",
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-500)] text-sm font-bold text-white shadow-[0_10px_25px_rgba(30,94,255,0.28)]">
              F
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 sm:text-base">
                Reception dashboard
              </p>
              <p className="text-xs text-slate-500">Family Dental Clinic</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden min-h-10 items-center rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              View website
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Appointment requests
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review new bookings, approve or decline requests, and keep the
              clinic schedule up to date.
            </p>
          </div>
          {stats && stats.pending > 0 ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {stats.pending} waiting for review
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Pending requests"
            value={stats?.pending ?? "—"}
            tone="amber"
          />
          <StatCard
            label="Approved today"
            value={stats?.approvedToday ?? "—"}
            tone="emerald"
          />
          <StatCard
            label="Appointments today"
            value={stats?.todayTotal ?? "—"}
            tone="sky"
          />
          <StatCard
            label="Completed today"
            value={stats?.completedToday ?? "—"}
            tone="slate"
          />
        </div>

        <section
          aria-label="Appointment filters"
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const active = filterStatus === filter.value;
              const showCount =
                filter.value === "pending" && (stats?.pending ?? 0) > 0;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setFilterStatus(filter.value)}
                  aria-pressed={active}
                  className={[
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition",
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {filter.label}
                  {showCount ? (
                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[11px] leading-none",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-800",
                      ].join(" ")}
                    >
                      {stats?.pending}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto]">
            <div>
              <label htmlFor="reception-search" className="sr-only">
                Search by patient, phone, or reference
              </label>
              <input
                id="reception-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient, phone, or reference"
                className={inputClasses}
              />
            </div>

            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label htmlFor="reception-date" className="sr-only">
                  Filter by appointment date
                </label>
                <input
                  id="reception-date"
                  type="date"
                  value={filterDate}
                  onChange={(event) => setFilterDate(event.target.value)}
                  className={`${inputClasses} min-w-0`}
                />
              </div>
              <button
                type="button"
                onClick={() => setFilterDate(getClinicToday())}
                className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Today
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={refreshList}
                disabled={refreshing}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
              >
                <span
                  aria-hidden="true"
                  className={refreshing ? "inline-block animate-spin" : ""}
                >
                  ↻
                </span>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 md:flex-none"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {loadError ? (
          <div
            className="mt-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={refreshList}
              className="inline-flex min-h-10 w-fit items-center rounded-lg bg-rose-600 px-3 font-medium text-white hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500" aria-live="polite">
            {initialLoading
              ? "Loading appointments…"
              : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"} shown`}
          </p>
          <p className="hidden text-xs text-slate-400 sm:block">
            Refreshes automatically every 30 seconds
          </p>
        </div>

        {initialLoading ? (
          <div className="mt-3 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
              ✓
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No appointments match these filters
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another status or date, or clear the filters to see all
              requests.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-3 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <caption className="sr-only">
                    Appointment requests for the selected filters
                  </caption>
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Patient
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Appointment
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Doctor / service
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-medium"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appointment) => (
                      <Fragment key={appointment.id}>
                        <tr className="align-top">
                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-900">
                              {appointment.patientName}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-slate-500">
                              {appointment.referenceCode}
                            </p>
                            <a
                              href={`tel:${appointment.phone.replace(/\s/g, "")}`}
                              className="mt-1 block text-xs text-sky-700 hover:underline"
                            >
                              {appointment.phone}
                            </a>
                            {appointment.email ? (
                              <a
                                href={`mailto:${appointment.email}`}
                                className="mt-0.5 block break-all text-xs text-slate-500 hover:underline"
                              >
                                {appointment.email}
                              </a>
                            ) : null}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-900">
                              {formatDateLabel(appointment.appointmentDate)}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {formatSlotRange(appointment.appointmentTime)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Requested {formatTimestampLabel(appointment.createdAt)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-900">
                              {appointment.doctorName}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {appointment.serviceName}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              status={appointment.status}
                              theme="light"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end">
                              <ActionButtons
                                appointment={appointment}
                                busy={busyId === appointment.id}
                                onAction={(action) =>
                                  handleAction(appointment.id, action)
                                }
                                onDecline={() => startDecline(appointment.id)}
                              />
                            </div>
                          </td>
                        </tr>
                        {appointment.notes ? (
                          <tr className="bg-slate-50/60">
                            <td colSpan={5} className="px-4 pb-3 pt-0">
                              <p className="text-xs leading-5 text-slate-600">
                                <span className="font-medium text-slate-700">
                                  Patient notes:
                                </span>{" "}
                                {appointment.notes}
                              </p>
                            </td>
                          </tr>
                        ) : null}
                        {declineTarget === appointment.id ? (
                          <tr>
                            <td colSpan={5} className="px-4 pb-4">
                              <DeclinePanel
                                patientName={appointment.patientName}
                                note={declineNote}
                                onNoteChange={setDeclineNote}
                                onCancel={() => {
                                  setDeclineTarget(null);
                                  setDeclineNote("");
                                }}
                                onConfirm={() =>
                                  handleAction(
                                    appointment.id,
                                    "decline",
                                    declineNote,
                                  )
                                }
                                busy={busyId === appointment.id}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 space-y-3 lg:hidden">
              {appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-900">
                        {appointment.patientName}
                      </h2>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">
                        {appointment.referenceCode}
                      </p>
                      <a
                        href={`tel:${appointment.phone.replace(/\s/g, "")}`}
                        className="mt-1 inline-block text-sm text-sky-700 hover:underline"
                      >
                        {appointment.phone}
                      </a>
                    </div>
                    <StatusBadge status={appointment.status} theme="light" />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Date
                      </dt>
                      <dd className="mt-1 font-medium text-slate-800">
                        {formatDateLabel(appointment.appointmentDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Time
                      </dt>
                      <dd className="mt-1 font-medium text-slate-800">
                        {formatSlotRange(appointment.appointmentTime)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Doctor
                      </dt>
                      <dd className="mt-1 font-medium text-slate-800">
                        {appointment.doctorName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Service
                      </dt>
                      <dd className="mt-1 font-medium text-slate-800">
                        {appointment.serviceName}
                      </dd>
                    </div>
                  </dl>

                  {appointment.notes ? (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Patient notes
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {appointment.notes}
                      </p>
                    </div>
                  ) : null}

                  <p className="mt-3 text-xs text-slate-400">
                    Requested {formatTimestampLabel(appointment.createdAt)}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <ActionButtons
                      appointment={appointment}
                      busy={busyId === appointment.id}
                      onAction={(action) =>
                        handleAction(appointment.id, action)
                      }
                      onDecline={() => startDecline(appointment.id)}
                    />
                  </div>

                  {declineTarget === appointment.id ? (
                    <div className="mt-3">
                      <DeclinePanel
                        patientName={appointment.patientName}
                        note={declineNote}
                        onNoteChange={setDeclineNote}
                        onCancel={() => {
                          setDeclineTarget(null);
                          setDeclineNote("");
                        }}
                        onConfirm={() =>
                          handleAction(
                            appointment.id,
                            "decline",
                            declineNote,
                          )
                        }
                        busy={busyId === appointment.id}
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      {toast ? (
        <div
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:w-full sm:max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className={[
              "flex items-start justify-between gap-3 rounded-xl border p-4 shadow-lg",
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900",
            ].join(" ")}
          >
            <p className="text-sm leading-6">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none hover:bg-black/5"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
