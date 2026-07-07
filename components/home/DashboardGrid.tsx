"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";

import Link from "next/link";

import { FogCoverageIcon, MoonIcon, SunshineIcon } from "@/components/home/ConditionIcons";
import { FogCoverageSlider } from "@/components/home/FogCoverageSlider";
import { MetricDetailSheet } from "@/components/home/MetricDetailSheet";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopGoldIconClass,
  desktopMetricIconFrameClass,
  desktopMetricIconSizeClass,
  desktopMistIconClass,
  mobileCardLabelClass,
  mobileMetricCardSurfaceClass,
  mobileMetricIconFrameClass,
  mobileMetricIconSizeClass,
  mobileMetricPrimaryValueClass,
  mobileKarlStatusValueClass,
} from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  METRIC_DETAILS,
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

const metricCardSurfaceClass = `h-full min-h-[5.75rem] px-3.5 py-3 ${mobileMetricCardSurfaceClass} lg:min-h-[7rem] lg:px-4 lg:py-4`;

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className={`text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38 ${mobileCardLabelClass} lg:text-[0.68rem] lg:tracking-[0.16em] lg:text-karl-gold/82`}
    >
      {children}
    </p>
  );
}

function MetricSpotLabel() {
  return "Clearest Spot";
}

function MetricCardContent({
  label,
  value,
  detail,
  isLoading,
  icon,
  iconFrameClassName,
  valueClassName = "lg:text-[1.65rem]",
  mobileDetailAddon,
}: {
  label: ReactNode;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: ReactNode;
  iconFrameClassName: string;
  valueClassName?: string;
  mobileDetailAddon?: ReactNode;
}) {
  return (
    <div className="flex h-full items-center gap-3 max-sm:items-start max-sm:gap-3.5 lg:items-center lg:gap-3.5">
      <div
        className={`order-2 flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-white/8 bg-white/4 max-sm:self-start max-sm:mt-0.5 ${mobileMetricIconFrameClass} lg:order-1 ${desktopMetricIconFrameClass} ${iconFrameClassName}`}
      >
        {icon}
      </div>
      <div className="order-1 flex min-w-0 flex-1 flex-col lg:order-2">
        <CardLabel>{label}</CardLabel>
        <p
          className={`mt-1 line-clamp-2 text-[1.35rem] font-light leading-none max-sm:mt-1.5 ${mobileMetricPrimaryValueClass} lg:mt-1.5 lg:font-light ${valueClassName} ${
            isLoading ? "opacity-35 text-white" : "text-white/94"
          }`}
        >
          {value}
        </p>
        <p className="mt-1 text-[0.6875rem] font-medium text-white/50 max-sm:mt-1.5 max-sm:text-xs max-sm:text-white/55 lg:mt-1.5 lg:text-xs lg:text-white/55">
          {detail}
        </p>
        {mobileDetailAddon}
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
  mobileDetailAddon,
}: {
  label: ReactNode;
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
  mobileDetailAddon?: ReactNode;
}) {
  const isInteractive = Boolean((mapHref && mapAriaLabel) || (detailKey && onOpenDetail));
  const cardClassName = `${metricCardSurfaceClass}${
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
      mobileDetailAddon={mobileDetailAddon}
    />
  );

  const card = (
    <GlassCard variant="metric" className={cardClassName}>
      {content}
    </GlassCard>
  );

  if (mapHref && mapAriaLabel) {
    return (
      <Link
        href={mapHref}
        aria-label={mapAriaLabel}
        className={`${desktopClickableCardLinkClass} h-full`}
      >
        {card}
      </Link>
    );
  }

  if (detailKey && onOpenDetail && !isLoading) {
    return (
      <button
        type="button"
        aria-label={metricDetailAriaLabel(METRIC_DETAILS[detailKey].title)}
        className={`${desktopClickableCardLinkClass} h-full w-full text-left`}
        onClick={(event) => onOpenDetail(detailKey, event.currentTarget)}
      >
        {card}
      </button>
    );
  }

  return card;
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

  const metricIconClassName = `${desktopMetricIconSizeClass} ${mobileMetricIconSizeClass}`;
  const spotIcon = isNightPresentation ? (
    <MoonIcon className={`${metricIconClassName} text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon className={metricIconClassName} />
  );
  const spotMapHref =
    !isLoading && bestSunshine?.locationID
      ? buildMapHref(bestSunshine.locationID)
      : null;
  const spotMapAriaLabel =
    spotMapHref && bestSunshine
      ? `View clearest spot on map: ${bestSunshine.locationName}`
      : null;

  return (
    <>
      <div
        aria-label="Bay Area conditions dashboard"
        className="grid grid-cols-2 gap-2 max-sm:gap-3 lg:grid-cols-4 lg:grid-rows-1 lg:items-stretch lg:gap-3.5 xl:gap-4"
      >
        <MetricCard
          label="Fog Coverage"
          value={isLoading || !current ? "--" : `${current.fogCoverage}%`}
          detail={isLoading ? "Checking conditions" : "Bay Area"}
          isLoading={isLoading}
          icon={<FogCoverageIcon className={metricIconClassName} />}
          iconFrameClassName={desktopMistIconClass}
          detailKey="fog-coverage"
          onOpenDetail={openMetricDetail}
          mobileDetailAddon={
            !isLoading && current ? (
              <FogCoverageSlider fogCoveragePercent={current.fogCoverage} />
            ) : null
          }
        />
        <MetricCard
          label="Karl Status"
          value={isLoading || !current ? "--" : current.status}
          detail={isLoading ? "Checking conditions" : "Across the Bay"}
          isLoading={isLoading}
          icon={<FogCoverageIcon className={metricIconClassName} />}
          iconFrameClassName={desktopMistIconClass}
          valueClassName={`${mobileKarlStatusValueClass} lg:text-[0.98rem] lg:leading-snug lg:tracking-[-0.01em]`}
          detailKey="karl-status"
          onOpenDetail={openMetricDetail}
        />
        <MetricCard
          label="Clear Skies Score"
          value={isLoading || !current ? "--" : `${current.sunshineScore}`}
          detail={isLoading ? "Checking conditions" : "Bay Area average"}
          isLoading={isLoading}
          icon={<SunshineIcon className={metricIconClassName} />}
          iconFrameClassName={desktopGoldIconClass}
          detailKey="sunshine-score"
          onOpenDetail={openMetricDetail}
        />
        <MetricCard
          label={MetricSpotLabel()}
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
