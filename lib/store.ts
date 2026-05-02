"use client";

import { create } from "zustand";
import type { SimulationResult } from "./types";

export type SimState = "idle" | "fetching" | "playing" | "settled";

type Store = {
  state: SimState;
  result: SimulationResult | null;
  walletCents: number;
  pendingCredit: number;
  outcomeOpen: boolean;
  setState: (s: SimState) => void;
  startFetching: () => void;
  setResult: (r: SimulationResult) => void;
  startPlaying: () => void;
  applyCredit: () => void;
  openOutcome: () => void;
  closeOutcome: () => void;
  reset: () => void;
  setWalletCents: (n: number) => void;
};

export const useSim = create<Store>((set, get) => ({
  state: "idle",
  result: null,
  walletCents: 0,
  pendingCredit: 0,
  outcomeOpen: false,
  setState: (s) => set({ state: s }),
  startFetching: () => set({ state: "fetching", result: null, outcomeOpen: false }),
  setResult: (r) => set({ result: r, pendingCredit: r.payoutCents }),
  startPlaying: () => set({ state: "playing" }),
  applyCredit: () => {
    const { walletCents, pendingCredit } = get();
    set({ walletCents: walletCents + pendingCredit, pendingCredit: 0 });
  },
  openOutcome: () => set({ outcomeOpen: true, state: "settled" }),
  closeOutcome: () => set({ outcomeOpen: false }),
  reset: () => set({ state: "idle", result: null, pendingCredit: 0, outcomeOpen: false }),
  setWalletCents: (n) => set({ walletCents: n }),
}));
