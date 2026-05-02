"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import { MapCanvas } from "./MapCanvas";
import { Vortex } from "./Vortex";
import { OutcomeModal } from "./OutcomeModal";
import { WalletPill } from "@/components/chrome/WalletPill";
import { ProfileButton } from "@/components/chrome/ProfileButton";
import { SimulateButton } from "@/components/chrome/SimulateButton";
import { LastStormPill } from "@/components/chrome/LastStormPill";
import { useSim } from "@/lib/store";
import type { SessionUser, SimulationResult } from "@/lib/types";

export function MapShell({ user }: { user: SessionUser }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const vortexNodeRef = useRef<HTMLDivElement | null>(null);
  const vortexMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const impactMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const sim = useSim();
  const tokenMissing = !process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const [lastSim, setLastSim] = useState<SimulationResult | null>(user.lastSimulation ?? null);
  const [lastSimAt, setLastSimAt] = useState<string | null>(user.lastSimulationAt ?? null);

  // Hydrate wallet from session
  useEffect(() => {
    sim.setWalletCents(user.walletCents ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMapReady = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  // Helpers to manage path source/layer
  const ensurePathLayer = (map: mapboxgl.Map, geo: GeoJSON.Feature<GeoJSON.LineString>) => {
    if (map.getSource("tornado-path")) {
      (map.getSource("tornado-path") as mapboxgl.GeoJSONSource).setData(geo);
    } else {
      map.addSource("tornado-path", { type: "geojson", data: geo, lineMetrics: true });
      map.addLayer({
        id: "tornado-path-glow",
        type: "line",
        source: "tornado-path",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ff3d8b",
          "line-width": 14,
          "line-blur": 14,
          "line-opacity": 0.55,
          "line-trim-offset": [1, 1],
        } as mapboxgl.LinePaint,
      });
      map.addLayer({
        id: "tornado-path-core",
        type: "line",
        source: "tornado-path",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 4,
          "line-opacity": 0.95,
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "#ffce8a",
            0.4,
            "#ff9d2f",
            1,
            "#ff3d8b",
          ],
          "line-trim-offset": [1, 1],
        } as mapboxgl.LinePaint,
      });
    }
  };

  const setPathProgress = (map: mapboxgl.Map, p: number) => {
    const v: [number, number] = [Math.max(0, Math.min(1, p)), 1];
    if (map.getLayer("tornado-path-core")) {
      map.setPaintProperty("tornado-path-core", "line-trim-offset", v);
    }
    if (map.getLayer("tornado-path-glow")) {
      map.setPaintProperty("tornado-path-glow", "line-trim-offset", v);
    }
  };

  const removePathLayer = (map: mapboxgl.Map) => {
    if (map.getLayer("tornado-path-core")) map.removeLayer("tornado-path-core");
    if (map.getLayer("tornado-path-glow")) map.removeLayer("tornado-path-glow");
    if (map.getSource("tornado-path")) map.removeSource("tornado-path");
  };

  const buildImpactMarkerEl = (ef: number, distanceMiles: number) => {
    const el = document.createElement("div");
    el.className = "impact-marker";
    const distLabel =
      distanceMiles < 0.1
        ? `${(distanceMiles * 5280).toFixed(0)} ft`
        : `${distanceMiles.toFixed(2)} mi`;
    el.innerHTML = `
      <span class="impact-pulse"></span>
      <span class="impact-dot"></span>
      <span class="impact-chip">EF${ef} · ${distLabel}</span>
    `;
    return el;
  };

  const recenterHome = useCallback(() => {
    const map = mapRef.current;
    if (!map || !user.lat || !user.lon) return;
    map.flyTo({
      center: [user.lon, user.lat],
      zoom: 15.5,
      pitch: 45,
      duration: 1000,
      curve: 1.4,
    });
  }, [user.lat, user.lon]);

  const runAnimation = useCallback(
    async (result: SimulationResult, opts: { commit: boolean }) => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      sim.setResult(result);
      sim.startPlaying();

    // Clear any prior path + impact marker
    removePathLayer(map);
    impactMarkerRef.current?.remove();
    impactMarkerRef.current = null;

    // 1) Camera fly to the PATH (not including home — user wants the focus
    //    on the storm itself; we won't pan back to the person).
    const pathBbox = turf.bbox(result.pathGeoJSON) as [number, number, number, number];
    const [w, s, e2, n] = pathBbox;
    map.fitBounds(
      [
        [w, s],
        [e2, n],
      ] as mapboxgl.LngLatBoundsLike,
      {
        padding: { top: 80, right: 60, bottom: 220, left: 60 },
        duration: 900,
        pitch: 35,
        maxZoom: 14,
      }
    );

    await sleep(950);
    if (!mapRef.current) return;

    // 2) Add path layer (initially hidden)
    ensurePathLayer(map, result.pathGeoJSON);
    setPathProgress(map, 0);

    // Place vortex marker at start
    if (vortexNodeRef.current) {
      vortexMarkerRef.current?.remove();
      const marker = new mapboxgl.Marker({ element: vortexNodeRef.current, anchor: "center" })
        .setLngLat(result.pathGeoJSON.geometry.coordinates[0] as [number, number])
        .addTo(map);
      vortexMarkerRef.current = marker;
    }

    // 3) Animate path + vortex
    const pathLine = result.pathGeoJSON;
    const totalLengthMi = turf.length(pathLine, { units: "miles" });
    const nearestPoint = turf.point(result.nearestPointOnPath);
    const sliceToNearest = turf.lineSlice(
      turf.point(pathLine.geometry.coordinates[0] as [number, number]),
      nearestPoint,
      pathLine
    );
    const distToNearestMi = turf.length(sliceToNearest, { units: "miles" });
    const nearestProgress = Math.max(0.05, Math.min(0.95, distToNearestMi / Math.max(totalLengthMi, 0.0001)));

    const duration = 1700;
    const startedAt = performance.now();
    let impactFired = false;

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - startedAt) / duration);
        // easeInOutCubic
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        setPathProgress(map, eased);

        // Move vortex
        const along = turf.along(pathLine, eased * totalLengthMi, { units: "miles" });
        vortexMarkerRef.current?.setLngLat(along.geometry.coordinates as [number, number]);

        // Trigger impact at nearestProgress
        if (!impactFired && eased >= nearestProgress) {
          impactFired = true;
          fireImpact();
        }

        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

      function fireImpact() {
        // Quiet impact — no flash, no shake, no haptic. Just credit the wallet
        // (silently, the WalletPill itself animates) and drop a static impact
        // marker. The user wanted "freeze on the path" with no bang.
        if (opts.commit) sim.applyCredit();

        impactMarkerRef.current?.remove();
        const el = buildImpactMarkerEl(result.event.ef, result.distanceMiles);
        const m = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat(result.nearestPointOnPath)
          .addTo(map);
        impactMarkerRef.current = m;
      }

      // 4) Camera stays put — the path is fully drawn, the impact marker is
      //    in place. No bang, no return to home. The user sees the storm.

      // 5) Commit payout (only fresh simulations)
      if (opts.commit) {
        const ts = new Date().toISOString();
        setLastSim(result);
        setLastSimAt(ts);
        fetch("/api/payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        }).catch(() => {});
      }

      // Brief beat after impact for the flash/shake to settle, then modal.
      await sleep(550);

      // 6) Outcome modal
      sim.openOutcome();

      // Cleanup vortex marker after a moment (path stays as a memory)
      setTimeout(() => {
        vortexMarkerRef.current?.remove();
        vortexMarkerRef.current = null;
      }, 600);
    },
    [sim, user.lat, user.lon]
  );

  const triggerSimulate = useCallback(async () => {
    if (!mapRef.current || sim.state !== "idle") return;
    try {
      navigator.vibrate?.(20);
    } catch {}
    sim.startFetching();
    let result: SimulationResult;
    try {
      const res = await fetch("/api/simulate", { method: "POST" });
      if (!res.ok) throw new Error("Simulation failed");
      result = (await res.json()) as SimulationResult;
    } catch (e) {
      console.error(e);
      sim.reset();
      return;
    }
    await runAnimation(result, { commit: true });
  }, [sim, runAnimation]);

  const triggerReplay = useCallback(async () => {
    if (!mapRef.current || sim.state !== "idle") return;
    if (!lastSim) return;
    try {
      navigator.vibrate?.(20);
    } catch {}
    await runAnimation(lastSim, { commit: false });
  }, [sim.state, lastSim, runAnimation]);

  // When outcome modal closes: just reset the state machine to idle so the
  // user can simulate or replay again. The path + impact marker stay visible
  // until the next animation (or until they reset from the profile menu).
  useEffect(() => {
    if (sim.state === "settled" && !sim.outcomeOpen) {
      sim.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.state, sim.outcomeOpen]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-storm-950">
      {/* Map */}
      <div className="absolute inset-0">
        {!tokenMissing && (
          <MapCanvas homeLat={user.lat!} homeLon={user.lon!} onReady={onMapReady} />
        )}
        {tokenMissing && <TokenMissingState />}
      </div>

      {/* Vortex DOM node (portaled into Mapbox marker on demand) */}
      <div className="hidden">
        <Vortex ref={vortexNodeRef} ef={sim.result?.event.ef ?? 3} />
      </div>

      {/* Recenter-on-home button — appears once a storm has been visualized */}
      {lastSim && (
        <button
          type="button"
          onClick={recenterHome}
          className="glass-strong absolute right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full text-white/85 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)] transition-transform active:scale-95 pad-safe-bottom"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0) + 200px)" }}
          aria-label="Recenter on home"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
          </svg>
          <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-aurora-400 ring-2 ring-storm-950" />
        </button>
      )}

      {/* Top chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 pad-safe-top">
        <div className="pointer-events-auto">
          <WalletPill />
        </div>
        <div className="pointer-events-auto relative">
          <ProfileButton
            email={user.email}
            address={user.address}
            plan={user.plan}
            walletCents={sim.walletCents}
            simulationCount={user.simulationCount ?? 0}
          />
        </div>
      </div>

      {/* Bottom chrome — Simulate FAB */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-6 pad-safe-bottom">
        <Tagline />
        <div className="pointer-events-auto mt-3">
          <SimulateButton onTrigger={triggerSimulate} />
        </div>
        {lastSim && lastSimAt ? (
          <div className="pointer-events-auto mt-3">
            <LastStormPill
              sim={lastSim}
              at={lastSimAt}
              onReplay={triggerReplay}
              disabled={sim.state !== "idle"}
            />
          </div>
        ) : (
          <p className="mt-3 max-w-[280px] text-center text-[11px] leading-relaxed text-white/45">
            Replays a real EF2+ tornado that historically passed nearest your home.
          </p>
        )}
      </div>

      {/* Loading scrim */}
      <AnimatePresence>
        {sim.state === "fetching" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 bg-storm-950/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Outcome modal */}
      <OutcomeModal />
    </div>
  );
}

function Tagline() {
  return (
    <div className="pointer-events-none flex items-center gap-2 rounded-full border border-white/10 bg-storm-950/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55 backdrop-blur-md">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora-400" />
      Live · NOAA storm history
    </div>
  );
}

function TokenMissingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-storm-900 to-storm-950 px-6">
      <div className="glass-strong max-w-md rounded-2xl p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-tornado">
          Mapbox token missing
        </p>
        <h3 className="mt-2 text-display text-[1.4rem] tracking-tight">Set your map token</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Add{" "}
          <code className="rounded bg-black/30 px-1 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
          to <code className="rounded bg-black/30 px-1 py-0.5">.env.local</code> and refresh.
          Tokens at{" "}
          <span className="text-aurora-300">account.mapbox.com</span> &rarr; tokens.
        </p>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
