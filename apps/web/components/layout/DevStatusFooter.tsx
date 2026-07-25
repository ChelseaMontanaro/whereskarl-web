"use client";

import { HealthStatus } from "@/components/HealthStatus";

export function DevStatusFooter() {
  return (
    <section
      aria-label="Developer status"
      className="border-t border-white/5 bg-karl-navy/80 px-4 py-3"
    >
      <details className="mx-auto w-full max-w-[430px] group">
        <summary className="cursor-pointer list-none text-xs text-white/45 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-white/20 underline-offset-2 group-open:text-white/60">
            Developer status
          </span>
        </summary>
        <div className="mt-3">
          <HealthStatus compact />
        </div>
      </details>
    </section>
  );
}
