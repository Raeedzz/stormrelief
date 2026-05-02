/**
 * Trigger ladder from the StormRelief pitch deck:
 *   < 0.10 mi → 100% of plan limit
 *   < 0.25 mi → 50%
 *   < 0.50 mi → 10%
 *   ≥ 0.50 mi → $0
 *
 * Only EF2+ tornadoes (120+ mph) are eligible — that filter happens at the
 * tornado-lookup layer; this function trusts the event was qualifying.
 */
export function computePayout(distanceMiles: number, payoutLimitCents: number) {
  let fraction: 1 | 0.5 | 0.1 | 0;
  if (distanceMiles < 0.1) fraction = 1;
  else if (distanceMiles < 0.25) fraction = 0.5;
  else if (distanceMiles < 0.5) fraction = 0.1;
  else fraction = 0;

  const payoutCents = Math.round(payoutLimitCents * fraction);
  return { payoutCents, fraction };
}

export function formatUsd(cents: number) {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function formatMiles(miles: number) {
  if (miles < 0.1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(2)} mi`;
}
