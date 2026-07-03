import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

type BestRightNowSectionProps = {
  items: BestRightNowItem[];
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
      {children}
    </p>
  );
}

export function BestRightNowSection({ items }: BestRightNowSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <GlassCard className="px-4 py-4">
      <CardLabel>Best Right Now</CardLabel>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.locationId} className="border-t border-white/8 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-white">
                  {item.locationName}
                </p>
                <p className="mt-1 text-sm text-white/65">{item.detail}</p>
              </div>
              {item.score != null ? (
                <span className="rounded-full border border-karl-gold/25 px-2 py-1 text-xs font-semibold text-karl-gold">
                  {item.score}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
