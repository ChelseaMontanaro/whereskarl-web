import type { ReactNode } from "react";

import Link from "next/link";

import {
  FogCoverageIcon,
  KarlStatusIcon,
  MoonIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopGoldIconClass,
  desktopMetricIconFrameClass,
  desktopMetricIconSizeClass,
  desktopMistIconClass,
} from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import { buildMapHref } from "@/lib/map/routing";
import type { BestSunshineResponse, CurrentResponse } from "@/lib/schemas/weather";

type DashboardGridProps = {
  current: CurrentResponse | null;
  bestSunshine: BestSunshineResponse | null;
  isLoading: boolean;
  isNightPresentation?: boolean;
};

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38 lg:text-[0.68rem] lg:tracking-[0.16em] lg:text-karl-gold/82">
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
  valueClassName = "lg:text-[1.65rem]",
  mapHref,
  mapAriaLabel,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: ReactNode;
  iconFrameClassName: string;
  valueClassName?: string;
  mapHref?: string | null;
  mapAriaLabel?: string | null;
}) {
  const cardClassName = `border-white/8 bg-karl-navy-glass/55 px-3.5 py-3 backdrop-blur-md lg:border-white/10 lg:bg-black/34 lg:px-4 lg:py-4 lg:shadow-[0_4px_20px_rgba(0,0,0,0.14)] lg:backdrop-blur-md${
    mapHref && mapAriaLabel ? ` ${desktopClickableCardHoverClass}` : ""
  }`;

  const card = (
    <GlassCard className={cardClassName}>
      <div className="flex items-center gap-3 lg:items-center lg:gap-3.5">
        <div
          className={`order-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/4 lg:order-1 ${desktopMetricIconFrameClass} ${iconFrameClassName}`}
        >
          {icon}
        </div>
        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <CardLabel>{label}</CardLabel>
          <p
            className={`mt-1 text-[1.35rem] font-light leading-none lg:mt-1.5 lg:font-light ${valueClassName} ${
              isLoading ? "opacity-35 text-white" : "text-white/94"
            }`}
          >
            {value}
          </p>
          <p className="mt-1 text-[0.6875rem] font-medium text-white/50 lg:mt-1.5 lg:text-xs lg:text-white/55">
            {detail}
          </p>
        </div>
      </div>
    </GlassCard>
  );

  if (mapHref && mapAriaLabel) {
    return (
      <Link
        href={mapHref}
        aria-label={mapAriaLabel}
        className={desktopClickableCardLinkClass}
      >
        {card}
      </Link>
    );
  }

  return card;
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
    <MoonIcon className={`${desktopMetricIconSizeClass} text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon className={desktopMetricIconSizeClass} />
  );
  const spotLabel = brightestSpotLabel(isNightPresentation);
  const spotMapHref =
    !isLoading && bestSunshine?.locationID
      ? buildMapHref(bestSunshine.locationID)
      : null;
  const spotMapAriaLabel =
    spotMapHref && bestSunshine
      ? `View ${spotLabel.toLowerCase()} on map: ${bestSunshine.locationName}`
      : null;

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
        icon={<FogCoverageIcon className={desktopMetricIconSizeClass} />}
        iconFrameClassName={desktopMistIconClass}
      />
      <MetricCard
        label="Karl Status"
        value={isLoading || !current ? "--" : current.status}
        detail={isLoading ? "Checking conditions" : "Across the Bay"}
        isLoading={isLoading}
        icon={<KarlStatusIcon className={desktopMetricIconSizeClass} />}
        iconFrameClassName={desktopMistIconClass}
        valueClassName="lg:text-[0.98rem] lg:leading-snug lg:tracking-[-0.01em]"
      />
      <MetricCard
        label="Sunshine Score"
        value={isLoading || !current ? "--" : `${current.sunshineScore}`}
        detail={isLoading ? "Checking conditions" : "Bay Area average"}
        isLoading={isLoading}
        icon={<SunshineIcon className={desktopMetricIconSizeClass} />}
        iconFrameClassName={desktopGoldIconClass}
      />
      <MetricCard
        label={spotLabel}
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
        mapHref={spotMapHref}
        mapAriaLabel={spotMapAriaLabel}
      />
    </div>
  );
}
