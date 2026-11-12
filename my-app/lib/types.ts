export const APPOINTMENT_STATUSES = [
  "pending",
  "approved",
  "declined",
  "completed",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentAction = "approve" | "decline" | "complete" | "cancel";

export type DoctorOption = {
  id: number;
  name: string;
  role: string;
  image: string | null;
};

export type ServiceOption = {
  id: number;
  name: string;
  shortDescription: string;
};

export type BookingOptions = {
  doctors: DoctorOption[];
  services: ServiceOption[];
};

export type SlotAvailability = {
  time: string;
  label: string;
  available: boolean;
  booked: boolean;
  past: boolean;
};

export type PublicAppointment = {
  referenceCode: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string | null;
  clinicNote: string | null;
  createdAt: string;
  approvedAt: string | null;
};

export type ReceptionAppointment = {
  id: number;
  referenceCode: string;
  patientName: string;
  phone: string;
  email: string | null;
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string | null;
  receptionistNote: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
};

export type DashboardStats = {
  pending: number;
  approvedToday: number;
  todayTotal: number;
  completedToday: number;
};

export type AppointmentListResponse = {
  appointments: ReceptionAppointment[];
  stats: DashboardStats;
};
