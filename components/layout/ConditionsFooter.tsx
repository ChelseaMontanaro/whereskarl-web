"use client";

import {
  conditionsStatusAccessibilityLabel,
  conditionsStatusLabel,
} from "@/lib/home/conditionsStatus";
import { useConditionsStatus } from "@/components/providers/ConditionsStatusProvider";

export function ConditionsFooter() {
  const { presentation } = useConditionsStatus();
  const label = conditionsStatusLabel(presentation);

  return (
    <footer
      className="border-t border-white/10 bg-karl-navy-soft/60 px-4 py-3"
      aria-label="Conditions status"
    >
      <div className="mx-auto flex w-full max-w-[430px] items-center justify-center">
        <p
          className={`text-sm ${
            presentation === "live"
              ? "font-semibold text-karl-gold"
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
