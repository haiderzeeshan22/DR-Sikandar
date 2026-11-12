import { Button } from "@/components/ui/Button";
import { clinicInfo } from "@/data/clinic";
import Image from "next/image";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pb-16 pt-8 md:pb-20 md:pt-10">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(93,214,255,0.18),_transparent_48%)]" />

      <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center rounded-full border border-[var(--primary-500)]/20 bg-[rgba(30,94,255,0.08)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--cyan-400)]">
            Family-first dental care
          </div>

          <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
            Modern dentistry for every smile in the family.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] md:text-lg">
            Precision-led dental care, gentle treatment, and a comforting experience designed for children, adults, and seniors alike.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="#book" size="lg">
              Book Appointment
            </Button>
            <Button href="#services" variant="secondary" size="lg">
              Explore Services
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-6 text-sm text-[var(--muted)]">
            <div>
              <div className="text-xl font-semibold text-white">{clinicInfo.founder.name}</div>
              <div>{clinicInfo.founder.qualification}</div>
            </div>
            <div>
<div className="text-xl font-semibold text-white">{clinicInfo.founder.role}</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="glass-panel relative  overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_30px_80px_rgba(2,8,20,0.5)] md:p-2">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(17,36,59,0.9),rgba(12,34,49,0.72))] p-3">
              <div className="relative h-[440px] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,_rgba(93,214,255,0.35),_transparent_30%),linear-gradient(135deg,#0a1f35_0%,#102a43_30%,#061426_100%)]">

                <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(4,12,20,0.68))]" />
                
                <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                  Premium care
                </div>
                <div className="absolute bottom-0 left-1/2 h-[92%] w-[88%] -translate-x-1/2 rounded-[1.2rem] border border-white/10 object-cover object-center shadow-[0_24px_60px_rgba(2,8,20,0.45)] sm:h-[92%] sm:w-[82%] lg:w-[78%]">
                  <Image
                  src={clinicInfo.founder.image}
                  alt={clinicInfo.founder.name}
                  width={600}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 768px) 82vw, (max-width: 1200px) 40vw, 480px"
                  
                />
                </div>
                
                <div className="absolute inset-x-6 bottom-8 rounded-[1.5rem] border border-white/10 bg-[rgba(8,17,28,0.5)] p-4 backdrop-blur-md">
                 
                  <div className="flex items-center justify-between gap-3">
                    
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Lead dentist</p>
                      <p className="mt-1 text-xl font-semibold text-white">{clinicInfo.founder.name}</p>
                    </div>

                    <div className="rounded-full border border-[var(--cyan-400)]/40 bg-[var(--cyan-400)]/10 px-2 py-1 text-xs font-medium text-[var(--cyan-400)]">
                      BDS
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
