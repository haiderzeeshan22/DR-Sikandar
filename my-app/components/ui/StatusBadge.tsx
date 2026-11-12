import type { AppointmentStatus } from "@/lib/types";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  declined: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DOT_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-400",
  approved: "bg-emerald-400",
  declined: "bg-rose-400",
  completed: "bg-sky-400",
  cancelled: "bg-slate-400",
};

type StatusBadgeProps = {
  status: AppointmentStatus;
  theme?: "dark" | "light";
  className?: string;
};

export function StatusBadge({
  status,
  theme = "dark",
  className = "",
}: StatusBadgeProps) {
  const classes =
    theme === "light"
      ? {
          pending: "border-amber-200 bg-amber-50 text-amber-700",
          approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
          declined: "border-rose-200 bg-rose-50 text-rose-700",
          completed: "border-sky-200 bg-sky-50 text-sky-700",
          cancelled: "border-slate-200 bg-slate-100 text-slate-600",
        }
      : {
          pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
          approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
          declined: "border-rose-400/30 bg-rose-400/10 text-rose-300",
          completed: "border-sky-400/30 bg-sky-400/10 text-sky-300",
          cancelled: "border-slate-400/30 bg-slate-400/10 text-slate-300",
        };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${classes[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export { STATUS_LABELS };
