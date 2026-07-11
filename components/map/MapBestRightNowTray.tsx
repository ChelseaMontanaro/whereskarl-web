"use client";

import { useEffect, useState } from "react";

import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

function getPhonePortraitConditionLine(
  item: BestRightNowItem,
  isTopRanked: boolean,
): string {
  const detail = item.detail?.trim();
  if (detail && detail !== "Clear skies") {
    return detail;
  }

  const scoreLabel = item.scoreLabel?.trim();
  if (scoreLabel) {
    const suffix = scoreLabel.replace(/^\d+\s+/, "").trim();
    if (suffix) {
      return suffix.charAt(0).toUpperCase() + suffix.slice(1);
    }
  }

  return isTopRanked ? "Clearest" : "";
}

type MapBestRightNowTrayProps = {
  items: BestRightNowItem[];
  onSelectLocation: (locationId: string) => void;
  selectedLocationId?: string | null;
  isLoading?: boolean;
  title?: string;
  isPhonePortrait?: boolean;
  emptyMessage?: string;
};

export function MapBestRightNowTray({
  items,
  onSelectLocation,
  selectedLocationId = null,
  isLoading = false,
  title = "Best Right Now",
  isPhonePortrait = false,
  emptyMessage,
}: MapBestRightNowTrayProps) {
  const itemIds = items.map((item) => item.locationId).join("\0");
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    setVisibleIndex(0);
  }, [itemIds]);

  const panelClass = isPhonePortrait
    ? "rounded-2xl border border-[rgb(160_185_210/0.24)] bg-[rgb(6_15_27/0.92)] px-2.5 py-1.5 shadow-[0_10px_18px_rgb(0_0_0/0.45)]"
    : desktopGlassCardClass;

  if (isLoading) {
    return (
      <div className={`${panelClass} px-4 py-3`}>
        <p className="text-xs text-white/50">Finding best spots…</p>
      </div>
    );
  }

  if (items.length === 0) {
    if (isPhonePortrait && emptyMessage) {
      return (
        <section aria-label={title} className={`${panelClass} max-w-full`}>
          <p
            className={`font-bold uppercase text-karl-gold/90 ${
              isPhonePortrait
                ? "px-0.5 text-[0.625rem] tracking-[0.08em]"
                : "px-1 text-[0.625rem] tracking-[0.16em] text-white/45"
            }`}
          >
            {title}
          </p>
          <p className="mt-1 px-0.5 text-[0.6875rem] leading-snug text-white/55">
            {emptyMessage}
          </p>
        </section>
      );
    }

    return null;
  }

  if (isPhonePortrait) {
    const safeIndex =
      items.length > 0 ? visibleIndex % items.length : 0;
    const item = items[safeIndex];
    const isSelected =
      selectedLocationId != null &&
      item.locationId.trim().toLowerCase() ===
        selectedLocationId.trim().toLowerCase();
    const conditionLine = getPhonePortraitConditionLine(item, safeIndex === 0);

    return (
      <section aria-label={title} className={`${panelClass} w-full max-w-full`}>
        <p className="px-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-karl-gold/90">
          {title}
        </p>
        <div className="mt-1 flex items-stretch gap-1.5">
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
            className={`flex min-w-0 flex-1 flex-col gap-0 rounded-xl border px-1.5 py-1 text-left transition-colors hover:border-karl-gold/25 hover:bg-karl-gold/[0.06] motion-reduce:transition-none ${
              isSelected
                ? "border-karl-gold/28 bg-karl-gold/[0.08]"
                : "border-white/8 bg-white/[0.03]"
            }`}
          >
            <span className="truncate text-[0.6875rem] font-semibold leading-3 text-white">
              {item.locationName}
            </span>
            {item.score != null ? (
              <span className="text-sm font-semibold leading-4 text-karl-gold">
                {item.score}
              </span>
            ) : null}
            {conditionLine ? (
              <span className="truncate text-[0.5625rem] font-medium leading-[0.625rem] text-white/55">
                {conditionLine}
              </span>
            ) : null}
            {item.isDegraded ? (
              <DegradedDataLabel variant="bestRightNow" className="mt-px" />
            ) : null}
          </button>
          {items.length > 1 ? (
            <button
              type="button"
              aria-label="Show next Best Right Now location"
              onClick={(event) => {
                event.stopPropagation();
                setVisibleIndex((index) => (index + 1) % items.length);
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border border-white/10 bg-white/[0.04] text-base text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white/75 motion-reduce:transition-none"
            >
              ›
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={title}
      className={`${panelClass} max-w-full overflow-x-auto`}
    >
      <p className="px-1 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/45">
        {title}
      </p>
      <div className="mt-2 flex items-stretch gap-2">
        <ul className="flex items-stretch gap-2">
          {items.map((item) => {
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
                  className={`flex min-w-[7.5rem] flex-col rounded-xl border px-3 py-2 text-left transition-colors hover:border-karl-gold/25 hover:bg-karl-gold/[0.06] motion-reduce:transition-none ${
                    isSelected
                      ? "border-karl-gold/28 bg-karl-gold/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <span className="truncate text-sm font-semibold text-white">
                    {item.locationName}
                  </span>
                  {item.score != null ? (
                    <span className="mt-1 text-xs font-light font-semibold text-karl-gold">
                      {item.scoreLabel ?? `${item.score} clear`}
                    </span>
                  ) : null}
                  {item.isDegraded ? (
                    <DegradedDataLabel variant="bestRightNow" className="mt-1" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
