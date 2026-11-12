import { z } from "zod";

const phonePattern = /^[0-9+()\-\s.]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createAppointmentSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Enter the patient's full name.")
    .max(120, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(30, "Phone number is too long.")
    .refine((value) => phonePattern.test(value), "Enter a valid phone number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    }, "Enter a valid phone number."),
  email: z
    .string()
    .trim()
    .max(200, "Email is too long.")
    .default("")
    .refine(
      (value) => value.length === 0 || emailPattern.test(value),
      "Enter a valid email address.",
    ),
  doctorId: z.coerce.number().int().positive("Choose a doctor."),
  serviceId: z.coerce.number().int().positive("Choose a service."),
  appointmentDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an appointment date."),
  appointmentTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Choose an appointment time."),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer.")
    .default(""),
});

export const updateAppointmentSchema = z.object({
  action: z.enum(["approve", "decline", "complete", "cancel"], {
    message: "Choose a valid action.",
  }),
  note: z
    .string()
    .trim()
    .max(1000, "Note must be 1000 characters or fewer.")
    .default(""),
});

export const receptionLoginSchema = z.object({
  passcode: z
    .string()
    .min(1, "Enter the reception passcode.")
    .max(200, "Passcode is too long."),
});
