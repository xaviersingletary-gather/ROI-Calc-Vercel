import { NextRequest, NextResponse } from "next/server";

const PORTAL_ID = "22676744";
const FORM_ID = "03065de6-7378-4455-bcc4-bce765e7bf90";

const PROCESSING_CONSENT_TEXT =
  "By clicking submit, you agree to Gather AI storing your information to send you what you asked for.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = body.consent === true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "Consent required" }, { status: 400 });
  }

  const toNum = (v: unknown) => (typeof v === "number" && isFinite(v) ? String(v) : "");

  const payload = {
    fields: [
      { objectTypeId: "0-1", name: "email", value: email },
      { objectTypeId: "0-1", name: "roi_pallet_locations", value: toNum(body.palletLocations) },
      { objectTypeId: "0-1", name: "roi_cycle_count_hours", value: toNum(body.cycleCountHours) },
      { objectTypeId: "0-1", name: "roi_hours_per_shift", value: toNum(body.hoursPerShift) },
      { objectTypeId: "0-1", name: "roi_shifts_per_day", value: toNum(body.shiftsPerDay) },
      { objectTypeId: "0-1", name: "roi_forklift_drivers", value: toNum(body.forkliftDrivers) },
      { objectTypeId: "0-1", name: "roi_labor_rate", value: toNum(body.laborRate) },
      { objectTypeId: "0-1", name: "roi_total_savings", value: toNum(body.totalSavings) },
      { objectTypeId: "0-1", name: "roi_calc_completed_date", value: new Date().toISOString().split("T")[0] },
    ].filter((f) => f.value !== ""),
    context: {
      pageUri: req.headers.get("referer") ?? undefined,
      pageName: "ROI Calculator",
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: PROCESSING_CONSENT_TEXT,
      },
    },
  };

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("HubSpot submit failed:", res.status, detail);
      return NextResponse.json(
        { error: "Submission failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("HubSpot submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
