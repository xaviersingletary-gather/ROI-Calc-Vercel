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
        <label className="text-sm font-medium text-[var(--light-grey)]">
          {label}
        </label>
        <span className="text-lg font-semibold text-white tabular-nums">
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
      <div className="flex justify-between text-xs text-[var(--grey)]">
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

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          palletLocations,
          cycleCountHours,
          hoursPerShift,
          shiftsPerDay,
          forkliftDrivers,
          laborRate,
          droneSavings,
          mheSavings,
          totalSavings,
        }),
      });
    } catch {
      // Show modal regardless — we don't want a backend issue to block the UX
    }
    setSubmitting(false);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Header ── */}
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Image
            src="/gather-logo.svg"
            alt="Gather AI"
            width={160}
            height={24}
            priority
          />
          <span className="text-[var(--grey)] text-sm hidden sm:block">
            ROI Calculator
          </span>
        </div>
      </header>

      {/* ── Hero + Calculator ── */}
      <section className="px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left: Inputs */}
          <div className="space-y-6">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-white leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                See what autonomous inventory{" "}
                <span className="text-[var(--java)]">actually saves you</span>
              </h1>
              <p
                className="mt-2 text-sm text-[var(--light-grey)] leading-relaxed"
                style={{ letterSpacing: "-0.02em" }}
              >
                Plug in your numbers. Watch the math work.
              </p>
            </div>

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

          {/* Right: Results */}
          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <h2
              className="text-xs font-semibold uppercase text-[var(--grey)]"
              style={{ letterSpacing: "0.1em" }}
            >
              Estimated Annual Savings
            </h2>

            {/* Total savings card */}
            <div className="bg-[var(--mineral)] border border-[var(--java)]/20 rounded-2xl p-6">
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
              <p className="text-[var(--light-grey)] mt-3 text-sm">
                {fmt(totalSavings / 12)}/month &middot;{" "}
                {fmt(savingsPerLocation)} per pallet location
              </p>

              {/* Proportion bar */}
              <div className="mt-6">
                <div className="flex rounded-full h-3 overflow-hidden bg-[var(--background)]">
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
            </div>

            {/* Drone Vision card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(20, 226, 172, 0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "var(--java)" }}
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
                    <p className="text-white font-semibold">Drone Vision</p>
                    <p className="text-xs text-[var(--grey)]">
                      Autonomous inventory scanning
                    </p>
                  </div>
                </div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: "var(--java)", letterSpacing: "-0.03em" }}
                >
                  {fmt(droneSavings)}
                </p>
              </div>
              <p
                className="text-sm text-[var(--light-grey)] mt-4 leading-relaxed"
                style={{ letterSpacing: "-0.02em" }}
              >
                Replaces{" "}
                <span className="text-white font-medium">
                  {num(cycleCountHours)} hrs/day
                </span>{" "}
                of manual cycle counting with autonomous drone scans —
                eliminating{" "}
                {Math.round(DRONE_CYCLE_COUNT_ELIMINATION * 100)}% of that
                labor cost.
              </p>
            </div>

            {/* MHE Vision card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(118, 174, 234, 0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "var(--brand-blue)" }}
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
                    <p className="text-white font-semibold">MHE Vision</p>
                    <p className="text-xs text-[var(--grey)]">
                      Fleet intelligence &amp; productivity
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
                className="text-sm text-[var(--light-grey)] mt-4 leading-relaxed"
                style={{ letterSpacing: "-0.02em" }}
              >
                Real-time visibility across{" "}
                <span className="text-white font-medium">
                  {num(forkliftDrivers)} drivers
                </span>{" "}
                over{" "}
                <span className="text-white font-medium">
                  {shiftsPerDay} shift{shiftsPerDay > 1 ? "s" : ""}
                </span>{" "}
                — a {Math.round(MHE_PRODUCTIVITY_GAIN * 100)}% productivity
                uplift through smarter routing and utilization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ letterSpacing: "-0.03em" }}
          >
            Curious what this looks like at your scale?
          </h2>
          <p
            className="mt-3 text-[var(--light-grey)] leading-relaxed"
            style={{ letterSpacing: "-0.02em" }}
          >
            Our team builds a full ROI model around your facilities, inventory
            profile, and operational targets.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <input
              type="email"
              required
              placeholder="Your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-white placeholder:text-[var(--grey)] focus:outline-none focus:ring-2 focus:border-transparent sm:w-80 transition-shadow"
              style={
                {
                  "--tw-ring-color": "rgba(20, 226, 172, 0.4)",
                } as React.CSSProperties
              }
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-8 rounded-xl text-[var(--background)] font-semibold hover:opacity-90 active:opacity-100 transition-opacity cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: "var(--java)" }}
            >
              {submitting ? "Sending..." : "Get My Report"}
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-[var(--grey)]">
          <p>
            &copy; {new Date().getFullYear()} Gather AI. All rights reserved.
          </p>
          <p className="mt-1">
            Savings estimates based on industry benchmarks. Actual results vary
            by operation.
          </p>
        </div>
      </footer>

      {/* ── Thank You Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] p-8 text-center"
            style={{ backgroundColor: "var(--surface-elevated)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[var(--grey)] hover:text-white transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(20, 226, 172, 0.1)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--java)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3
              className="text-xl font-bold text-white"
              style={{ letterSpacing: "-0.03em" }}
            >
              Thanks &mdash; we&apos;ve got your info.
            </h3>

            <p
              className="mt-6 text-4xl font-bold tabular-nums"
              style={{ color: "var(--java)", letterSpacing: "-0.03em" }}
            >
              {fmt(totalSavings)}
            </p>
            <p className="text-sm text-[var(--grey)] mt-1">
              your estimated annual savings
            </p>

            <p
              className="mt-6 text-sm text-[var(--light-grey)] leading-relaxed"
              style={{ letterSpacing: "-0.02em" }}
            >
              We&apos;ll send a detailed analysis to{" "}
              <span className="text-white font-medium">{email}</span> within 1
              business day.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-8 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: "var(--java)" }}
            >
              Back to calculator
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
