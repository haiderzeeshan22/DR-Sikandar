import Link from "next/link";
import { AppointmentForm } from "@/components/booking/AppointmentForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { clinicInfo } from "@/data/clinic";

const steps = [
  {
    title: "Send your request",
    description:
      "Choose a doctor, service, date, and an available time that works for you.",
  },
  {
    title: "Reception approves",
    description:
      "The clinic reviews your request and confirms the booking or suggests another time.",
  },
  {
    title: "Visit the clinic",
    description:
      "Once approved, arrive a few minutes early for a calm, unhurried appointment.",
  },
];

export function Booking() {
  return (
    <section id="book" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Book an appointment"
              title="Request a visit in a few simple steps."
              description="Choose a preferred time and send your request. The clinic reception team will review it and confirm your appointment."
            />

            <ol className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--cyan-400)]/30 bg-[var(--cyan-400)]/10 text-sm font-semibold text-[var(--cyan-400)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Prefer to call?
              </p>
              <a
                href={`tel:${clinicInfo.contact.phone.replace(/\s/g, "")}`}
                className="mt-2 inline-block text-xl font-semibold text-white hover:text-[var(--cyan-400)]"
              >
                {clinicInfo.contact.phone}
              </a>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Open daily, 9:00 AM – 5:00 PM
              </p>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              Already sent a request?{" "}
              <Link
                href="/appointment-status"
                className="font-medium text-[var(--cyan-400)] hover:text-white"
              >
                Check your appointment status
              </Link>
              .
            </p>
          </div>

          <div className="glass-panel rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_30px_80px_rgba(2,8,20,0.35)] sm:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(150deg,rgba(16,42,67,0.75),rgba(6,20,38,0.92))] p-4 sm:p-6">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cyan-400)]">
                    Appointment request
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Tell us about your visit
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--muted)]">
                  About 1 minute
                </span>
              </div>

              <AppointmentForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
