"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "min-h-12 w-full rounded-xl border border-white/10 bg-[#0b2038] px-4 py-3 pr-20 text-base text-white placeholder:text-white/35 outline-none transition focus:border-[var(--cyan-400)]/60 focus:ring-2 focus:ring-[var(--cyan-400)]/20";

export function ReceptionLoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/reception/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "The passcode is incorrect.");
        return;
      }

      router.replace("/reception");
      router.refresh();
    } catch {
      setError(
        "We could not reach the clinic server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="reception-passcode"
          className="mb-2 block text-sm font-medium text-white"
        >
          Reception passcode
        </label>
        <div className="relative">
          <input
            id="reception-passcode"
            name="passcode"
            type={showPasscode ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            className={inputClasses}
            required
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "reception-passcode-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPasscode((visible) => !visible)}
            className="absolute inset-y-0 right-2 my-auto min-h-9 rounded-lg px-3 text-xs font-medium text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
          >
            {showPasscode ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error ? (
        <div
          id="reception-passcode-error"
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-6 text-rose-200"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitting || !passcode}
        className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Signing in…
          </>
        ) : (
          "Sign in to reception"
        )}
      </Button>
    </form>
  );
}
