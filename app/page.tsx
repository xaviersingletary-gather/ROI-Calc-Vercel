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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Inputs */}
          <div className="space-y-7">
            <div>
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
          <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <h2
              className="text-xs font-semibold uppercase text-[var(--text-muted)]"
              style={{ letterSpacing: "0.1em" }}
            >
              Annual Savings
            </h2>

            {/* Total savings card — dark panel */}
            <div className="bg-[var(--panel-dark)] rounded-2xl p-7">
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

              <a
                href="#build-my-model"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("build-my-model")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-6 block w-full text-center bg-[var(--java)] text-[var(--panel-darker)] font-semibold py-3.5 px-5 rounded-xl hover:brightness-95 transition-[filter,transform] active:scale-[0.99]"
                style={{ letterSpacing: "-0.01em" }}
              >
                Build my ROI model
              </a>
            </div>

            {/* Drone Vision card — light */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
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
                      Automated drone cycle counts
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

            {/* MHE Vision card — light */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
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
      </section>

      {/* ── CTA ── */}
      <section
        id="build-my-model"
        className="px-6 py-20 bg-[var(--surface)] scroll-mt-8"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]"
            style={{ letterSpacing: "-0.03em" }}
          >
            Curious what this looks like at your scale?
          </h2>
          <p
            className="mt-3 text-[var(--text-secondary)] leading-relaxed"
            style={{ letterSpacing: "-0.02em" }}
          >
            Our team builds a full ROI model around your facilities, inventory
            profile, and operational targets.
          </p>

          <div className="mt-8">
            <div
              className="hs-form-frame"
              data-region="na1"
              data-form-id="03065de6-7378-4455-bcc4-bce765e7bf90"
              data-portal-id="22676744"
            />
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
