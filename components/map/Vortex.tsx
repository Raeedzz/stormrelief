"use client";

import { forwardRef } from "react";

/**
 * Static (CSS-rotated) SVG vortex used as the tornado marker.
 * Stacked spiral arms with a soft glow.
 */
export const Vortex = forwardRef<HTMLDivElement, { ef: number }>(function Vortex(
  { ef },
  ref
) {
  // Size scales with EF rating
  const size = 72 + (ef - 2) * 16; // EF2: 72, EF5: 120
  return (
    <div
      ref={ref}
      className="vortex-root pointer-events-none"
      style={{ width: size, height: size }}
    >
      <div className="vortex-spin">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <radialGradient id="v-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0a0612" stopOpacity="1" />
              <stop offset="60%" stopColor="#3a0a16" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3a0a16" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="v-arm" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff9d2f" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          {/* Core */}
          <circle cx="50" cy="50" r="42" fill="url(#v-core)" />
          {/* Arms */}
          {[0, 60, 120, 180, 240, 300].map((rot) => (
            <path
              key={rot}
              d="M 50 50 C 60 40 78 38 92 50 C 78 56 64 56 50 50 Z"
              fill="url(#v-arm)"
              opacity="0.85"
              transform={`rotate(${rot} 50 50)`}
            />
          ))}
          {/* Inner debris ring */}
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke="#ffce8a"
            strokeWidth="1.4"
            strokeDasharray="2 4"
            opacity="0.6"
          />
        </svg>
      </div>
      <style jsx>{`
        .vortex-root {
          position: relative;
          filter: drop-shadow(0 0 18px rgba(255, 61, 139, 0.55))
            drop-shadow(0 0 32px rgba(255, 157, 47, 0.35));
        }
        .vortex-spin {
          width: 100%;
          height: 100%;
          animation: vortex-rotate 0.7s linear infinite;
        }
        @keyframes vortex-rotate {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.04);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .vortex-spin {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});
