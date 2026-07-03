import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import type { BestSunshineResponse, CurrentResponse } from "@/lib/schemas/weather";

type DashboardGridProps = {
  current: CurrentResponse | null;
  bestSunshine: BestSunshineResponse | null;
  isLoading: boolean;
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
      {children}
    </p>
  );
}

function MetricCard({
  label,
  value,
  detail,
  isLoading,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
}) {
  return (
    <GlassCard className="px-4 py-4">
      <CardLabel>{label}</CardLabel>
      <p
        className={`mt-2 text-3xl font-light text-white ${
          isLoading ? "opacity-40" : "opacity-95"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-white/60">{detail}</p>
    </GlassCard>
  );
}

export function DashboardGrid({
  current,
  bestSunshine,
  isLoading,
}: DashboardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard
        label="Fog Coverage"
        value={isLoading || !current ? "--" : `${current.fogCoverage}%`}
        detail={isLoading ? "Checking conditions" : "Bay Area"}
        isLoading={isLoading}
      />
      <MetricCard
        label="Karl Status"
        value={isLoading || !current ? "--" : current.status}
        detail={isLoading ? "Checking conditions" : "Across the Bay"}
        isLoading={isLoading}
      />
      <MetricCard
        label="Sunshine Score"
        value={isLoading || !current ? "--" : `${current.sunshineScore}`}
        detail={isLoading ? "Checking conditions" : "Bay Area average"}
        isLoading={isLoading}
      />
      <MetricCard
        label="Brightest Spot"
        value={
          isLoading || !bestSunshine
            ? "--"
            : `${bestSunshine.sunshineScore}`
        }
        detail={
          isLoading || !bestSunshine
            ? "Finding brighter spots"
            : bestSunshine.locationName
        }
        isLoading={isLoading}
      />
    </div>
  );
}
