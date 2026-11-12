export const CLINIC_TIMEZONE = "Asia/Karachi";
export const SLOT_MINUTES = 30;
export const MAX_ADVANCE_DAYS = 60;
export const MIN_LEAD_MINUTES = 60;

const OPEN_MINUTES = 9 * 60;
const CLOSE_MINUTES = 17 * 60;
const LUNCH_START_MINUTES = 13 * 60;
const LUNCH_END_MINUTES = 14 * 60;

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export const SLOT_TIMES: string[] = (() => {
  const slots: string[] = [];

  for (
    let start = OPEN_MINUTES;
    start + SLOT_MINUTES <= CLOSE_MINUTES;
    start += SLOT_MINUTES
  ) {
    if (start >= LUNCH_START_MINUTES && start < LUNCH_END_MINUTES) {
      continue;
    }

    slots.push(minutesToTime(start));
  }

  return slots;
})();

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatSlotLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatSlotRange(time: string) {
  return `${formatSlotLabel(time)} – ${formatSlotLabel(
    minutesToTime(timeToMinutes(time) + SLOT_MINUTES),
  )}`;
}

export function parseISODate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return null;
  }

  return parsed;
}

export function addDaysISO(date: string, days: number) {
  const parsed = parseISODate(date);
  if (!parsed) {
    return date;
  }

  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function getClinicDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: Number(values.hour) % 24,
    minute: Number(values.minute),
  };
}

export function getClinicToday(now = new Date()) {
  const { year, month, day } = getClinicDateParts(now);
  return `${year}-${month}-${day}`;
}

export function getClinicNowMinutes(now = new Date()) {
  const { hour, minute } = getClinicDateParts(now);
  return hour * 60 + minute;
}

export function validateAppointmentDate(date: string, now = new Date()) {
  if (!parseISODate(date)) {
    return { ok: false as const, message: "Choose a valid appointment date." };
  }

  const today = getClinicToday(now);
  const latestDate = addDaysISO(today, MAX_ADVANCE_DAYS);

  if (date < today) {
    return { ok: false as const, message: "Choose today or a future date." };
  }

  if (date > latestDate) {
    return {
      ok: false as const,
      message: `Appointments can be requested up to ${MAX_ADVANCE_DAYS} days ahead.`,
    };
  }

  return { ok: true as const };
}

export function isSlotInPast(date: string, time: string, now = new Date()) {
  if (date !== getClinicToday(now)) {
    return date < getClinicToday(now);
  }

  if (!SLOT_TIMES.includes(time)) {
    return true;
  }

  return timeToMinutes(time) < getClinicNowMinutes(now) + MIN_LEAD_MINUTES;
}

export function isBookableSlot(date: string, time: string, now = new Date()) {
  return (
    SLOT_TIMES.includes(time) &&
    validateAppointmentDate(date, now).ok &&
    !isSlotInPast(date, time, now)
  );
}

export function formatDateLabel(date: string) {
  const parsed = parseISODate(date);
  if (!parsed) {
    return date;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function formatDateTimeLabel(date: string, time: string) {
  return `${formatDateLabel(date)} at ${formatSlotLabel(time)}`;
}

export function formatTimestampLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
