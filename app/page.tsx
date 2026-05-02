import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StormBackdrop } from "@/components/StormBackdrop";
import { Logo } from "@/components/Logo";
import { EmailForm } from "@/components/onboarding/EmailForm";

export default async function HomePage() {
  const session = await getSession();
  if (session.user?.plan && session.user.lat && session.user.lon) {
    redirect("/map");
  }
  if (session.user?.email && !session.user?.address) {
    redirect("/onboarding/address");
  }
  if (session.user?.address && !session.user.plan) {
    redirect("/onboarding/plan");
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <StormBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col pad-safe-x pad-safe-top pad-safe-bottom">
        <header className="flex items-center justify-between pt-2">
          <Logo />
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] tracking-wide text-white/55">
            BETA
          </span>
        </header>

        <section className="mt-auto flex flex-col gap-7 pb-8">
          <div>
            <h1 className="text-display text-[clamp(2.6rem,8vw,4.2rem)] leading-[0.95] tracking-tight">
              No claims.
              <br />
              No waiting.
              <br />
              <span className="bg-gradient-to-r from-aurora-300 via-aurora-400 to-aurora-200 bg-clip-text text-transparent">
                Just relief.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-balance text-[15px] leading-relaxed text-white/65">
              Parametric tornado insurance. The instant a qualifying tornado
              passes near your home, money lands in your wallet — and an email
              checks in on you and your family.
            </p>
          </div>
          <EmailForm />

          <ul className="grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.16em] text-white/45">
            <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
              120+&nbsp;mph trigger
            </li>
            <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
              Instant&nbsp;FedNow
            </li>
            <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
              Real&nbsp;NOAA&nbsp;data
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
