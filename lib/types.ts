export type Plan = "basic" | "plus" | "premium";

export const PLANS = {
  basic: { name: "Basic", priceYear: 240, payoutLimitCents: 500_000 },
  plus: { name: "Plus", priceYear: 480, payoutLimitCents: 1_500_000 },
  premium: { name: "Premium", priceYear: 840, payoutLimitCents: 2_500_000 },
} as const satisfies Record<Plan, { name: string; priceYear: number; payoutLimitCents: number }>;

export type SessionUser = {
  email: string;
  address?: string;
  lat?: number;
  lon?: number;
  plan?: Plan;
  payoutLimitCents?: number;
  walletCents: number;
  createdAt: string;
  lastSimulation?: SimulationResult;
  lastSimulationAt?: string; // ISO datetime
  simulationCount?: number;
};

export type TornadoEvent = {
  id: string;
  date: string; // ISO YYYY-MM-DD
  ef: 0 | 1 | 2 | 3 | 4 | 5;
  beginLat: number;
  beginLon: number;
  endLat: number;
  endLon: number;
  location: string;
  state: string;
  fatalities?: number;
  damageEstimateUsd?: number;
};

export type SimulationResult = {
  event: TornadoEvent;
  distanceMiles: number;
  payoutCents: number;
  payoutFraction: 1 | 0.5 | 0.1 | 0;
  bbox: [number, number, number, number]; // [west, south, east, north] including home + path
  pathGeoJSON: GeoJSON.Feature<GeoJSON.LineString>;
  homePoint: [number, number];
  nearestPointOnPath: [number, number];
};
