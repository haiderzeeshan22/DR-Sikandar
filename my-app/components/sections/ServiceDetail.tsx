import Image from "next/image";
import type { Service } from "@/data/services";

type ServiceDetailProps = {
  service: Service;
};

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <section className="mx-auto max-w-[1200px] px-4 pb-20 pt-10 md:px-6 md:pb-28 md:pt-16 lg:px-8">
      <a
        href="#services"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cyan-400)] hover:text-white"
      >
        <span aria-hidden="true">←</span> All services
      </a>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cyan-400)]">
            Dental services
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-6 text-base leading-7 text-[var(--muted)] md:text-lg">
            {service.description}
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#112a46,#0b1f35)]">
          <Image
            src={service.image}
            alt={service.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-contain"
          />
        </div>
      </div>

      <div className="mt-10 rounded-[1.7rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 md:mt-14 md:p-8">
        <h2 className="text-2xl font-semibold text-white">Care may include</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.careIncludes.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-sm leading-6 text-[var(--muted)]"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
          Your dentist will explain the options that are appropriate for your individual needs.
        </p>
        <a
          href="#book"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--primary-500)] px-6 text-sm font-medium text-white shadow-[0_14px_35px_rgba(30,94,255,0.35)] hover:bg-[var(--primary-500)]/90"
        >
          Book an appointment
        </a>
      </div>
    </section>
  );
}
