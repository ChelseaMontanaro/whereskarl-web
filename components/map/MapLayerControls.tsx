"use client";

import { useState } from "react";

import {
  KARL_MAP_STYLE_OPTIONS,
  type KarlMapStyleId,
} from "@/lib/map/styles";

type MapLayerControlsProps = {
  mapStyle: KarlMapStyleId;
  fogLayerEnabled: boolean;
  onMapStyleChange: (styleId: KarlMapStyleId) => void;
  onFogLayerChange: (enabled: boolean) => void;
};

export function MapLayerControls({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
}: MapLayerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="map-layer-panel"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-full border border-white/12 bg-karl-navy/88 px-3 py-2 text-xs font-semibold text-white/80 shadow-lg backdrop-blur-sm transition-colors hover:border-karl-gold/25 hover:text-karl-gold motion-reduce:transition-none"
      >
        Map Layers
      </button>

      {isOpen ? (
        <div
          id="map-layer-panel"
          className="mt-2 w-[min(100%,17rem)] rounded-2xl border border-white/10 bg-karl-navy/92 p-3 shadow-xl backdrop-blur-md"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Map Layers</p>
            <p className="text-xs text-white/55">Customize the Karl map</p>
          </div>

          <div className="mt-4 space-y-4">
            <section aria-label="Map style">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
                Map Style
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {KARL_MAP_STYLE_OPTIONS.map((option) => {
                  const isSelected = mapStyle === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onMapStyleChange(option.id)}
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors motion-reduce:transition-none ${
                        isSelected
                          ? "border-karl-gold/35 bg-karl-gold/12 text-karl-gold"
                          : "border-white/10 bg-karl-navy-glass/70 text-white/70 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-label="Overlays">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
                Overlays
              </p>
              <label className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-karl-navy-glass/70 px-3 py-2.5">
                <span className="text-sm text-white/80">Fog Layer</span>
                <input
                  type="checkbox"
                  checked={fogLayerEnabled}
                  onChange={(event) => onFogLayerChange(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-karl-navy text-karl-gold focus:ring-karl-gold/40"
                />
              </label>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
