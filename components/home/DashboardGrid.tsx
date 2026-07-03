"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";

import Link from "next/link";

import {
  FogCoverageIcon,
  KarlStatusIcon,
  MoonIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import { MetricDetailSheet } from "@/components/home/MetricDetailSheet";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopGoldIconClass,
  desktopMetricIconFrameClass,
  desktopMetricIconSizeClass,
  desktopMistIconClass,
} from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  metricDetailAriaLabel,
  type MetricDetailKey,
} from "@/lib/home/metricDetails";
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

function MetricCardContent({
  label,
  value,
  detail,
  isLoading,
  icon,
  iconFrameClassName,
  valueClassName = "lg:text-[1.65rem]",
  showDetailHint = false,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: ReactNode;
  iconFrameClassName: string;
  valueClassName?: string;
  showDetailHint?: boolean;
}) {
  return (
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
        {showDetailHint && !isLoading ? (
          <p className="mt-1 text-[0.625rem] font-medium text-karl-gold/58 lg:mt-1.5">
            What does this mean?
          </p>
        ) : null}
      </div>
    </div>
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
  detailKey,
  onOpenDetail,
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
  detailKey?: MetricDetailKey;
  onOpenDetail?: (key: MetricDetailKey, trigger: HTMLButtonElement) => void;
}) {
  const isInteractive = Boolean((mapHref && mapAriaLabel) || (detailKey && onOpenDetail));
  const cardClassName = `border-white/8 bg-karl-navy-glass/55 px-3.5 py-3 backdrop-blur-md lg:border-white/10 lg:bg-black/34 lg:px-4 lg:py-4 lg:shadow-[0_4px_20px_rgba(0,0,0,0.14)] lg:backdrop-blur-md${
    isInteractive ? ` ${desktopClickableCardHoverClass}` : ""
  }`;

  const content = (
    <MetricCardContent
      label={label}
      value={value}
      detail={detail}
      isLoading={isLoading}
      icon={icon}
      iconFrameClassName={iconFrameClassName}
      valueClassName={valueClassName}
      showDetailHint={Boolean(detailKey)}
    />
  );

  const card = <GlassCard className={cardClassName}>{content}</GlassCard>;

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

  if (detailKey && onOpenDetail && !isLoading) {
    return (
      <button
        type="button"
        aria-label={metricDetailAriaLabel(label)}
        className={`${desktopClickableCardLinkClass} w-full text-left`}
        onClick={(event) => onOpenDetail(detailKey, event.currentTarget)}
      >
        {card}
      </button>
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
  const [activeMetric, setActiveMetric] = useState<MetricDetailKey | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openMetricDetail = (key: MetricDetailKey, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setActiveMetric(key);
  };

  const closeMetricDetail = () => {
    setActiveMetric(null);
    lastTriggerRef.current?.focus();
  };

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
    <>
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
          detailKey="fog-coverage"
          onOpenDetail={openMetricDetail}
        />
        <MetricCard
          label="Karl Status"
          value={isLoading || !current ? "--" : current.status}
          detail={isLoading ? "Checking conditions" : "Across the Bay"}
          isLoading={isLoading}
          icon={<KarlStatusIcon className={desktopMetricIconSizeClass} />}
          iconFrameClassName={desktopMistIconClass}
          valueClassName="lg:text-[0.98rem] lg:leading-snug lg:tracking-[-0.01em]"
          detailKey="karl-status"
          onOpenDetail={openMetricDetail}
        />
        <MetricCard
          label="Sunshine Score"
          value={isLoading || !current ? "--" : `${current.sunshineScore}`}
          detail={isLoading ? "Checking conditions" : "Bay Area average"}
          isLoading={isLoading}
          icon={<SunshineIcon className={desktopMetricIconSizeClass} />}
          iconFrameClassName={desktopGoldIconClass}
          detailKey="sunshine-score"
          onOpenDetail={openMetricDetail}
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
      <MetricDetailSheet metricKey={activeMetric} onClose={closeMetricDetail} />
    </>
  );
}
