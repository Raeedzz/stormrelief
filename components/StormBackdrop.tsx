"use client";

import { useEffect, useRef } from "react";

/**
 * Animated gradient + parallax storm clouds backdrop.
 * Pure CSS + a tiny canvas for moving wisps. Deliberately subtle — sets
 * mood without competing with foreground type.
 */
export function StormBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    type Wisp = { x: number; y: number; r: number; vx: number; alpha: number; hue: number };
    const wisps: Wisp[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 80 + Math.random() * 220,
      vx: 0.05 + Math.random() * 0.18,
      alpha: 0.04 + Math.random() * 0.07,
      hue: 200 + Math.random() * 40,
    }));

    let prefersReduced = false;
    try {
      prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const wisp of wisps) {
        const grad = ctx.createRadialGradient(wisp.x, wisp.y, 0, wisp.x, wisp.y, wisp.r);
        grad.addColorStop(0, `hsla(${wisp.hue}, 80%, 60%, ${wisp.alpha})`);
        grad.addColorStop(1, `hsla(${wisp.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(wisp.x, wisp.y, wisp.r, 0, Math.PI * 2);
        ctx.fill();
        if (!prefersReduced) {
          wisp.x += wisp.vx;
          if (wisp.x - wisp.r > w) wisp.x = -wisp.r;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,232,164,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(255,61,139,0.08),transparent_60%),linear-gradient(180deg,#050814_0%,#080d20_60%,#040711_100%)]" />
      {/* Slow wisps */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
      {/* Grain */}
      <div className="grain absolute inset-0" />
    </div>
  );
}
