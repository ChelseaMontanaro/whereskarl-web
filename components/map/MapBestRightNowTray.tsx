"use client";

import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

type MapBestRightNowTrayProps = {
  items: BestRightNowItem[];
  onSelectLocation: (locationId: string) => void;
  isLoading?: boolean;
  title?: string;
};

export function MapBestRightNowTray({
  items,
  onSelectLocation,
  isLoading = false,
  title = "Best Right Now",
}: MapBestRightNowTrayProps) {
  if (isLoading) {
    return (
      <div className={`${desktopGlassCardClass} px-4 py-3`}>
        <p className="text-xs text-white/50">Finding best spots…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className={`${desktopGlassCardClass} max-w-full overflow-x-auto px-3 py-3`}
    >
      <p className="px-1 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/45">
        {title}
      </p>
      <ul className="mt-2 flex items-stretch gap-2">
        {items.map((item) => (
          <li key={item.locationId} className="shrink-0">
            <button
              type="button"
              data-location-id={item.locationId}
              aria-label={`Select ${item.locationName} on map`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectLocation(item.locationId);
              }}
              className="flex min-w-[7.5rem] flex-col rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left transition-colors hover:border-karl-gold/25 hover:bg-karl-gold/[0.06] motion-reduce:transition-none"
            >
              <span className="truncate text-sm font-semibold text-white">
                {item.locationName}
              </span>
              {item.score != null ? (
                <span className="mt-1 text-xs font-light text-karl-gold">
                  {item.score} clear
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
