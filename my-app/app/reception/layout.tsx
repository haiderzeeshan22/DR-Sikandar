import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reception | Family Dental Clinic",
  description: "Clinic staff appointment approval dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReceptionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-slate-100 text-slate-900">{children}</div>;
}
