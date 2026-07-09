"use client";

import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

type MapBestRightNowTrayProps = {
  items: BestRightNowItem[];
  onSelectLocation: (locationId: string) => void;
  selectedLocationId?: string | null;
  isLoading?: boolean;
  title?: string;
  isPhonePortrait?: boolean;
};

export function MapBestRightNowTray({
  items,
  onSelectLocation,
  selectedLocationId = null,
  isLoading = false,
  title = "Best Right Now",
  isPhonePortrait = false,
}: MapBestRightNowTrayProps) {
  const panelClass = isPhonePortrait
    ? "rounded-2xl border border-[rgb(160_185_210/0.24)] bg-[rgb(6_15_27/0.92)] px-3 py-[0.6875rem] shadow-[0_10px_18px_rgb(0_0_0/0.45)]"
    : desktopGlassCardClass;

  if (isLoading) {
    return (
      <div className={`${panelClass} px-4 py-3`}>
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
      className={`${panelClass} max-w-full overflow-x-auto`}
    >
      <p
        className={`px-1 font-bold uppercase text-karl-gold/90 ${
          isPhonePortrait
            ? "text-[0.6875rem] tracking-[0.1em]"
            : "text-[0.625rem] tracking-[0.16em] text-white/45"
        }`}
      >
        {title}
      </p>
      <div className="mt-2 flex items-stretch gap-2">
        <ul className="flex items-stretch gap-2">
        {items.map((item, index) => {
          const isSelected =
            selectedLocationId != null &&
            item.locationId.trim().toLowerCase() ===
              selectedLocationId.trim().toLowerCase();

          return (
          <li key={item.locationId} className="shrink-0">
            <button
              type="button"
              data-location-id={item.locationId}
              data-selected={isSelected ? "true" : "false"}
              aria-current={isSelected ? "true" : undefined}
              aria-label={`Select ${item.locationName} on map`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectLocation(item.locationId);
              }}
              className={`flex flex-col rounded-xl border px-2 py-1.5 text-left transition-colors hover:border-karl-gold/25 hover:bg-karl-gold/[0.06] motion-reduce:transition-none ${
                isPhonePortrait ? "w-24 gap-0.5" : "min-w-[7.5rem] px-3 py-2"
              } ${
                isSelected
                  ? "border-karl-gold/28 bg-karl-gold/[0.08]"
                  : "border-white/8 bg-white/[0.03]"
              }`}
            >
              <span
                className={`truncate font-semibold text-white ${
                  isPhonePortrait ? "text-xs leading-[0.875rem]" : "text-sm"
                }`}
              >
                {item.locationName}
              </span>
              {item.score != null ? (
                <span
                  className={`font-semibold text-karl-gold ${
                    isPhonePortrait
                      ? "text-[0.9375rem] leading-[1.0625rem]"
                      : "mt-1 text-xs font-light"
                  }`}
                >
                  {isPhonePortrait
                    ? item.score
                    : (item.scoreLabel ?? `${item.score} clear`)}
                </span>
              ) : null}
              {isPhonePortrait && (index === 0 || item.scoreLabel) ? (
                <span className="truncate text-[0.625rem] font-medium leading-3 text-white/55">
                  {item.scoreLabel ?? (index === 0 ? "Clearest" : "")}
                </span>
              ) : null}
              {!isPhonePortrait && item.isDegraded ? (
                <DegradedDataLabel variant="bestRightNow" className="mt-1" />
              ) : null}
              {isPhonePortrait && item.isDegraded ? (
                <DegradedDataLabel variant="bestRightNow" className="mt-0.5" />
              ) : null}
            </button>
          </li>
          );
        })}
        </ul>
        {isPhonePortrait ? (
          <div
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/55"
          >
            ›
          </div>
        ) : null}
      </div>
    </section>
  );
}
