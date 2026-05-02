import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { StormBackdrop } from "@/components/StormBackdrop";
import { Logo } from "@/components/Logo";
import { PlanPicker } from "@/components/onboarding/PlanPicker";

export default async function PlanPage() {
  const session = await getSession();
  if (!session.user?.email) redirect("/");
  if (!session.user.address) redirect("/onboarding/address");

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <StormBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col pad-safe-x pad-safe-top pad-safe-bottom">
        <header className="flex items-center justify-between pt-2">
          <Logo />
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-aurora-400/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-aurora-400/60" />
            <span className="h-1.5 w-7 rounded-full bg-aurora-400" />
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.2em] text-aurora-300/80">
            Step 3 of 3
          </p>
          <h1 className="text-display text-[clamp(2rem,6.5vw,2.8rem)] leading-[1.02] tracking-tight">
            Choose your safety net.
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-white/65">
            Higher tier &rarr; higher payout when a qualifying tornado lands
            within range. Trigger and rules are identical across plans.
          </p>
        </section>

        <section className="mt-7 flex-1">
          <PlanPicker />
        </section>

        <Link
          href="/onboarding/address"
          className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white/80"
        >
          <span aria-hidden>←</span>
          Change address
        </Link>
      </div>
    </main>
  );
}
