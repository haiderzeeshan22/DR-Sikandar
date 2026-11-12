"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Doctors", href: "#doctors" },
  { label: "Services", href: "#services" },
  { label: "Book", href: "#book" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-[1600px] px-4 pt-4 md:px-6 lg:px-8">
        <nav
          className={[
            "glass-panel flex items-center justify-between rounded-full border px-3 py-2.5 transition-all duration-300 md:px-5",
            isScrolled
              ? "border-white/10 bg-[rgba(9,21,35,0.78)] shadow-[0_20px_60px_rgba(2,8,20,0.45)] backdrop-blur-xl"
              : "border-white/10 bg-[rgba(8,17,28,0.38)] backdrop-blur-md",
          ].join(" ")}
          aria-label="Main navigation"
        >
          <a href="#home" className="flex items-center gap-3" aria-label="Family Dental Clinic home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-500)] text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,94,255,0.45)]">
              {/* <Image
              src="/images/logo/logo.png"
              alt=""
              width={100}
              height={10}
              /> */}
              F
            </span>
            <span className="whitespace-nowrap text-xs font-semibold tracking-[0.08em] text-white uppercase sm:text-sm md:text-base md:tracking-[0.12em]">
              Family Dental Clinic
            </span>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[var(--muted)] transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:block">
            <Button href="#book" size="sm">
              Book Appointment
            </Button>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </nav>

        {mobileOpen ? (
          <div className="glass-panel mt-3 rounded-[1.5rem] border border-white/10 bg-[rgba(10,18,29,0.86)] p-4 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button href="#book" className="mt-2 w-full justify-center">
                Book Appointment
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
