import { SectionHeading } from "@/components/ui/SectionHeading";

const faqItems = [
  {
    question: "Do you provide family dental care?",
    answer:
      "Yes. We provide preventive, restorative, and pediatric care for children, adults, and seniors, with treatment plans tailored to each family member.",
  },
  {
    question: "Are new patients welcome?",
    answer:
      "Yes, new patients and families are welcome. Send an appointment request online or call the clinic, and reception will confirm your visit.",
  },
  {
    question: "Do you offer advanced dental treatments?",
    answer:
      "Yes. Our services include periodontics, pediatric dentistry, implant dentistry, endodontics, prosthodontics, and conscious sedation for eligible patients.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Use the booking form on this page to choose a doctor, service, date, and time. You will receive a booking reference, and the clinic will approve or decline your request.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions from new and returning patients."
          description="Information is kept simple and clear so you know what to expect before your visit."
          align="center"
        />

        <div className="mx-auto mt-12 max-w-4xl space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 text-left open:bg-[rgba(255,255,255,0.05)]"
            >
              <summary className="cursor-pointer list-none text-base font-medium text-white md:text-lg">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                {item.answer || "More details coming soon."}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
