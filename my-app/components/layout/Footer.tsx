import Link from "next/link";
import { clinicInfo } from "@/data/clinic";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Doctors", href: "#doctors" },
  { label: "Services", href: "#services" },
  { label: "Book appointment", href: "#book" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--navy-950)]/80">
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-500)] text-sm font-bold text-white">
                F
              </span>
              <span className="text-sm font-semibold tracking-[0.12em] text-white uppercase">
                {clinicInfo.shortName}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[var(--muted)]">
              Thoughtful, family-centered dental care in a calm, modern clinical
              environment.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {navigation.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/appointment-status"
                  className="transition-colors hover:text-white"
                >
                  Track appointment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                {clinicInfo.contact.phone ? (
                  <a
                    href={`tel:${clinicInfo.contact.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-white"
                  >
                    {clinicInfo.contact.phone}
                  </a>
                ) : (
                  "Phone: —"
                )}
              </li>
              {clinicInfo.contact.email ? (
                <li className="break-all">{clinicInfo.contact.email}</li>
              ) : null}
              {clinicInfo.contact.address ? (
                <li>{clinicInfo.contact.address}</li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Hours
            </h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {Object.entries(clinicInfo.hours).map(([day, value]) => (
                <li key={day} className="flex justify-between gap-4">
                  <span className="capitalize">{day}</span>
                  <span>{value || "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Family Dental Clinic. All rights
            reserved.
          </p>
          <Link
            href="/reception/login"
            className="text-xs text-[var(--muted)] transition-colors hover:text-white"
          >
            Staff sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
