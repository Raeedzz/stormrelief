"use client";

import { motion } from "framer-motion";
import { useSim } from "@/lib/store";

export function SimulateButton({ onTrigger }: { onTrigger: () => void }) {
  const state = useSim((s) => s.state);
  const disabled = state === "fetching" || state === "playing";

  return (
    <motion.button
      type="button"
      onClick={onTrigger}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex h-[68px] min-w-[210px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-br from-amber-tornado via-magenta-tornado to-amber-tornado bg-[length:200%_100%] px-6 text-[15px] font-medium tracking-tight text-storm-950 shadow-[0_0_0_1px_rgba(255,255,255,0.18)_inset,0_24px_48px_-12px_rgba(255,61,139,0.55),0_0_64px_-8px_rgba(255,157,47,0.5)] transition-all hover:bg-[position:100%_0%] disabled:cursor-not-allowed disabled:opacity-80"
    >
      {/* Outer aura */}
      <span aria-hidden className="absolute -inset-3 -z-10 rounded-full bg-gradient-to-br from-amber-tornado/30 to-magenta-tornado/30 blur-2xl" />

      {/* Pulsing ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border border-white/30"
        style={{ animation: disabled ? "none" : "pulse 2.6s cubic-bezier(0.4,0,0.6,1) infinite" }}
      />

      <SwirlIcon className={"h-6 w-6 transition-transform " + (disabled ? "animate-spin" : "group-hover:rotate-12")} />
      <span className="text-display text-[16px] tracking-tight">
        {state === "fetching"
          ? "Tracking storm…"
          : state === "playing"
          ? "Storm in progress"
          : "Simulate Tornado"}
      </span>
    </motion.button>
  );
}

function SwirlIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18" />
      <path d="M5 8h14" />
      <path d="M7 12h10" />
      <path d="M9 16h5" />
      <path d="M11 20l1.5 -2" />
    </svg>
  );
}
