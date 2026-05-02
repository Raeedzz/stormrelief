import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-7" />
      <span className="text-display text-[1.18rem] font-medium tracking-tight">
        StormRelief
      </span>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id="lg-spiral" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7af5c4" />
          <stop offset="55%" stopColor="#38e8a4" />
          <stop offset="100%" stopColor="#0aa66a" />
        </radialGradient>
        <linearGradient id="lg-ring" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#b9ffe1" />
          <stop offset="100%" stopColor="#14d488" />
        </linearGradient>
      </defs>
      <g transform="translate(16 16)">
        {/* Outer wind ring */}
        <circle r="13.5" fill="none" stroke="url(#lg-ring)" strokeWidth="1.2" opacity="0.7" />
        {/* Spiral */}
        <path
          d="M 0 -10 C 6 -10 11 -5 11 0 C 11 5 6 9 0 9 C -4 9 -7 6 -7 2 C -7 -1 -5 -3 -2 -3 C 0 -3 1 -1 1 0"
          fill="none"
          stroke="url(#lg-spiral)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle r="1.4" fill="#b9ffe1" />
      </g>
    </svg>
  );
}
