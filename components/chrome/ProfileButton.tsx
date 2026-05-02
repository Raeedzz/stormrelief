"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout, resetWallet } from "@/app/actions/onboarding";
import { PLANS, type Plan } from "@/lib/types";
import { formatUsd } from "@/lib/payout";

export function ProfileButton({
  email,
  address,
  plan,
  walletCents,
  simulationCount,
}: {
  email: string;
  address?: string;
  plan?: Plan;
  walletCents: number;
  simulationCount: number;
}) {
  const [open, setOpen] = useState(false);
  const initial = email[0]?.toUpperCase() ?? "•";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="glass-strong relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-base shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)] transition-transform active:scale-95"
      >
        <span className="text-display tabular-nums text-[14px] font-medium tracking-tight text-white/90">
          {initial}
        </span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora-400/15 to-transparent" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-storm-950/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong absolute right-0 top-14 z-50 w-72 rounded-2xl p-4 text-sm shadow-2xl"
            >
              <div className="flex items-start gap-3 pb-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aurora-400/15 ring-1 ring-aurora-400/40 text-display text-[15px] text-aurora-200">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white/90">{email}</p>
                  {address && (
                    <p className="mt-0.5 truncate text-[12px] text-white/50">{address}</p>
                  )}
                </div>
              </div>

              {plan && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Active plan
                  </p>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-display text-[1.15rem] tracking-tight">
                      {PLANS[plan].name}
                    </span>
                    <span className="text-[12px] text-aurora-300">
                      ${(PLANS[plan].payoutLimitCents / 100).toLocaleString()} payout limit
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Wallet
                  </p>
                  <p className="text-display mt-0.5 text-[15px] tracking-tight tabular-nums">
                    {formatUsd(walletCents)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Storms
                  </p>
                  <p className="text-display mt-0.5 text-[15px] tracking-tight tabular-nums">
                    {simulationCount}
                  </p>
                </div>
              </div>

              <form action={resetWallet} className="mt-3">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-between rounded-xl border border-amber-tornado/20 bg-amber-tornado/[0.04] px-3 py-2.5 text-[13px] text-amber-tornado/90 transition-colors hover:border-amber-tornado/40 hover:bg-amber-tornado/[0.08] hover:text-amber-tornado"
                  disabled={walletCents === 0 && simulationCount === 0}
                >
                  <span className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 5.5a5 5 0 1 1-1.4 3.5" />
                      <path d="M3.5 2.5v3h3" />
                    </svg>
                    Reset wallet & history
                  </span>
                  <span className="text-[11px] text-amber-tornado/60 group-hover:text-amber-tornado">
                    Start fresh
                  </span>
                </button>
              </form>

              <form action={logout} className="mt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
