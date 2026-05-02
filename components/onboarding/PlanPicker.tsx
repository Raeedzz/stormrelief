"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { selectPlan } from "@/app/actions/onboarding";
import { PLANS, type Plan } from "@/lib/types";
import { cn } from "@/lib/cn";

type PlanCard = {
  key: Plan;
  tagline: string;
  features: string[];
  accent: "aurora" | "amber" | "magenta";
};

const CARDS: PlanCard[] = [
  {
    key: "basic",
    tagline: "Starter coverage for any home.",
    features: [
      "Up to $5,000 instant payout",
      "EF2+ trigger, 0.5 mi radius",
      "Email alerts when relief lands",
    ],
    accent: "aurora",
  },
  {
    key: "plus",
    tagline: "Most picked. Three-times the coverage.",
    features: [
      "Up to $15,000 instant payout",
      "All Basic features",
      "Priority FedNow disbursement",
      "Dedicated relief concierge",
    ],
    accent: "amber",
  },
  {
    key: "premium",
    tagline: "Maximum protection, peace of mind.",
    features: [
      "Up to $25,000 instant payout",
      "All Plus features",
      "Family + dependent coverage",
      "Re-housing & travel support",
    ],
    accent: "magenta",
  },
];

export function PlanPicker() {
  const [selected, setSelected] = useState<Plan | null>("plus");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        if (!selected) {
          setError("Pick a plan to continue.");
          return;
        }
        fd.set("plan", selected);
        startTransition(async () => {
          const r = await selectPlan(fd);
          if (r?.error) setError(r.error);
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-3">
        {CARDS.map((card, i) => {
          const isSelected = selected === card.key;
          const meta = PLANS[card.key];
          return (
            <motion.button
              key={card.key}
              type="button"
              onClick={() => setSelected(card.key)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group relative overflow-hidden rounded-3xl border p-5 text-left transition-all",
                isSelected
                  ? "glass-strong border-aurora-400/50 shadow-[0_0_0_1px_rgba(56,232,164,0.4),0_24px_48px_-16px_rgba(56,232,164,0.35)]"
                  : "glass border-white/10 hover:border-white/25"
              )}
            >
              {card.key === "plus" && (
                <span className="absolute right-4 top-4 rounded-full border border-amber-tornado/30 bg-amber-tornado/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-tornado">
                  Popular
                </span>
              )}
              <div className="flex items-baseline gap-3">
                <h3 className="text-display text-[1.6rem] tracking-tight">{meta.name}</h3>
                <span
                  className={cn(
                    "text-sm",
                    isSelected ? "text-aurora-300" : "text-white/45"
                  )}
                >
                  ${meta.priceYear}/yr
                </span>
              </div>
              <p className="mt-1 text-[13px] text-white/55">{card.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-display text-[2.4rem] leading-none tracking-tight">
                  ${(meta.payoutLimitCents / 100).toLocaleString()}
                </span>
                <span className="text-[12px] uppercase tracking-[0.18em] text-white/40">
                  payout limit
                </span>
              </div>
              <ul className="mt-4 grid gap-1.5">
                {card.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-white/72">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <div
                className={cn(
                  "absolute inset-y-4 right-4 flex items-center transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-aurora-400 text-storm-950">
                  <Check className="h-4 w-4" strokeWidth={2.6} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {error && <p className="text-sm text-magenta-tornado">{error}</p>}

      <button
        type="submit"
        disabled={!selected || pending}
        className="relative mt-2 w-full rounded-2xl bg-aurora-400 px-5 py-4 text-base font-medium text-storm-950 shadow-[0_8px_28px_-8px_rgba(56,232,164,0.6)] transition-all hover:bg-aurora-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className={pending ? "opacity-0" : "opacity-100"}>
          {selected ? `Start protection — $${PLANS[selected].priceYear}/yr` : "Pick a plan"}
        </span>
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-storm-950/30 border-t-storm-950" />
          </span>
        )}
      </button>
      <p className="text-center text-[12px] text-white/40">
        Demo mode — no card required. Cancel anytime.
      </p>
    </form>
  );
}

function Check({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 8.5 3.5 3.5L13 5" />
    </svg>
  );
}
