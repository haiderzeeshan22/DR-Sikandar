import { services } from "@/data/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto mb-9 max-w-[1600px] px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our services"
          title="Comprehensive dental care tailored to your needs."
          description="From preventive care to advanced treatment planning, our services are designed to support lifelong oral health."
          align="center"
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <a
              href={`#services/${service.slug}`}
              key={service.slug}
              className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[var(--primary-500)]/40 hover:bg-[rgba(255,255,255,0.06)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,#112a46,#0b1f35)]">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-contain"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {service.shortDescription}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--cyan-400)]">
                  Learn more <span aria-hidden="true">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
