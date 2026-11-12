import "server-only";
import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";
import { query } from "@/lib/db";
import {
  formatSlotLabel,
  getClinicToday,
  isBookableSlot,
  isSlotInPast,
  SLOT_TIMES,
  validateAppointmentDate,
} from "@/lib/scheduling";
import {
  APPOINTMENT_STATUSES,
  type AppointmentAction,
  type AppointmentListResponse,
  type AppointmentStatus,
  type BookingOptions,
  type DashboardStats,
  type PublicAppointment,
  type ReceptionAppointment,
  type SlotAvailability,
} from "@/lib/types";

type DoctorRow = {
  id: number;
  name: string;
  role: string;
  image: string | null;
};

type ServiceRow = {
  id: number;
  name: string;
  short_description: string;
};

type TimestampValue = string | Date;

type AppointmentRow = {
  id?: string | number;
  reference_code: string;
  patient_name: string;
  phone?: string;
  email?: string | null;
  doctor_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  clinic_note?: string | null;
  receptionist_note?: string | null;
  created_at: TimestampValue;
  updated_at?: TimestampValue;
  approved_at: TimestampValue | null;
};

export type CreateAppointmentInput = {
  patientName: string;
  phone: string;
  email?: string;
  doctorId: number;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
};

export type AppointmentFilters = {
  status?: AppointmentStatus | "all";
  date?: string;
  search?: string;
};

const ACTIVE_STATUSES = ["pending", "approved"] as const;
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateReferenceCode() {
  const bytes = randomBytes(6);
  let code = "";

  for (const byte of bytes) {
    code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  }

  return `FD-${code}`;
}

export function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function toIsoString(value: TimestampValue) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapPublicAppointment(row: AppointmentRow): PublicAppointment {
  return {
    referenceCode: row.reference_code,
    patientName: row.patient_name,
    doctorName: row.doctor_name,
    serviceName: row.service_name,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    status: row.status,
    notes: row.notes,
    clinicNote: row.clinic_note ?? null,
    createdAt: toIsoString(row.created_at),
    approvedAt: row.approved_at ? toIsoString(row.approved_at) : null,
  };
}

function mapReceptionAppointment(row: AppointmentRow): ReceptionAppointment {
  return {
    id: Number(row.id),
    referenceCode: row.reference_code,
    patientName: row.patient_name,
    phone: row.phone ?? "",
    email: row.email ?? null,
    doctorName: row.doctor_name,
    serviceName: row.service_name,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    status: row.status,
    notes: row.notes,
    receptionistNote: row.receptionist_note ?? null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at ?? row.created_at),
    approvedAt: row.approved_at ? toIsoString(row.approved_at) : null,
  };
}

function isUniqueViolation(error: unknown): error is { code: string; constraint?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export async function getBookingOptions(): Promise<BookingOptions> {
  const [doctorsResult, servicesResult] = await Promise.all([
    query<DoctorRow>(
      `select id, name, role, image
       from doctors
       where is_active = true
       order by id asc`,
    ),
    query<ServiceRow>(
      `select id, name, short_description
       from services
       where is_active = true
       order by id asc`,
    ),
  ]);

  return {
    doctors: doctorsResult.rows.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      role: doctor.role,
      image: doctor.image,
    })),
    services: servicesResult.rows.map((service) => ({
      id: service.id,
      name: service.name,
      shortDescription: service.short_description,
    })),
  };
}

export async function getAvailability(
  doctorId: number,
  date: string,
): Promise<SlotAvailability[]> {
  const dateValidation = validateAppointmentDate(date);
  if (!dateValidation.ok) {
    throw new ApiError(dateValidation.message, 400, "invalid_date");
  }

  const doctorResult = await query<{ id: number }>(
    "select id from doctors where id = $1 and is_active = true",
    [doctorId],
  );

  if (!doctorResult.rows[0]) {
    throw new ApiError("The selected doctor is not available.", 404, "doctor_not_found");
  }

  const bookedResult = await query<{ time: string }>(
    `select to_char(appointment_time, 'HH24:MI') as time
     from appointments
     where doctor_id = $1
       and appointment_date = $2::date
       and status = any($3::text[])`,
    [doctorId, date, ACTIVE_STATUSES],
  );

  const bookedTimes = new Set(bookedResult.rows.map((row) => row.time));

  return SLOT_TIMES.map((time) => {
    const past = isSlotInPast(date, time);
    const booked = bookedTimes.has(time);

    return {
      time,
      label: formatSlotLabel(time),
      available: !past && !booked,
      booked,
      past,
    };
  });
}

async function getPublicAppointmentById(id: string | number) {
  const result = await query<AppointmentRow>(
    `select a.reference_code,
            a.patient_name,
            d.name as doctor_name,
            s.name as service_name,
            a.appointment_date,
            to_char(a.appointment_time, 'HH24:MI') as appointment_time,
            a.status,
            a.notes,
            a.receptionist_note as clinic_note,
            a.created_at,
            a.approved_at
     from appointments a
     join doctors d on d.id = a.doctor_id
     join services s on s.id = a.service_id
     where a.id = $1
     limit 1`,
    [id],
  );

  const row = result.rows[0];
  if (!row) {
    throw new ApiError("Appointment not found.", 404, "not_found");
  }

  return mapPublicAppointment(row);
}

export async function createAppointment(input: CreateAppointmentInput) {
  const dateValidation = validateAppointmentDate(input.appointmentDate);
  if (!dateValidation.ok) {
    throw new ApiError(dateValidation.message, 400, "invalid_date");
  }

  if (!SLOT_TIMES.includes(input.appointmentTime)) {
    throw new ApiError("Choose a valid appointment time.", 400, "invalid_time");
  }

  if (!isBookableSlot(input.appointmentDate, input.appointmentTime)) {
    throw new ApiError(
      "That time is no longer available. Please choose another slot.",
      409,
      "slot_unavailable",
    );
  }

  const phoneDigits = normalizePhoneDigits(input.phone);
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    throw new ApiError(
      "Enter a valid phone number with 7 to 15 digits.",
      400,
      "invalid_phone",
    );
  }

  const [doctorResult, serviceResult] = await Promise.all([
    query<{ id: number; name: string }>(
      "select id, name from doctors where id = $1 and is_active = true",
      [input.doctorId],
    ),
    query<{ id: number; name: string }>(
      "select id, name from services where id = $1 and is_active = true",
      [input.serviceId],
    ),
  ]);

  if (!doctorResult.rows[0]) {
    throw new ApiError("The selected doctor is not available.", 400, "doctor_not_found");
  }

  if (!serviceResult.rows[0]) {
    throw new ApiError("The selected service is not available.", 400, "service_not_found");
  }

  const notes = input.notes?.trim() || null;
  const email = input.email?.trim() || null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceCode = generateReferenceCode();

    try {
      const insertResult = await query<{ id: string }>(
        `insert into appointments (
           reference_code, patient_name, phone, phone_digits, email,
           doctor_id, service_id, appointment_date, appointment_time, notes
         )
         values ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::time, $10)
         returning id`,
        [
          referenceCode,
          input.patientName.trim(),
          input.phone.trim(),
          phoneDigits,
          email,
          input.doctorId,
          input.serviceId,
          input.appointmentDate,
          input.appointmentTime,
          notes,
        ],
      );

      const inserted = insertResult.rows[0];
      if (!inserted) {
        throw new ApiError(
          "The booking could not be saved. Please try again.",
          500,
          "insert_failed",
        );
      }

      return getPublicAppointmentById(inserted.id);
    } catch (error) {
      if (isUniqueViolation(error)) {
        if (error.constraint === "appointments_active_slot_unique") {
          throw new ApiError(
            "That time was just booked by another patient. Please choose another slot.",
            409,
            "slot_taken",
          );
        }

        if (error.constraint === "appointments_reference_code_key") {
          continue;
        }
      }

      throw error;
    }
  }

  throw new ApiError(
    "A booking reference could not be generated. Please try again.",
    500,
    "reference_failed",
  );
}

export async function lookupAppointment(referenceCode: string, phone: string) {
  const reference = referenceCode.trim().toUpperCase();
  const phoneDigits = normalizePhoneDigits(phone);

  if (reference.length < 4 || phoneDigits.length < 7) {
    throw new ApiError(
      "Enter your booking reference and the phone number used to book.",
      400,
      "invalid_lookup",
    );
  }

  const result = await query<AppointmentRow>(
    `select a.reference_code,
            a.patient_name,
            d.name as doctor_name,
            s.name as service_name,
            a.appointment_date,
            to_char(a.appointment_time, 'HH24:MI') as appointment_time,
            a.status,
            a.notes,
            a.receptionist_note as clinic_note,
            a.created_at,
            a.approved_at
     from appointments a
     join doctors d on d.id = a.doctor_id
     join services s on s.id = a.service_id
     where upper(a.reference_code) = $1
       and a.phone_digits = $2
     limit 1`,
    [reference, phoneDigits],
  );

  const row = result.rows[0];
  if (!row) {
    throw new ApiError(
      "We could not find an appointment with that reference and phone number.",
      404,
      "not_found",
    );
  }

  return mapPublicAppointment(row);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = getClinicToday();

  const result = await query<{
    pending: number;
    approved_today: number;
    today_total: number;
    completed_today: number;
  }>(
    `select
       count(*) filter (where status = 'pending')::int as pending,
       count(*) filter (where appointment_date = $1::date and status = 'approved')::int as approved_today,
       count(*) filter (
         where appointment_date = $1::date
           and status in ('pending', 'approved', 'completed')
       )::int as today_total,
       count(*) filter (where appointment_date = $1::date and status = 'completed')::int as completed_today
     from appointments`,
    [today],
  );

  const row = result.rows[0];

  return {
    pending: row?.pending ?? 0,
    approvedToday: row?.approved_today ?? 0,
    todayTotal: row?.today_total ?? 0,
    completedToday: row?.completed_today ?? 0,
  };
}

export async function listReceptionAppointments(
  filters: AppointmentFilters = {},
): Promise<AppointmentListResponse> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status && filters.status !== "all") {
    if (!APPOINTMENT_STATUSES.includes(filters.status)) {
      throw new ApiError("Invalid status filter.", 400, "invalid_status");
    }

    params.push(filters.status);
    conditions.push(`a.status = $${params.length}`);
  }

  if (filters.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      throw new ApiError("Invalid date filter.", 400, "invalid_date");
    }

    params.push(filters.date);
    conditions.push(`a.appointment_date = $${params.length}::date`);
  }

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim().slice(0, 100)}%`);
    const placeholder = `$${params.length}`;
    conditions.push(
      `(a.patient_name ilike ${placeholder}
        or a.phone_digits like ${placeholder}
        or a.phone ilike ${placeholder}
        or upper(a.reference_code) like upper(${placeholder}))`,
    );
  }

  const whereClause = conditions.length ? `where ${conditions.join(" and ")}` : "";

  const [appointmentsResult, stats] = await Promise.all([
    query<AppointmentRow>(
      `select a.id,
              a.reference_code,
              a.patient_name,
              a.phone,
              a.email,
              d.name as doctor_name,
              s.name as service_name,
              a.appointment_date,
              to_char(a.appointment_time, 'HH24:MI') as appointment_time,
              a.status,
              a.notes,
              a.receptionist_note,
              a.created_at,
              a.updated_at,
              a.approved_at
       from appointments a
       join doctors d on d.id = a.doctor_id
       join services s on s.id = a.service_id
       ${whereClause}
       order by
         case when a.status = 'pending' then 0 else 1 end,
         a.appointment_date asc,
         a.appointment_time asc,
         a.created_at desc
       limit 250`,
      params,
    ),
    getDashboardStats(),
  ]);

  return {
    appointments: appointmentsResult.rows.map(mapReceptionAppointment),
    stats,
  };
}

const TARGET_STATUS_BY_ACTION: Record<AppointmentAction, AppointmentStatus> = {
  approve: "approved",
  decline: "declined",
  complete: "completed",
  cancel: "cancelled",
};

const ALLOWED_SOURCE_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: [],
  approved: ["pending"],
  declined: ["pending"],
  completed: ["approved"],
  cancelled: ["pending", "approved"],
};

export async function updateAppointmentStatus(
  appointmentId: number,
  action: AppointmentAction,
  note?: string,
) {
  const targetStatus = TARGET_STATUS_BY_ACTION[action];
  const allowedFrom = ALLOWED_SOURCE_STATUSES[targetStatus];

  if (!allowedFrom) {
    throw new ApiError("Invalid appointment action.", 400, "invalid_action");
  }

  try {
    const updateResult = await query<{ id: string }>(
      `update appointments
       set status = $2,
           receptionist_note = coalesce(nullif($3, ''), receptionist_note),
           approved_at = case when $2 = 'approved' then now() else approved_at end
       where id = $1
         and status = any($4::text[])
       returning id`,
      [appointmentId, targetStatus, note?.trim() ?? "", allowedFrom],
    );

    if (!updateResult.rows[0]) {
      const currentResult = await query<{ status: AppointmentStatus }>(
        "select status from appointments where id = $1",
        [appointmentId],
      );

      const current = currentResult.rows[0];
      if (!current) {
        throw new ApiError("Appointment not found.", 404, "not_found");
      }

      throw new ApiError(
        `This appointment is already ${current.status}. Refresh the list to see the latest status.`,
        409,
        "invalid_transition",
      );
    }

    return { id: appointmentId, status: targetStatus };
  } catch (error) {
    if (
      isUniqueViolation(error) &&
      error.constraint === "appointments_active_slot_unique"
    ) {
      throw new ApiError(
        "Another active appointment already uses that time slot.",
        409,
        "slot_taken",
      );
    }

    throw error;
  }
}
