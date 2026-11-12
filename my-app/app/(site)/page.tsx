"use client";

import { useEffect, useState } from "react";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { Contact } from "@/components/sections/Contact";
import { Doctors } from "@/components/sections/Doctors";
import { FAQ } from "@/components/sections/FAQ";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { services } from "@/data/services";

export default function HomePage() {
  const [serviceSlug, setServiceSlug] = useState<string | null>(null);

  useEffect(() => {
    const syncHashRoute = () => {
      const [section, slug] = window.location.hash.slice(1).split("/");
      setServiceSlug(section === "services" && slug ? slug.toLowerCase() : null);
    };

    syncHashRoute();
    window.addEventListener("hashchange", syncHashRoute);
    return () => window.removeEventListener("hashchange", syncHashRoute);
  }, []);

  const service = services.find((item) => item.slug.toLowerCase() === serviceSlug);

  useEffect(() => {
    if (service) {
      window.scrollTo({ top: 0 });
    } else if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      if (targetId.includes("/")) {
        return;
      }

      const frame = window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView();
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [service]);

  if (service) {
    return (
      <main>
        <ServiceDetail service={service} />
      </main>
    );
  }

  return (
    <main>
      <Hero />
      <About />
      <Doctors />
      <Services />
      <Booking />
      <FAQ />
      <Contact />
    </main>
  );
}
