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

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });

    if (!res.ok) {
      console.error("Apps Script error:", res.status);
      return NextResponse.json(
        { error: "Failed to save" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Capture error:", err);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
