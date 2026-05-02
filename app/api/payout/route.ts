import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendPayoutEmail } from "@/lib/email";
import type { SimulationResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  const user = session.user;
  if (!user || !user.lat || !user.lon || !user.payoutLimitCents) {
    return NextResponse.json({ error: "Not onboarded" }, { status: 401 });
  }

  const sim = (await req.json()) as SimulationResult;
  if (!sim || typeof sim.payoutCents !== "number") {
    return NextResponse.json({ error: "Bad simulation payload" }, { status: 400 });
  }

  const newBalance = user.walletCents + sim.payoutCents;
  session.user = {
    ...user,
    walletCents: newBalance,
    lastSimulation: sim,
    lastSimulationAt: new Date().toISOString(),
    simulationCount: (user.simulationCount ?? 0) + 1,
  };
  await session.save();

  let emailStatus: "sent" | "logged" | "skipped" = "skipped";
  if (sim.payoutCents > 0) {
    emailStatus = await sendPayoutEmail({
      to: user.email,
      payoutCents: sim.payoutCents,
      walletCents: newBalance,
      tornado: sim.event,
      distanceMiles: sim.distanceMiles,
    });
  }

  return NextResponse.json({
    walletCents: newBalance,
    payoutCents: sim.payoutCents,
    emailStatus,
  });
}
