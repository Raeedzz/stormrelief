import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  const user = session.user;
  if (!user) return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({
    lastSimulation: user.lastSimulation ?? null,
    lastSimulationAt: user.lastSimulationAt ?? null,
    simulationCount: user.simulationCount ?? 0,
    walletCents: user.walletCents ?? 0,
  });
}
