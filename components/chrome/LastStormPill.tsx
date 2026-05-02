"use client";

import { motion } from "framer-motion";
import type { SimulationResult } from "@/lib/types";

export function LastStormPill({
  sim,
  at,
  onReplay,
  disabled,
}: {
  sim: SimulationResult;
  at: string;
  onReplay: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onReplay}
      disabled={disabled}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group glass-strong inline-flex items-center gap-2.5 rounded-full px-3 py-2 text-[12px] text-white/80 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-all hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-tornado/15 ring-1 ring-amber-tornado/40">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-amber-tornado" fill="currentColor">
          <circle cx="6" cy="6" r="6" />
        </svg>
      </span>
      <span className="font-medium tracking-tight">
        Last: EF{sim.event.ef} {shortLocation(sim.event.location)}
      </span>
      <span className="text-white/45">·</span>
      <span className="tabular-nums text-white/55">{relTime(at)}</span>
      <span className="text-white/30">·</span>
      <span className="inline-flex items-center gap-1 text-aurora-300 transition-transform group-hover:translate-x-0.5">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 8a5 5 0 1 0 1.4-3.5L3 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 3v3h3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Replay
      </span>
    </motion.button>
  );
}

function shortLocation(loc: string) {
  // "Joplin, MO" → "Joplin"; "Mayfield, KY (Quad-State)" → "Mayfield"
  return loc.split(",")[0].split("(")[0].trim();
}

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
