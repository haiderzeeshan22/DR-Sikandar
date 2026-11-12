import { Button } from "@/components/ui/Button";
import { clinicInfo } from "@/data/clinic";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 pb-20 pt-20 md:pb-28 md:pt-28">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="glass-panel rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 md:p-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Contact us"
                title="Compassionate, modern dental care for the whole family."
                description="We welcome new patients and families seeking attentive, personalized treatment. Call us or book an appointment online."
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <a
                  href={`tel:${clinicInfo.contact.phone.replace(/\s/g, "")}`}
                  className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 transition hover:border-[var(--cyan-400)]/30 hover:bg-white/[0.05]"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Phone
                  </p>
                  <p className="mt-2 text-base text-white">
                    {clinicInfo.contact.phone || "—"}
                  </p>
                </a>
                <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Email
                  </p>
                  <p className="mt-2 break-all text-base text-white">
                    {clinicInfo.contact.email || "Call the clinic for email enquiries"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Address
                  </p>
                  <p className="mt-2 text-base text-white">
                    {clinicInfo.contact.address || "Call the clinic for directions"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="#book" className="w-full justify-center sm:w-auto">
                  Book Appointment
                </Button>
                <Button
                  href={`tel:${clinicInfo.contact.phone.replace(/\s/g, "")}`}
                  variant="secondary"
                  className="w-full justify-center sm:w-auto"
                >
                  Call the clinic
                </Button>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,42,67,0.95),rgba(6,20,38,0.92))] p-5">
              <div className="rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.02)] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--cyan-400)]">
                  Clinic hours
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Open every day
                </h3>

                <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
                  {Object.entries(clinicInfo.hours).map(([day, value]) => (
                    <li
                      key={day}
                      className="flex items-center justify-between gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="capitalize">{day}</span>
                      <span className="text-white">{value || "—"}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-[var(--muted)]">
                  Appointments are requested online and confirmed by the clinic
                  reception team. For urgent concerns, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
