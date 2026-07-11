"use client";

import { useEffect, useState } from "react";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import type { LocationWeather } from "@/lib/schemas/weather";

/**
 * Translucent map glass: navy tint at low opacity plus backdrop blur so the map
 * texture stays visible beneath. Sizes to content — no min-height.
 */
const PHONE_PORTRAIT_PANEL_CLASS =
  "rounded-2xl border border-white/12 bg-[rgb(6_15_27/0.55)] px-2.5 py-1.5 shadow-[0_6px_18px_rgb(0_0_0/0.3)] backdrop-blur-md";

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

type MapPhonePortraitUnifiedCardProps = {
  items: BestRightNowItem[];
  selectedLocation: LocationWeather | null;
  onSelectLocation: (locationId: string) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  showBestRightNow?: boolean;
  emptyMessage?: string;
  title?: string;
};

export function MapPhonePortraitUnifiedCard({
  items,
  selectedLocation,
  onSelectLocation,
  onClearSelection,
  isLoading = false,
  showBestRightNow = true,
  emptyMessage,
  title = "Best Right Now",
}: MapPhonePortraitUnifiedCardProps) {
  const itemIds = items.map((item) => item.locationId).join("\0");
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    setVisibleIndex(0);
  }, [itemIds]);

  const handleCycle = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (items.length <= 1) {
      return;
    }

    setVisibleIndex((index) => (index + 1) % items.length);
    if (selectedLocation) {
      onClearSelection();
    }
  };

  if (isLoading) {
    return (
      <div className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full px-4 py-3`}>
        <p className="text-xs text-white/50">Finding best spots…</p>
      </div>
    );
  }

  if (selectedLocation) {
    return (
      <section
        aria-label={`Selected location: ${selectedLocation.name}`}
        className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full max-w-full`}
      >
        <div className="flex items-stretch gap-1.5">
          <MapSelectedLocationCard
            location={selectedLocation}
            onClose={onClearSelection}
            phonePortrait
            embedded
          />
          {showBestRightNow && items.length > 1 ? (
            <button
              type="button"
              aria-label="Show next Best Right Now location"
              onClick={handleCycle}
              className="flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border border-white/10 bg-white/[0.04] text-base text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white/75 motion-reduce:transition-none"
            >
              ›
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!showBestRightNow) {
    return null;
  }

  if (items.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section aria-label={title} className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full max-w-full`}>
        <p className="text-[0.5625rem] font-bold uppercase leading-none tracking-[0.08em] text-karl-gold/90">
          {title}
        </p>
        <p className="mt-1 text-[0.6875rem] leading-snug text-white/55">
          {emptyMessage}
        </p>
      </section>
    );
  }

  const safeIndex = visibleIndex % items.length;
  const item = items[safeIndex];
  const conditionLine = getPhonePortraitConditionLine(item, safeIndex === 0);

  return (
    <section aria-label={title} className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full max-w-full`}>
      <p className="text-[0.5625rem] font-bold uppercase leading-none tracking-[0.08em] text-karl-gold/90">
        {title}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          data-location-id={item.locationId}
          aria-label={`Select ${item.locationName} on map`}
          onClick={(event) => {
            event.stopPropagation();
            onSelectLocation(item.locationId);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 text-left transition-opacity hover:opacity-90 motion-reduce:transition-none"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.8125rem] font-semibold leading-tight text-white">
              {item.locationName}
            </span>
            {conditionLine ? (
              <span className="block truncate text-[0.5625rem] font-medium leading-tight text-white/55">
                {conditionLine}
              </span>
            ) : null}
            {item.isDegraded ? (
              <DegradedDataLabel variant="bestRightNow" className="mt-px" />
            ) : null}
          </span>
          {item.score != null ? (
            <span className="flex shrink-0 flex-col items-center self-stretch justify-center border-l border-white/12 pl-2 leading-none">
              <span className="text-[0.5rem] font-bold uppercase tracking-[0.06em] text-white/40">
                Clear Skies
              </span>
              <span className="mt-px text-lg font-light leading-5 text-karl-gold">
                {item.score}
              </span>
            </span>
          ) : null}
        </button>
        {items.length > 1 ? (
          <button
            type="button"
            aria-label="Show next Best Right Now location"
            onClick={handleCycle}
            className="flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border border-white/10 bg-white/[0.04] text-base text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white/75 motion-reduce:transition-none"
          >
            ›
          </button>
        ) : null}
      </div>
    </section>
  );
}
