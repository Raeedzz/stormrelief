"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function MapCanvas({
  homeLat,
  homeLon,
  onReady,
}: {
  homeLat: number;
  homeLon: number;
  onReady: (map: mapboxgl.Map) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!mapboxgl.accessToken) return;
    let alive = true;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [homeLon, homeLat],
      zoom: 15.5,
      pitch: 45,
      bearing: -10,
      attributionControl: false,
      dragRotate: true,
      antialias: true,
      projection: "mercator",
    });
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      // Live NEXRAD radar overlay (Iowa State Mesonet — public mirror of NOAA NEXRAD)
      if (!map.getSource("nexrad")) {
        map.addSource("nexrad", {
          type: "raster",
          tiles: [
            "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0r-900913/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          scheme: "tms",
          attribution: "© NOAA / Iowa State Mesonet",
        });
        map.addLayer(
          {
            id: "nexrad-layer",
            type: "raster",
            source: "nexrad",
            paint: {
              "raster-opacity": 0.45,
              "raster-fade-duration": 250,
              "raster-saturation": -0.1,
            },
          },
          // place under labels
          undefined
        );
      }

      // 3D buildings extrusion for depth
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (l) => l.type === "symbol" && (l.layout as { "text-field"?: unknown })?.["text-field"]
      )?.id;
      if (!map.getLayer("3d-buildings")) {
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                "#1a2444",
                17,
                "#283354",
              ],
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                0,
                15,
                ["get", "height"],
              ],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.85,
            },
          },
          labelLayerId
        );
      }
      // Glow ring around home + sonar pulse
      if (!map.getSource("home-ring")) {
        map.addSource("home-ring", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "Point", coordinates: [homeLon, homeLat] },
            properties: {},
          },
        });
        map.addLayer({
          id: "home-ring-pulse",
          type: "circle",
          source: "home-ring",
          paint: {
            "circle-radius": 8,
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-color": "#7af5c4",
            "circle-stroke-width": 2,
            "circle-stroke-opacity": 0.9,
          },
        });
        map.addLayer({
          id: "home-ring-blur",
          type: "circle",
          source: "home-ring",
          paint: {
            "circle-radius": 30,
            "circle-color": "#38e8a4",
            "circle-blur": 1.4,
            "circle-opacity": 0.55,
          },
        });
        map.addLayer({
          id: "home-ring-core",
          type: "circle",
          source: "home-ring",
          paint: {
            "circle-radius": 6,
            "circle-color": "#b9ffe1",
            "circle-stroke-color": "#38e8a4",
            "circle-stroke-width": 2,
          },
        });

        // Sonar pulse animation: vary the pulse layer's radius + opacity.
        // The `alive` flag prevents the loop from touching a removed map
        // (e.g. during HMR or React StrictMode double-mount in dev).
        const startedAt = performance.now();
        const animate = (now: number) => {
          if (!alive) return;
          let stillThere: unknown;
          try {
            stillThere = map.getLayer("home-ring-pulse");
          } catch {
            return; // map.style is gone — bail.
          }
          if (!stillThere) return;
          const period = 2400;
          const t = ((now - startedAt) % period) / period;
          const radius = 8 + t * 30;
          const opacity = (1 - t) * 0.85;
          try {
            map.setPaintProperty("home-ring-pulse", "circle-radius", radius);
            map.setPaintProperty("home-ring-pulse", "circle-stroke-opacity", opacity);
          } catch {
            return;
          }
          requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }

      // Home building footprint outline (best-effort)
      try {
        const features = map.queryRenderedFeatures(map.project([homeLon, homeLat]), {
          layers: ["3d-buildings"],
        });
        const footprint = features[0];
        if (footprint && !map.getSource("home-footprint")) {
          map.addSource("home-footprint", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: footprint.geometry as GeoJSON.Geometry,
              properties: {},
            },
          });
          map.addLayer({
            id: "home-footprint-glow",
            type: "line",
            source: "home-footprint",
            paint: {
              "line-color": "#38e8a4",
              "line-width": 4,
              "line-blur": 4,
              "line-opacity": 0.9,
            },
          });
          map.addLayer({
            id: "home-footprint-line",
            type: "line",
            source: "home-footprint",
            paint: {
              "line-color": "#b9ffe1",
              "line-width": 1.4,
              "line-opacity": 1,
            },
          });
        }
      } catch {
        /* building lookup is best-effort */
      }

      onReady(map);
    });

    mapRef.current = map;
    return () => {
      alive = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
