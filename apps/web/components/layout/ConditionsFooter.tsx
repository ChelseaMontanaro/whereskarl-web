"use client";

import {
  conditionsStatusAccessibilityLabel,
  conditionsStatusLabel,
} from "@/lib/home/conditionsStatus";
import { useConditionsStatus } from "@/components/providers/ConditionsStatusProvider";

export function ConditionsFooter() {
  const { presentation } = useConditionsStatus();
  const label = conditionsStatusLabel(presentation);
  const isLoading = presentation === "loading";

  return (
    <footer
      className="border-t border-white/10 bg-karl-navy-soft/60 px-4 py-3"
      aria-label="Conditions status"
      aria-busy={isLoading}
    >
      <div className="mx-auto flex w-full max-w-[430px] items-center justify-center gap-2">
        {isLoading ? (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-karl-gold/70 motion-reduce:animate-none"
          />
        ) : null}
        <p
          className={`text-sm ${
            presentation === "live"
              ? "font-semibold text-karl-gold"
              : presentation === "cached"
                ? "text-white/55"
                : "text-white/60"
          }`}
          aria-label={conditionsStatusAccessibilityLabel(presentation)}
        >
          {label}
        </p>
      </div>
    </footer>
  );
}
