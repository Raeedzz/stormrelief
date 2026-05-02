import { env } from "./env";

export type GeocodeResult = {
  placeName: string;
  lat: number;
  lon: number;
};

/**
 * Forward geocode an address via Mapbox. Limited to addresses to keep
 * results tight to homes/streets. Country: US (the deck is US-only).
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  if (!env.MAPBOX_TOKEN_PUBLIC) {
    throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN missing");
  }
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set("access_token", env.MAPBOX_TOKEN_PUBLIC);
  url.searchParams.set("country", "US");
  url.searchParams.set("types", "address,poi");
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "5");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mapbox geocode failed: ${res.status}`);
  const json = (await res.json()) as {
    features?: Array<{
      place_name: string;
      center: [number, number];
    }>;
  };
  return (json.features ?? []).map((f) => ({
    placeName: f.place_name,
    lat: f.center[1],
    lon: f.center[0],
  }));
}
