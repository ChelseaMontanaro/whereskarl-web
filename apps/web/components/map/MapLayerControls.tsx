"use client";

import { useEffect, useState } from "react";

import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  MapChromeCloseButton,
  MapChromeScrim,
} from "@/components/map/MapChromePrimitives";
import {
  DESKTOP_MAP_LAYERS_CLASS,
  PHONE_MAP_CONTROL_BUTTON_CLASS,
  PHONE_MAP_LAYERS_SHEET_CLASS,
  TABLET_MAP_LAYERS_CLASS,
} from "@/lib/map/mapChrome";
import { useEscapeToDismiss } from "@/lib/hooks/useEscapeToDismiss";
import {
  KARL_MAP_STYLE_OPTIONS,
  type KarlMapStyleId,
} from "@/lib/map/styles";

type MapLayerControlsProps = {
  mapStyle: KarlMapStyleId;
  fogLayerEnabled: boolean;
  onMapStyleChange: (styleId: KarlMapStyleId) => void;
  onFogLayerChange: (enabled: boolean) => void;
  layout?: "mobile" | "desktop" | "immersive";
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onImmersivePanelOpenChange?: (isOpen: boolean) => void;
};

function ZoomButton({
  label,
  onClick,
  compact = false,
}: {
  label: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl font-light text-white/80 transition-colors hover:bg-white/[0.06] hover:text-karl-gold motion-reduce:transition-none ${
        compact ? "h-8 w-8 text-base" : "h-9 w-9 text-lg"
      }`}
    >
      {label === "Zoom in" ? "+" : "−"}
    </button>
  );
}

function LayersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Recognizable stacked-layers glyph (offset diamond layers, Material "layers"
 * shape). Used by the phone-portrait Map Layers trigger in place of the
 * hamburger `LayersIcon`; desktop/tablet keep `LayersIcon` unchanged.
 */
function StackedLayersIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
    </svg>
  );
}

function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
        checked ? "border-karl-gold" : "border-white/30"
      }`}
    >
      {checked ? (
        <span className="h-1.5 w-1.5 rounded-full bg-karl-gold" />
      ) : null}
    </span>
  );
}

function FogLayerToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-karl-navy-glass/70 px-3 py-2.5">
      <span id="fog-layer-label" className="text-sm text-white/80">
        Fog Layer
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby="fog-layer-label"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50 ${
          enabled
            ? "border-karl-gold/35 bg-karl-gold/30"
            : "border-white/15 bg-white/10"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function LayerPanelContent({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  vertical = false,
}: Pick<
  MapLayerControlsProps,
  "mapStyle" | "fogLayerEnabled" | "onMapStyleChange" | "onFogLayerChange"
> & { vertical?: boolean }) {
  return (
    <div className={vertical ? "space-y-3" : "mt-4 space-y-4"}>
      <section aria-label="Map style">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Map Style
        </p>
        {vertical ? (
          <div
            role="radiogroup"
            aria-label="Map style"
            className="mt-2 space-y-1.5"
          >
            {KARL_MAP_STYLE_OPTIONS.map((option) => {
              const isSelected = mapStyle === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onMapStyleChange(option.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none ${
                    isSelected
                      ? "border-karl-gold/35 bg-karl-gold/10 text-karl-gold"
                      : "border-white/10 bg-karl-navy-glass/70 text-white/75 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <RadioIndicator checked={isSelected} />
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
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
        )}
      </section>

      <section aria-label="Overlays">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Overlays
        </p>
        <FogLayerToggle
          enabled={fogLayerEnabled}
          onChange={onFogLayerChange}
        />
      </section>
    </div>
  );
}

/**
 * Shared collapsible Layers + zoom chrome for desktop and tablet immersive.
 * Placement tokens differ by form factor; panel contents stay identical.
 * Phone uses `MapPhonePortraitLayersControl` (sheet UX is intentional).
 */
function CollapsibleMapLayerChrome({
  placement,
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  onZoomIn,
  onZoomOut,
  onImmersivePanelOpenChange,
}: Omit<MapLayerControlsProps, "layout"> & {
  placement: "desktop" | "immersive";
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isImmersive = placement === "immersive";
  const panelId =
    placement === "desktop"
      ? "map-layer-panel-desktop"
      : "map-layer-panel-immersive";

  useEffect(() => {
    if (!isImmersive) {
      return;
    }
    onImmersivePanelOpenChange?.(!isCollapsed);
  }, [isCollapsed, isImmersive, onImmersivePanelOpenChange]);

  return (
    <div
      className={
        placement === "desktop"
          ? DESKTOP_MAP_LAYERS_CLASS
          : TABLET_MAP_LAYERS_CLASS
      }
    >
      <div
        className={`${desktopGlassCardClass} flex flex-col items-center ${
          isImmersive ? "p-0.5 sm:p-1" : "p-1"
        }`}
        aria-label="Map zoom controls"
      >
        <ZoomButton label="Zoom in" onClick={onZoomIn} />
        <div
          className={`my-0.5 h-px bg-white/10 ${
            isImmersive ? "w-5 sm:w-6" : "w-6"
          }`}
          aria-hidden="true"
        />
        <ZoomButton label="Zoom out" onClick={onZoomOut} />
      </div>

      {isCollapsed ? (
        <button
          type="button"
          aria-expanded={false}
          aria-controls={panelId}
          aria-label={isImmersive ? "Open map layers" : undefined}
          onClick={() => setIsCollapsed(false)}
          className={`${desktopGlassCardClass} flex items-center gap-2 text-xs font-semibold text-white/80 transition-colors hover:text-karl-gold motion-reduce:transition-none ${
            isImmersive ? "px-2.5 py-2 sm:px-3" : "px-3 py-2"
          }`}
        >
          <LayersIcon className={isImmersive ? "h-4 w-4" : undefined} />
          {isImmersive ? <span>Layers</span> : "Layers"}
        </button>
      ) : (
        <div
          id={panelId}
          className={`${desktopGlassCardClass} w-full p-3 shadow-xl`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Map Layers</p>
              <p className="text-xs text-white/55">Customize the Karl map</p>
            </div>
            <MapChromeCloseButton
              label="Collapse layers panel"
              onClick={() => setIsCollapsed(true)}
              size="compact"
            />
          </div>
          <LayerPanelContent
            mapStyle={mapStyle}
            fogLayerEnabled={fogLayerEnabled}
            onMapStyleChange={onMapStyleChange}
            onFogLayerChange={onFogLayerChange}
            vertical
          />
        </div>
      )}
    </div>
  );
}

type MapPhonePortraitLayersControlProps = Pick<
  MapLayerControlsProps,
  "mapStyle" | "fogLayerEnabled" | "onMapStyleChange" | "onFogLayerChange"
> & {
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * Touch-tuned phone-portrait Map Layers sheet body. Consumes the canonical
 * `KARL_MAP_STYLE_OPTIONS` array and shared `FogLayerToggle` so no map-style
 * options or Fog Layer control logic are duplicated — only the presentation is
 * phone-specific (larger tiles with radio semantics for touch).
 */
function PhoneLayersSheetBody({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
}: Pick<
  MapLayerControlsProps,
  "mapStyle" | "fogLayerEnabled" | "onMapStyleChange" | "onFogLayerChange"
>) {
  return (
    <div className="mt-4 space-y-5">
      <section aria-label="Map style">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Map type
        </p>
        <div
          role="radiogroup"
          aria-label="Map style"
          className="mt-3 grid grid-cols-3 gap-2.5"
        >
          {KARL_MAP_STYLE_OPTIONS.map((option) => {
            const isSelected = mapStyle === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onMapStyleChange(option.id)}
                className={`group flex flex-col items-stretch gap-2 rounded-2xl border p-2 text-center transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50 ${
                  isSelected
                    ? "border-karl-gold/60 bg-karl-gold/10"
                    : "border-white/10 bg-white/[0.04] hover:border-white/25"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`relative h-16 w-full overflow-hidden rounded-xl border ${
                    isSelected ? "border-karl-gold/40" : "border-white/10"
                  }`}
                >
                  <img
                    src={option.previewImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {isSelected ? (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-karl-gold text-[0.625rem] font-bold text-karl-navy">
                      ✓
                    </span>
                  ) : null}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? "text-karl-gold" : "text-white/80"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Overlays">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Details
        </p>
        <FogLayerToggle enabled={fogLayerEnabled} onChange={onFogLayerChange} />
      </section>
    </div>
  );
}

/**
 * Canonical phone-portrait Map Layers control. Renders a compact circular glass
 * trigger (stacked-layers icon) that MapView positions at the top-right below
 * the region chips — a global map control, deliberately separate from the Fog
 * Intensity rail. Tapping it opens a Google-Maps-style bottom sheet (fixed
 * scrim + sheet anchored above the bottom navigation) that reuses the canonical
 * map-style options and Fog Layer state. The trigger stays mounted while the
 * sheet is open so open/close state stays reachable.
 */
export function MapPhonePortraitLayersControl({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  onOpenChange,
}: MapPhonePortraitLayersControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEscapeToDismiss(isOpen, () => setIsOpen(false));

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="map-layer-sheet-phone"
        aria-label="Open map layers"
        onClick={() => setIsOpen((open) => !open)}
        className={`${PHONE_MAP_CONTROL_BUTTON_CLASS} ${
          isOpen ? "border-karl-gold/50 text-karl-gold" : "text-white/85"
        }`}
      >
        <StackedLayersIcon className="h-5 w-5" />
      </button>

      {isOpen ? (
        <>
          <MapChromeScrim
            label="Dismiss map layers"
            onDismiss={() => setIsOpen(false)}
          />

          <div
            id="map-layer-sheet-phone"
            role="dialog"
            aria-modal="true"
            aria-label="Map Layers"
            className={PHONE_MAP_LAYERS_SHEET_CLASS}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-base font-semibold text-white">Map Layers</p>
                <p className="text-xs text-white/55">Customize the Karl map</p>
              </div>
              <MapChromeCloseButton
                label="Close map layers"
                onClick={() => setIsOpen(false)}
                size="panel"
              />
            </div>

            <PhoneLayersSheetBody
              mapStyle={mapStyle}
              fogLayerEnabled={fogLayerEnabled}
              onMapStyleChange={onMapStyleChange}
              onFogLayerChange={onFogLayerChange}
            />
          </div>
        </>
      ) : null}
    </>
  );
}

export function MapLayerControls({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  layout = "mobile",
  onZoomIn,
  onZoomOut,
  onImmersivePanelOpenChange,
}: MapLayerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (layout === "desktop") {
    return (
      <CollapsibleMapLayerChrome
        placement="desktop"
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={onFogLayerChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />
    );
  }

  if (layout === "immersive") {
    return (
      <CollapsibleMapLayerChrome
        placement="immersive"
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={onFogLayerChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onImmersivePanelOpenChange={onImmersivePanelOpenChange}
      />
    );
  }

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
          <LayerPanelContent
            mapStyle={mapStyle}
            fogLayerEnabled={fogLayerEnabled}
            onMapStyleChange={onMapStyleChange}
            onFogLayerChange={onFogLayerChange}
          />
        </div>
      ) : null}
    </div>
  );
}
