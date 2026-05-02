import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { MapShell } from "@/components/map/MapShell";

export default async function MapPage() {
  const session = await getSession();
  if (!session.user?.email) redirect("/");
  if (!session.user.address || !session.user.lat || !session.user.lon) {
    redirect("/onboarding/address");
  }
  if (!session.user.plan) {
    redirect("/onboarding/plan");
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <MapShell user={session.user} />
    </main>
  );
}
