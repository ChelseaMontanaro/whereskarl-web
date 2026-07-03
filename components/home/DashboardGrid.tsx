import type { ReactNode } from "react";

import {
  FogCoverageIcon,
  KarlStatusIcon,
  MoonIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { BestSunshineResponse, CurrentResponse } from "@/lib/schemas/weather";

type DashboardGridProps = {
  current: CurrentResponse | null;
  bestSunshine: BestSunshineResponse | null;
  isLoading: boolean;
  isNightPresentation?: boolean;
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
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: ReactNode;
}) {
  return (
    <GlassCard className="border-white/8 bg-karl-navy-glass/55 px-3.5 py-3.5 backdrop-blur-md lg:px-5 lg:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardLabel>{label}</CardLabel>
          <p
            className={`mt-1.5 text-2xl font-light text-white lg:text-[1.75rem] ${
              isLoading ? "opacity-35" : "opacity-90"
            }`}
          >
            {value}
          </p>
          <p className="mt-0.5 text-xs font-medium text-white/50 lg:text-sm">
            {detail}
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-white/8 bg-white/4 p-2 text-white/34">
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

export function DashboardGrid({
  current,
  bestSunshine,
  isLoading,
  isNightPresentation = false,
}: DashboardGridProps) {
  const sunshineIcon = isNightPresentation ? (
    <MoonIcon className="h-5 w-5" />
  ) : (
    <SunshineIcon className="h-5 w-5" />
  );

  return (
    <div
      aria-label="Bay Area conditions dashboard"
      className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4 xl:gap-5"
    >
      <MetricCard
        label="Fog Coverage"
        value={isLoading || !current ? "--" : `${current.fogCoverage}%`}
        detail={isLoading ? "Checking conditions" : "Bay Area"}
        isLoading={isLoading}
        icon={<FogCoverageIcon className="h-5 w-5" />}
      />
      <MetricCard
        label="Karl Status"
        value={isLoading || !current ? "--" : current.status}
        detail={isLoading ? "Checking conditions" : "Across the Bay"}
        isLoading={isLoading}
        icon={<KarlStatusIcon className="h-5 w-5" />}
      />
      <MetricCard
        label="Sunshine Score"
        value={isLoading || !current ? "--" : `${current.sunshineScore}`}
        detail={isLoading ? "Checking conditions" : "Bay Area average"}
        isLoading={isLoading}
        icon={sunshineIcon}
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
        icon={sunshineIcon}
      />
    </div>
  );
}
