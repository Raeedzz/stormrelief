"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import { saveAddress } from "@/app/actions/onboarding";
import type { GeocodeResult } from "@/lib/geocode";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function AddressForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [picked, setPicked] = useState<GeocodeResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // debounce
  useEffect(() => {
    if (picked && query === picked.placeName) {
      setResults([]);
      return;
    }
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults((json.results as GeocodeResult[]) ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(id);
  }, [query, picked]);

  // Map preview
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    if (!mapboxgl.accessToken) return;
    mapRef.current = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-95.7129, 37.0902],
      zoom: 3.2,
      attributionControl: false,
      projection: "mercator",
    });
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!picked || !mapRef.current) return;
    const map = mapRef.current;
    map.flyTo({ center: [picked.lon, picked.lat], zoom: 16, speed: 1.4, curve: 1.6 });
    if (markerRef.current) markerRef.current.remove();

    const el = document.createElement("div");
    el.className = "relative h-9 w-9";
    el.innerHTML = `
      <span class="absolute inset-0 rounded-full border-2 border-aurora-400/80 animate-ping"></span>
      <span class="absolute inset-1.5 rounded-full bg-aurora-400 shadow-[0_0_24px_4px_rgba(56,232,164,0.55)]"></span>
    `;
    markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([picked.lon, picked.lat]).addTo(map);
  }, [picked]);

  const showSuggestions = open && results.length > 0;
  const tokenMissing = useMemo(() => !process.env.NEXT_PUBLIC_MAPBOX_TOKEN, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <label htmlFor="address" className="sr-only">
          Home address
        </label>
        <div className="glass-strong flex items-center rounded-2xl px-4">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-white/55"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            placeholder="Enter your home address"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
              setError(null);
            }}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="flex-1 bg-transparent px-3 py-3.5 text-base outline-none placeholder:text-white/35 sm:text-lg"
          />
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-storm-900/95 shadow-2xl backdrop-blur-xl"
            >
              {results.map((r) => (
                <li key={`${r.lat}-${r.lon}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setPicked(r);
                      setQuery(r.placeName);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aurora-400" />
                    <span className="text-white/90">{r.placeName}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {tokenMissing && (
        <p className="rounded-xl border border-amber-tornado/30 bg-amber-tornado/10 px-4 py-3 text-[13px] text-amber-tornado">
          Set <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> in
          <code className="rounded bg-black/30 px-1">.env.local</code> to enable address search & maps.
        </p>
      )}

      <div className="relative h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-storm-800 shadow-2xl">
        <div ref={mapEl} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        {!picked && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-storm-950/70 via-transparent">
            <p className="text-sm text-white/55">
              Pick an address — the map will fly to it.
            </p>
          </div>
        )}
      </div>

      <form
        action={(fd) => {
          if (!picked) {
            setError("Please pick an address from the suggestions.");
            return;
          }
          fd.set("address", picked.placeName);
          fd.set("lat", String(picked.lat));
          fd.set("lon", String(picked.lon));
          startTransition(async () => {
            const r = await saveAddress(fd);
            if (r?.error) setError(r.error);
          });
        }}
      >
        {error && (
          <p className="mb-3 text-sm text-magenta-tornado">{error}</p>
        )}
        <button
          type="submit"
          disabled={!picked || pending}
          className="relative w-full rounded-2xl bg-aurora-400 px-5 py-4 text-base font-medium text-storm-950 shadow-[0_8px_28px_-8px_rgba(56,232,164,0.6)] transition-all hover:bg-aurora-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className={pending ? "opacity-0" : "opacity-100"}>
            {picked ? "This is my home" : "Pick an address"}
          </span>
          {pending && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-storm-950/30 border-t-storm-950" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
