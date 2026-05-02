"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSim } from "@/lib/store";
import { formatMiles, formatUsd } from "@/lib/payout";

export function OutcomeModal() {
  const { outcomeOpen, result, closeOutcome, walletCents } = useSim();
  if (!result) return null;
  const { event, distanceMiles, payoutCents, payoutFraction } = result;
  const triggered = payoutCents > 0;

  return (
    <AnimatePresence>
      {outcomeOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-storm-950/55 backdrop-blur-md"
            onClick={closeOutcome}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-screen-sm rounded-t-3xl border-t border-white/10 bg-storm-900/95 p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-[0_-24px_64px_-24px_rgba(0,0,0,0.6)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

            <div className="flex flex-col gap-1">
              <p
                className={
                  "text-[12px] uppercase tracking-[0.22em] " +
                  (triggered ? "text-aurora-300" : "text-amber-tornado")
                }
              >
                {triggered ? "Relief triggered" : "Out of trigger range"}
              </p>
              <h2 className="text-display text-[1.95rem] leading-[1.05] tracking-tight">
                {triggered ? "We sent you " : "You're safe."}
                {triggered && (
                  <span className="bg-gradient-to-r from-aurora-300 to-aurora-200 bg-clip-text text-transparent">
                    {formatUsd(payoutCents)}
                  </span>
                )}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                {triggered ? (
                  <>
                    Based on a real {efLabel(event.ef)} tornado that hit{" "}
                    <span className="text-white/85">{event.location}</span> on{" "}
                    <span className="text-white/85">{formatDate(event.date)}</span>. The
                    path passed <span className="text-white/85">{formatMiles(distanceMiles)}</span>{" "}
                    from your home — within our{" "}
                    <PayoutBand fraction={payoutFraction} /> band.
                  </>
                ) : (
                  <>
                    The closest qualifying tornado we found near your address — a{" "}
                    {efLabel(event.ef)} on {formatDate(event.date)} in{" "}
                    {event.location} — passed{" "}
                    <span className="text-white/85">{formatMiles(distanceMiles)}</span>{" "}
                    away. Under our 0.5&nbsp;mi trigger, no payout was needed.
                  </>
                )}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-[12px]">
              <Stat label="Tornado" value={efLabel(event.ef)} accent />
              <Stat label="Distance" value={formatMiles(distanceMiles)} />
              <Stat label="Wallet" value={formatUsd(walletCents)} />
            </div>

            {triggered && (
              <div className="mt-4 rounded-2xl border border-aurora-400/25 bg-aurora-400/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aurora-400/15 ring-1 ring-aurora-400/40">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-aurora-300" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m4 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-[13px] leading-relaxed text-white/75">
                    A check-in email is on its way to your inbox.{" "}
                    <span className="text-aurora-300">No claim. No paperwork.</span>{" "}
                    Just relief.
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={closeOutcome}
              className="mt-5 w-full rounded-2xl bg-white/[0.06] px-5 py-3.5 text-[14px] text-white/90 transition-colors hover:bg-white/[0.1]"
            >
              Done
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</span>
      <span
        className={
          "text-display text-[15px] tracking-tight " +
          (accent ? "text-amber-tornado" : "text-white/90")
        }
      >
        {value}
      </span>
    </div>
  );
}

function PayoutBand({ fraction }: { fraction: 1 | 0.5 | 0.1 | 0 }) {
  if (fraction === 1) return <span className="text-aurora-300">100%</span>;
  if (fraction === 0.5) return <span className="text-aurora-300">50%</span>;
  if (fraction === 0.1) return <span className="text-aurora-300">10%</span>;
  return <span className="text-amber-tornado">0%</span>;
}

function efLabel(ef: number) {
  return `EF${ef}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
