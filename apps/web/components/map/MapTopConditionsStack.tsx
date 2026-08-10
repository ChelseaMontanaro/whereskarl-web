"use client";

import type { ReactNode } from "react";

import { MapConditionsPanel } from "@/components/map/MapConditionsPanel";
import { MapFogLegend } from "@/components/map/MapFogLegend";
import type { FogIntensity } from "@whereskarl/domain";

type MapTopConditionsStackProps = {
  isLoading: boolean;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  activeIntensity: FogIntensity | null;
  onSelectIntensity: (intensity: FogIntensity) => void;
  warnings?: ReactNode;
  compact?: boolean;
};

/**
 * Shared tablet + desktop top-left stack: conditions summary, fog legend,
 * and optional query warnings. Placement wrappers stay form-factor specific.
 */
export function MapTopConditionsStack({
  isLoading,
  selectedRegionId,
  onSelectRegion,
  activeIntensity,
  onSelectIntensity,
  warnings,
  compact = false,
}: MapTopConditionsStackProps) {
  return (
    <>
      <MapConditionsPanel
        isLoading={isLoading}
        selectedRegionId={selectedRegionId}
        onSelectRegion={onSelectRegion}
        compact={compact}
      />
      <MapFogLegend
        layout="desktop-stack"
        activeIntensity={activeIntensity}
        onSelectIntensity={onSelectIntensity}
      />
      {warnings}
    </>
  );
}
