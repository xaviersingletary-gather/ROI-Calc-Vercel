"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

// ============================================================
// BAKED-IN ASSUMPTIONS (easy to tune)
// ============================================================
const WORKING_DAYS_PER_YEAR = 260;
const DRONE_CYCLE_COUNT_ELIMINATION = 0.9;
const MHE_PRODUCTIVITY_GAIN = 0.12;

// ============================================================
// HELPERS
// ============================================================
function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function num(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// ============================================================
// SLIDER
// ============================================================
function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
        <span className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">
          {prefix}
          {num(value)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ "--fill-percent": `${pct}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span>
          {prefix}
          {num(min)}
          {unit}
        </span>
        <span>
          {prefix}
          {num(max)}
          {unit}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================
export default function ROICalculator() {
  const [palletLocations, setPalletLocations] = useState(50000);
  const [cycleCountHours, setCycleCountHours] = useState(16);
  const [hoursPerShift, setHoursPerShift] = useState(8);
  const [shiftsPerDay, setShiftsPerDay] = useState(2);
  const [forkliftDrivers, setForkliftDrivers] = useState(25);
  const [laborRate, setLaborRate] = useState(35);

  // --- form state ---
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // --- calculations ---
  const droneSavings = useMemo(
    () =>
      cycleCountHours *
      WORKING_DAYS_PER_YEAR *
      laborRate *
      DRONE_CYCLE_COUNT_ELIMINATION,
    [cycleCountHours, laborRate]
  );

  const mheSavings = useMemo(
    () =>
      forkliftDrivers *
      hoursPerShift *
      shiftsPerDay *
      WORKING_DAYS_PER_YEAR *
      laborRate *
      MHE_PRODUCTIVITY_GAIN,
    [forkliftDrivers, hoursPerShift, shiftsPerDay, laborRate]
  );

  const totalSavings = droneSavings + mheSavings;
  const savingsPerLocation =
    palletLocations > 0 ? totalSavings / palletLocations : 0;
  const dronePct =
    totalSavings > 0 ? (droneSavings / totalSavings) * 100 : 50;

  // --- submit handler ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setEmailError(emailValid ? "" : "Please enter a valid email.");
    setConsentError(consent ? "" : "Please agree to continue.");
    if (!emailValid || !consent) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/hubspot-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consent,
          palletLocations,
          cycleCountHours,
          hoursPerShift,
          shiftsPerDay,
          forkliftDrivers,
          laborRate,
          totalSavings: Math.round(totalSavings),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Header ── */}
      <header className="border-b border-[var(--border-subtle)] px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Image
            src="/gather-logo-dark.svg"
            alt="Gather AI"
            width={160}
            height={24}
            priority
          />
          <span className="text-[var(--text-muted)] text-sm hidden sm:block">
            ROI Calculator
          </span>
        </div>
      </header>

      {/* ── Calculator ── */}
      <section className="px-6 pt-12 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Headline — full width on all breakpoints, always at top */}
          <div className="mb-10 lg:mb-12 max-w-2xl">
            <h1
              className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Your warehouse. Your numbers.{" "}
              <span className="text-[var(--mineral)]">Your ROI.</span>
            </h1>
            <p
              className="mt-3 text-[var(--text-secondary)] leading-relaxed"
              style={{ letterSpacing: "-0.02em" }}
            >
              The savings aren't just from cycle counting. Enter your warehouse variables and see the full picture, across both automated floor scanning and dock-to-dock pallet visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Inputs — first on both breakpoints (natural DOM order) */}
            <div className="space-y-7">
              <Slider
              label="Pallet Locations"
              value={palletLocations}
              min={1000}
              max={500000}
              step={1000}
              onChange={setPalletLocations}
            />

            <Slider
              label="Cycle Counting (total hours per day)"
              value={cycleCountHours}
              min={1}
              max={100}
              step={1}
              unit=" hrs"
              onChange={setCycleCountHours}
            />

            <div className="grid grid-cols-2 gap-6">
              <Slider
                label="Hours per Shift"
                value={hoursPerShift}
                min={4}
                max={12}
                step={1}
                unit=" hrs"
                onChange={setHoursPerShift}
              />
              <Slider
                label="Shifts per Day"
                value={shiftsPerDay}
                min={1}
                max={3}
                step={1}
                onChange={setShiftsPerDay}
              />
            </div>

            <Slider
              label="Forklift Drivers"
              value={forkliftDrivers}
              min={1}
              max={200}
              step={1}
              onChange={setForkliftDrivers}
            />

            <Slider
              label="Fully Burdened Labor Rate"
              value={laborRate}
              min={15}
              max={75}
              step={1}
              prefix="$"
              unit="/hr"
              onChange={setLaborRate}
            />
          </div>

            {/* Results — second on both; mobile reorders children so CTA lands last */}
            <div className="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
            <h2
              className="hidden lg:block text-xs font-semibold uppercase text-[var(--text-muted)] lg:order-1"
              style={{ letterSpacing: "0.1em" }}
            >
              Annual Savings
            </h2>

            {/* Total savings card + form — last on mobile (the CTA), first on desktop */}
            <div className="bg-[var(--panel-dark)] rounded-2xl p-7 order-3 lg:order-2">
              <p
                className="text-xs font-semibold uppercase text-[var(--java)]"
                style={{ letterSpacing: "0.1em" }}
              >
                Total Annual Savings
              </p>
              <p
                className="text-4xl sm:text-5xl font-bold text-white mt-2 tabular-nums"
                style={{ letterSpacing: "-0.03em" }}
              >
                {fmt(totalSavings)}
              </p>
              <p className="text-white/60 mt-3 text-sm">
                {fmt(totalSavings / 12)}/month &middot;{" "}
                {fmt(savingsPerLocation)} per pallet location
              </p>

              {/* Proportion bar */}
              <div className="mt-6">
                <div className="flex rounded-full h-2.5 overflow-hidden bg-white/10">
                  <div
                    className="proportion-bar rounded-l-full"
                    style={{
                      width: `${dronePct}%`,
                      backgroundColor: "var(--java)",
                    }}
                  />
                  <div
                    className="proportion-bar rounded-r-full"
                    style={{
                      width: `${100 - dronePct}%`,
                      backgroundColor: "var(--brand-blue)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-[var(--java)]">
                    Drone Vision &middot; {Math.round(dronePct)}%
                  </span>
                  <span className="text-[var(--brand-blue)]">
                    MHE Vision &middot; {Math.round(100 - dronePct)}%
                  </span>
                </div>
              </div>

              {/* Nested form — always visible inside the dark panel */}
              <div className="mt-6 pt-6 border-t border-white/10">
                {submitted ? (
                  <div className="text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--java)]/20 flex items-center justify-center mx-auto">
                      <svg
                        className="w-5 h-5 text-[var(--java)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <p
                      className="mt-3 text-base font-semibold text-white"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      Thanks. We&rsquo;ve got your info.
                    </p>
                    <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
                      A Gather AI specialist will reach out within 1 business
                      day to walk through {fmt(totalSavings)} in estimated
                      annual savings.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-3"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-white/80 mb-1.5"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        Enter your work email to get a validated model
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        aria-invalid={!!emailError}
                        aria-describedby={
                          emailError ? "email-error" : undefined
                        }
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-[3px] focus:ring-[var(--java)]/30 transition-[border-color,box-shadow] ${
                          emailError
                            ? "border-[#C94B38]"
                            : "border-transparent"
                        }`}
                        placeholder="you@company.com"
                      />
                      {emailError && (
                        <p
                          id="email-error"
                          className="mt-1 text-xs text-[#FF9285]"
                        >
                          {emailError}
                        </p>
                      )}
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          if (consentError && e.target.checked)
                            setConsentError("");
                        }}
                        aria-invalid={!!consentError}
                        aria-describedby={
                          consentError ? "consent-error" : undefined
                        }
                        className="mt-0.5 h-3.5 w-3.5 rounded cursor-pointer accent-[var(--java)]"
                      />
                      <span className="text-[11px] text-white/60 leading-snug">
                        I agree to receive other communications from Gather AI.
                        You can unsubscribe any time. By clicking submit, you
                        agree to Gather AI storing your information to send you
                        what you asked for.
                      </span>
                    </label>
                    {consentError && (
                      <p id="consent-error" className="text-xs text-[#FF9285]">
                        {consentError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[var(--java)] text-[var(--panel-darker)] font-semibold py-3 px-5 rounded-lg hover:brightness-95 transition-[filter,transform] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {submitting ? "Submitting\u2026" : "Build my ROI model"}
                    </button>

                    {submitError && (
                      <p className="text-xs text-[#FF9285] text-center">
                        {submitError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Drone Vision card — first on mobile, middle on desktop */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 order-1 lg:order-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--java-dim)]">
                    <svg
                      className="w-5 h-5 text-[var(--mineral)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-semibold">
                      Drone Vision
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Autonomous Floor Visibility
                    </p>
                  </div>
                </div>
                <p
                  className="text-2xl font-bold text-[var(--mineral)] tabular-nums"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {fmt(droneSavings)}
                </p>
              </div>
              <p
                className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed"
                style={{ letterSpacing: "-0.02em" }}
              >
                Replaces{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {num(cycleCountHours)} hrs/day
                </span>{" "}
                of manual cycle counting with automated drone scans up to 15x
                faster. That eliminates{" "}
                {Math.round(DRONE_CYCLE_COUNT_ELIMINATION * 100)}% of the
                associated labor cost.
              </p>
            </div>

            {/* MHE Vision card — second on mobile, last on desktop */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 order-2 lg:order-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--brand-blue-dim)]">
                    <svg
                      className="w-5 h-5 text-[var(--brand-blue)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h2.25m0 0V9.375c0-.621.504-1.125 1.125-1.125h3.026a1.5 1.5 0 011.06.44l2.89 2.89a1.5 1.5 0 01.44 1.06v1.61m-6.541 0h6.541"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-semibold">
                      MHE Vision
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Dock-to-dock pallet visibility
                    </p>
                  </div>
                </div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{
                    color: "var(--brand-blue)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {fmt(mheSavings)}
                </p>
              </div>
              <p
                className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed"
                style={{ letterSpacing: "-0.02em" }}
              >
                MHE-mounted cameras capture every pallet move across{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {num(forkliftDrivers)} drivers
                </span>{" "}
                and{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {shiftsPerDay} shift{shiftsPerDay > 1 ? "s" : ""}
                </span>
                . Optimized routes and balanced workloads drive a{" "}
                {Math.round(MHE_PRODUCTIVITY_GAIN * 100)}% productivity uplift.
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--panel-darker)] px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/gather-logo.svg"
            alt="Gather AI"
            width={120}
            height={18}
          />
          <div className="text-sm text-white/40 text-center sm:text-right">
            <p>
              &copy; {new Date().getFullYear()} Gather AI. All rights reserved.
            </p>
            <p className="mt-1">
              Savings estimates based on industry benchmarks.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
