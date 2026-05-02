"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSim } from "@/lib/store";
import { formatUsd } from "@/lib/payout";

export function WalletPill() {
  const wallet = useSim((s) => s.walletCents);
  const [display, setDisplay] = useState(wallet);

  // animated count-up
  useEffect(() => {
    if (display === wallet) return;
    const start = display;
    const end = wallet;
    const duration = 1300;
    const startedAt = performance.now();

    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const next = start + (end - start) * eased;
      setDisplay(Math.round(next));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const credited = wallet > 0;

  return (
    <motion.div
      layout
      className="glass-strong relative flex items-center gap-3 rounded-full pl-2 pr-4 py-1.5 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]"
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-aurora-400/10 ring-1 ring-aurora-400/40">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-aurora-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
          <path d="M16 13h2" />
          <path d="M3 10h18" />
        </svg>
        {credited && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-aurora-300 shadow-[0_0_8px_2px_rgba(56,232,164,0.7)]" />
        )}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">Wallet</span>
        <span className="text-display text-[15px] tracking-tight tabular-nums">
          {formatUsd(display)}
        </span>
      </div>
    </motion.div>
  );
}
