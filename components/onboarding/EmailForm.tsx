"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { startOnboarding } from "@/app/actions/onboarding";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const result = await startOnboarding(fd);
          if (result?.error) setError(result.error);
        });
      }}
      className="w-full max-w-md"
    >
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <div className="glass-strong group relative flex items-center rounded-2xl px-1.5 py-1.5">
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@home.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-white/35 sm:text-lg"
        />
        <button
          type="submit"
          disabled={pending}
          className="relative inline-flex items-center justify-center rounded-xl bg-aurora-400 px-5 py-3 text-sm font-medium text-storm-950 shadow-[0_8px_24px_-8px_rgba(56,232,164,0.6)] transition-all hover:bg-aurora-300 active:scale-[0.97] disabled:opacity-50"
        >
          <span className={pending ? "opacity-0" : "opacity-100"}>Continue</span>
          {pending && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-storm-950/30 border-t-storm-950" />
            </span>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-magenta-tornado">{error}</p>
      ) : (
        <p className="mt-3 text-sm text-white/45">
          No password. We email you instantly when relief is triggered.
        </p>
      )}
    </motion.form>
  );
}
