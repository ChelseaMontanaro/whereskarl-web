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
    <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38">
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
    <GlassCard className="border-white/8 bg-karl-navy-glass/55 px-3.5 py-3.5 backdrop-blur-md">
      <CardLabel>{label}</CardLabel>
      <p
        className={`mt-1.5 text-2xl font-light text-white ${
          isLoading ? "opacity-35" : "opacity-90"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-white/50">{detail}</p>
    </GlassCard>
  );
}

export function DashboardGrid({
  current,
  bestSunshine,
  isLoading,
}: DashboardGridProps) {
  return (
    <div
      aria-label="Bay Area conditions dashboard"
      className="grid grid-cols-2 gap-2"
    >
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
          isLoading || !bestSunshine ? "--" : `${bestSunshine.sunshineScore}`
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
