import { doctors } from "@/data/doctors";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function Doctors() {
  return (
    <section id="doctors" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] rounded-2xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our team"
          title="Experienced clinicians who place comfort and clarity first."
          description="Our dentists work together to deliver comprehensive family care with a consistent, reassuring approach."
          align="center"
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {doctors.map((doctor) => (
            <article
              key={doctor.slug}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,#112a46,#0b1f35)]">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 rounded-[1.5rem] border border-white/10 px-5 py-4">
                <h3 className="text-xl font-semibold text-white">{doctor.name}</h3>
                <p className="mt-1 text-sm text-[var(--cyan-400)]">{doctor.role || "Dental Team Member"}</p>
                {doctor.qualifications ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">{doctor.qualifications}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
