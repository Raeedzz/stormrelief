import * as turf from "@turf/turf";
import tornadoes from "@/data/tornadoes.json";
import type { TornadoEvent, SimulationResult } from "./types";
import { computePayout } from "./payout";

const ALL: TornadoEvent[] = tornadoes as TornadoEvent[];

const SEARCH_RADIUS_MI = 50; // for finding "nearby" qualifying events
const FALLBACK_RADIUS_MI = 250; // if nothing within 50, widen to find SOMETHING for the demo

export function eventToLineString(e: TornadoEvent): GeoJSON.Feature<GeoJSON.LineString> {
  return turf.lineString(
    [
      [e.beginLon, e.beginLat],
      [e.endLon, e.endLat],
    ],
    { id: e.id, ef: e.ef, date: e.date, location: e.location }
  );
}

/**
 * Compute the minimum distance (in miles) from a home point to a tornado path,
 * along with the nearest point on the path.
 */
export function distanceToPath(
  homeLat: number,
  homeLon: number,
  e: TornadoEvent
): { miles: number; nearestPoint: [number, number] } {
  const home = turf.point([homeLon, homeLat]);
  const line = eventToLineString(e);
  const nearest = turf.nearestPointOnLine(line, home, { units: "miles" });
  return {
    miles: nearest.properties.dist ?? 0,
    nearestPoint: nearest.geometry.coordinates as [number, number],
  };
}

/**
 * Find the closest EF2+ tornado within SEARCH_RADIUS_MI of the home.
 * Falls back to closest qualifying event within FALLBACK_RADIUS_MI if none nearby.
 * Returns null only if there are no EF2+ events even within the fallback radius —
 * exceedingly rare for any US address.
 */
export function findClosestQualifyingTornado(
  homeLat: number,
  homeLon: number
): { event: TornadoEvent; distanceMiles: number; nearestPoint: [number, number] } | null {
  let best: { event: TornadoEvent; distanceMiles: number; nearestPoint: [number, number] } | null =
    null;
  for (const e of ALL) {
    if (e.ef < 2) continue;
    const { miles, nearestPoint } = distanceToPath(homeLat, homeLon, e);
    if (miles > FALLBACK_RADIUS_MI) continue;
    if (!best || miles < best.distanceMiles) {
      best = { event: e, distanceMiles: miles, nearestPoint };
    }
  }
  return best;
}

export function buildSimulation(
  homeLat: number,
  homeLon: number,
  payoutLimitCents: number
): SimulationResult | null {
  const found = findClosestQualifyingTornado(homeLat, homeLon);
  if (!found) return null;
  const { event, distanceMiles, nearestPoint } = found;
  const { payoutCents, fraction } = computePayout(distanceMiles, payoutLimitCents);
  const path = eventToLineString(event);
  // bbox covers home + path
  const all = turf.featureCollection<GeoJSON.Geometry>([
    path,
    turf.point([homeLon, homeLat]),
  ]);
  const bb = turf.bbox(all) as [number, number, number, number];
  return {
    event,
    distanceMiles,
    payoutCents,
    payoutFraction: fraction,
    bbox: bb,
    pathGeoJSON: path,
    homePoint: [homeLon, homeLat],
    nearestPointOnPath: nearestPoint,
  };
}

export { SEARCH_RADIUS_MI, FALLBACK_RADIUS_MI, ALL as ALL_TORNADOES };
