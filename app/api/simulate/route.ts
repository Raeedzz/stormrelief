import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { buildSimulation } from "@/lib/tornadoes";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  const user = session.user;
  if (!user || !user.lat || !user.lon || !user.payoutLimitCents) {
    return NextResponse.json({ error: "Not onboarded" }, { status: 401 });
  }
  const sim = buildSimulation(user.lat, user.lon, user.payoutLimitCents);
  if (!sim) {
    return NextResponse.json(
      { error: "No qualifying historical tornado found" },
      { status: 404 }
    );
  }
  return NextResponse.json(sim);
}
