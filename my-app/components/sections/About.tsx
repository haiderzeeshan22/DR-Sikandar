import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] rounded-[3rem] border border-white/50 p-2 px-4 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

          <div className="glass-panel rounded-[2rem]  border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 md:p-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,#112a46,#0b1f35)] p-6">
              <div className="h-[360px] rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(93,214,255,0.25),_transparent_26%),linear-gradient(135deg,#0a1f35_0%,#061426_100%)]">
                <Image
                  src="/images/logo/logo.png"
                  alt="logo"
                  width={600}
                  height={750}
                  priority
                  sizes="(max-width: 768px) 82vw, (max-width: 1200px) 40vw, 480px"
                  />
              </div>
            
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="About the clinic"
              title="Thoughtful dentistry built around long-term oral health."
              description="We combine clinical precision, calm communication, and patient-centered care to create a reassuring dental experience for every generation."
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                "Preventive and restorative care",
                "Family-focused treatment plans",
                "Modern, minimally invasive solutions",
                "Comfort-first patient experience",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-sm leading-6 text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
