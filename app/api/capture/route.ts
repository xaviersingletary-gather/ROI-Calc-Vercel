import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("GOOGLE_SCRIPT_URL env var not set");
    return NextResponse.json(
      { error: "Capture endpoint not configured" },
      { status: 500 }
    );
  }

  const payload = JSON.stringify({
    email: body.email,
    palletLocations: body.palletLocations,
    cycleCountHours: body.cycleCountHours,
    hoursPerShift: body.hoursPerShift,
    shiftsPerDay: body.shiftsPerDay,
    forkliftDrivers: body.forkliftDrivers,
    laborRate: body.laborRate,
    droneSavings: body.droneSavings,
    mheSavings: body.mheSavings,
    totalSavings: body.totalSavings,
  });

  try {
    // Apps Script returns a 302 redirect on POST. Using redirect: "manual"
    // prevents fetch from converting POST→GET (which loses the body).
    // A 302 means Apps Script processed the request successfully.
    const res = await fetch(scriptUrl, {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    console.log("Apps Script response:", res.status, res.statusText);

    // 302 = Apps Script processed and is redirecting (success)
    // 200 = Direct success response
    if (res.status === 302 || res.ok) {
      return NextResponse.json({ status: "ok" });
    }

    console.error("Apps Script unexpected status:", res.status);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  } catch (err) {
    console.error("Capture error:", err);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
