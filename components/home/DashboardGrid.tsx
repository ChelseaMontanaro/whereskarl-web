import type { ReactNode } from "react";

import {
  FogCoverageIcon,
  KarlStatusIcon,
  MoonIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import {
  desktopGoldIconClass,
  desktopMistIconClass,
} from "@/components/home/desktopGlass";
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
    <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38 lg:text-[0.68rem] lg:tracking-[0.16em] lg:text-karl-gold/85">
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
  iconFrameClassName,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: ReactNode;
  iconFrameClassName: string;
}) {
  return (
    <GlassCard className="border-white/8 bg-karl-navy-glass/55 px-3.5 py-3 backdrop-blur-md lg:border-white/10 lg:bg-black/45 lg:px-4 lg:py-3 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:backdrop-blur-md">
      <div className="flex items-center gap-3 lg:gap-3">
        <div
          className={`order-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/4 text-white/34 lg:order-1 lg:h-[3.25rem] lg:w-[3.25rem] lg:rounded-2xl lg:border ${iconFrameClassName}`}
        >
          {icon}
        </div>
        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <CardLabel>{label}</CardLabel>
          <p
            className={`mt-1 text-[1.35rem] font-light leading-none text-white lg:mt-1.5 lg:text-[1.9rem] lg:font-light ${
              isLoading ? "opacity-35" : "text-white/95"
            }`}
          >
            {value}
          </p>
          <p className="mt-1 text-[0.6875rem] font-medium text-white/50 lg:text-xs lg:text-white/55">
            {detail}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function brightestSpotLabel(isNightPresentation: boolean): string {
  return isNightPresentation ? "Clearest Spot" : "Brightest Spot";
}

export function DashboardGrid({
  current,
  bestSunshine,
  isLoading,
  isNightPresentation = false,
}: DashboardGridProps) {
  const spotIcon = isNightPresentation ? (
    <MoonIcon className="h-5 w-5 lg:h-8 lg:w-8" />
  ) : (
    <SunshineIcon className="h-5 w-5 lg:h-8 lg:w-8" />
  );

  return (
    <div
      aria-label="Bay Area conditions dashboard"
      className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3.5 xl:gap-4"
    >
      <MetricCard
        label="Fog Coverage"
        value={isLoading || !current ? "--" : `${current.fogCoverage}%`}
        detail={isLoading ? "Checking conditions" : "Bay Area"}
        isLoading={isLoading}
        icon={<FogCoverageIcon className="h-5 w-5 lg:h-8 lg:w-8" />}
        iconFrameClassName={desktopMistIconClass}
      />
      <MetricCard
        label="Karl Status"
        value={isLoading || !current ? "--" : current.status}
        detail={isLoading ? "Checking conditions" : "Across the Bay"}
        isLoading={isLoading}
        icon={<KarlStatusIcon className="h-5 w-5 lg:h-8 lg:w-8" />}
        iconFrameClassName={desktopMistIconClass}
      />
      <MetricCard
        label="Sunshine Score"
        value={isLoading || !current ? "--" : `${current.sunshineScore}`}
        detail={isLoading ? "Checking conditions" : "Bay Area average"}
        isLoading={isLoading}
        icon={<SunshineIcon className="h-5 w-5 lg:h-8 lg:w-8" />}
        iconFrameClassName={desktopGoldIconClass}
      />
      <MetricCard
        label={brightestSpotLabel(isNightPresentation)}
        value={
          isLoading || !bestSunshine ? "--" : `${bestSunshine.sunshineScore}`
        }
        detail={
          isLoading || !bestSunshine
            ? "Finding brighter spots"
            : bestSunshine.locationName
        }
        isLoading={isLoading}
        icon={spotIcon}
        iconFrameClassName={
          isNightPresentation ? desktopMistIconClass : desktopGoldIconClass
        }
      />
    </div>
  );
}
