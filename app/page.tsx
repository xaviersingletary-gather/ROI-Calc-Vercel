"use client";

import { useState, useMemo } from "react";

// ============================================================
// BAKED-IN ASSUMPTIONS (easy to tune)
// ============================================================
const WORKING_DAYS_PER_YEAR = 260;
const DRONE_CYCLE_COUNT_ELIMINATION = 0.9; // 90% of manual cycle count labor eliminated
const MHE_PRODUCTIVITY_GAIN = 0.12; // 12% productivity improvement from fleet visibility

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
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-lg font-semibold text-white tabular-nums font-mono">
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
      <div className="flex justify-between text-xs text-slate-600">
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
  // --- inputs ---
  const [palletLocations, setPalletLocations] = useState(50000);
  const [cycleCountHours, setCycleCountHours] = useState(16);
  const [hoursPerShift, setHoursPerShift] = useState(8);
  const [shiftsPerDay, setShiftsPerDay] = useState(2);
  const [forkliftDrivers, setForkliftDrivers] = useState(25);
  const [laborRate, setLaborRate] = useState(35);

  // --- email capture ---
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  // --- form ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to HubSpot form API or SendGrid
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0C1220]">
      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Gather AI
            </span>
          </div>
          <span className="text-slate-500 text-sm hidden sm:block">
            ROI Calculator
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Calculate your{" "}
            <span className="text-green-400">warehouse savings</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            See how autonomous drones and MHE fleet intelligence reduce labor
            costs across your operation.
          </p>
        </div>
      </section>

      {/* ── Calculator ── */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Inputs */}
          <div className="space-y-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Your Operation
            </h2>

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
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Estimated Annual Savings
            </h2>

            {/* Total savings card */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/20 rounded-2xl p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
                Total Annual Savings
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-white mt-3 tabular-nums font-mono savings-number">
                {fmt(totalSavings)}
              </p>
              <p className="text-slate-400 mt-3 text-sm">
                {fmt(totalSavings / 12)}/month &middot;{" "}
                {fmt(savingsPerLocation)} per pallet location
              </p>

              {/* Proportion bar */}
              <div className="mt-6">
                <div className="flex rounded-full h-3 overflow-hidden bg-slate-800">
                  <div
                    className="proportion-bar bg-green-500 rounded-l-full"
                    style={{ width: `${dronePct}%` }}
                  />
                  <div
                    className="proportion-bar bg-blue-500 rounded-r-full"
                    style={{ width: `${100 - dronePct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-green-400">
                    Drone Vision &middot; {Math.round(dronePct)}%
                  </span>
                  <span className="text-blue-400">
                    MHE Vision &middot; {Math.round(100 - dronePct)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Drone Vision card */}
            <div className="bg-[#151F30] border border-slate-700/40 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-green-400"
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
                    <p className="text-xs text-slate-500">
                      Autonomous inventory scanning
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-400 tabular-nums font-mono">
                  {fmt(droneSavings)}
                </p>
              </div>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                Replaces{" "}
                <span className="text-slate-200 font-medium">
                  {num(cycleCountHours)} hrs/day
                </span>{" "}
                of manual cycle counting with autonomous drone scans, eliminating{" "}
                {Math.round(DRONE_CYCLE_COUNT_ELIMINATION * 100)}% of that labor
                cost.
              </p>
            </div>

            {/* MHE Vision card */}
            <div className="bg-[#151F30] border border-slate-700/40 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-400"
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
                    <p className="text-xs text-slate-500">
                      Fleet intelligence &amp; productivity
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-400 tabular-nums font-mono">
                  {fmt(mheSavings)}
                </p>
              </div>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                Real-time visibility across{" "}
                <span className="text-slate-200 font-medium">
                  {num(forkliftDrivers)} drivers
                </span>{" "}
                over{" "}
                <span className="text-slate-200 font-medium">
                  {shiftsPerDay} shift{shiftsPerDay > 1 ? "s" : ""}
                </span>{" "}
                drives a {Math.round(MHE_PRODUCTIVITY_GAIN * 100)}% productivity
                improvement through optimized routing and utilization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Want a detailed analysis for your operation?
          </h2>
          <p className="mt-3 text-slate-400 leading-relaxed">
            Our team will build a full ROI model customized to your facilities,
            inventory profile, and operational goals.
          </p>

          {!submitted ? (
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
                className="h-12 px-4 rounded-xl bg-[#151F30] border border-slate-700/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 sm:w-80 transition-shadow"
              />
              <button
                type="submit"
                className="h-12 px-8 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-400 active:bg-green-600 transition-colors cursor-pointer"
              >
                Get My Report
              </button>
            </form>
          ) : (
            <div className="mt-8 p-6 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 font-medium">
                We&apos;ll send a custom analysis to{" "}
                <span className="text-white">{email}</span> shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
          <p>
            &copy; {new Date().getFullYear()} Gather AI. All rights reserved.
          </p>
          <p className="mt-1">
            Savings estimates based on industry benchmarks. Actual results vary
            by operation.
          </p>
        </div>
      </footer>
    </div>
  );
}
