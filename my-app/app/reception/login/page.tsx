import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceptionLoginForm } from "@/components/reception/ReceptionLoginForm";
import { getReceptionSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReceptionLoginPage() {
  const session = await getReceptionSession();

  if (session) {
    redirect("/reception");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--navy-950)] px-4 py-10 text-[var(--soft-white)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(93,214,255,0.18),_transparent_38%),linear-gradient(180deg,#061426_0%,#0a1f35_100%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-500)] text-lg font-bold text-white shadow-[0_18px_40px_rgba(30,94,255,0.4)]">
            F
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-white">
            Reception sign in
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Approve appointment requests and manage the clinic schedule.
          </p>
        </div>

        <div className="glass-panel rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_30px_80px_rgba(2,8,20,0.45)] sm:p-7">
          <ReceptionLoginForm />

          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-[var(--muted)]">
            This area is for clinic staff only. Sessions expire automatically
            after 8 hours.
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--cyan-400)] hover:text-white">
            ← Back to the clinic website
          </Link>
        </p>
      </div>
    </main>
  );
}
