import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { StormBackdrop } from "@/components/StormBackdrop";
import { Logo } from "@/components/Logo";
import { AddressForm } from "@/components/onboarding/AddressForm";

export default async function AddressPage() {
  const session = await getSession();
  if (!session.user?.email) redirect("/");
  if (session.user.address && session.user.plan) redirect("/map");

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <StormBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col pad-safe-x pad-safe-top pad-safe-bottom">
        <header className="flex items-center justify-between pt-2">
          <Logo />
          <StepDots step={1} />
        </header>

        <section className="mt-8 flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.2em] text-aurora-300/80">
            Step 2 of 3
          </p>
          <h1 className="text-display text-[clamp(2rem,6.5vw,2.8rem)] leading-[1.02] tracking-tight">
            Where do you call home?
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-white/65">
            We use this to know exactly when a qualifying tornado has passed
            within range. Your address never leaves your account.
          </p>
        </section>

        <section className="mt-7 flex-1">
          <AddressForm />
        </section>

        <Link
          href="/"
          className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white/80"
        >
          <span aria-hidden>←</span>
          Use a different email
        </Link>
      </div>
    </main>
  );
}

function StepDots({ step }: { step: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={
            i === step
              ? "h-1.5 w-7 rounded-full bg-aurora-400"
              : i < step
              ? "h-1.5 w-1.5 rounded-full bg-aurora-400/60"
              : "h-1.5 w-1.5 rounded-full bg-white/15"
          }
        />
      ))}
    </div>
  );
}
