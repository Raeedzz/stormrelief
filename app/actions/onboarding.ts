"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PLANS, type Plan, type SessionUser } from "@/lib/types";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function startOnboarding(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!isEmail(email)) {
    return { error: "Please enter a valid email." };
  }
  const session = await getSession();
  const existing = session.user;
  const user: SessionUser = existing && existing.email === email
    ? existing
    : {
        email,
        walletCents: 0,
        createdAt: new Date().toISOString(),
      };
  session.user = user;
  await session.save();
  redirect("/onboarding/address");
}

export async function saveAddress(formData: FormData) {
  const session = await getSession();
  if (!session.user) redirect("/");
  const address = String(formData.get("address") || "").trim();
  const lat = Number(formData.get("lat"));
  const lon = Number(formData.get("lon"));
  if (!address || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { error: "Please pick an address from the suggestions." };
  }
  session.user = { ...session.user, address, lat, lon };
  await session.save();
  redirect("/onboarding/plan");
}

export async function selectPlan(formData: FormData) {
  const session = await getSession();
  if (!session.user) redirect("/");
  const plan = String(formData.get("plan") || "") as Plan;
  if (!PLANS[plan]) {
    return { error: "Pick a plan to continue." };
  }
  session.user = {
    ...session.user,
    plan,
    payoutLimitCents: PLANS[plan].payoutLimitCents,
  };
  await session.save();
  redirect("/map");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}

export async function resetWallet() {
  const session = await getSession();
  if (!session.user) redirect("/");
  session.user = {
    ...session.user,
    walletCents: 0,
    lastSimulation: undefined,
    lastSimulationAt: undefined,
    simulationCount: 0,
  };
  await session.save();
  redirect("/map");
}
