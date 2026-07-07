"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";

import Link from "next/link";

import { FogCoverageIcon, MoonIcon, SunshineIcon } from "@/components/home/ConditionIcons";
import { ClearestSpotGauge } from "@/components/home/ClearestSpotGauge";
import { ClearSkiesScoreSlider } from "@/components/home/ClearSkiesScoreSlider";
import { FogCoverageSlider } from "@/components/home/FogCoverageSlider";
import { MetricCardLabel, TwoLineMetricLabel } from "@/components/home/MetricCardLabel";
import { MetricDetailSheet } from "@/components/home/MetricDetailSheet";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopGoldIconClass,
  desktopMetricIconFrameClass,
  desktopMetricIconSizeClass,
  desktopMistIconClass,
  mobileKarlStatusValueAreaClass,
  mobileMetricCardSurfaceClass,
  mobileMetricIconWrapperClass,
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

const metricCardSurfaceClass = `h-full min-h-[5.75rem] px-3.5 py-3 ${mobileMetricCardSurfaceClass} lg:min-h-[7rem] lg:h-auto lg:px-4 lg:py-4`;

function MetricCardContent({
  label,
  value,
  detail,
  isLoading,
  icon,
  iconFrameClassName,
  valueClassName = "lg:text-[1.65rem]",
  mobileDetailAddon,
  mobileValueLayout = "numeric",
}: {
  label: ReactNode;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: ReactNode;
  iconFrameClassName: string;
  valueClassName?: string;
  mobileDetailAddon?: ReactNode;
  mobileValueLayout?: "numeric" | "phrase";
}) {
  const valueAreaClassName =
    mobileValueLayout === "phrase" ? mobileKarlStatusValueAreaClass : "";

  return (
    <div className="flex h-full w-full flex-col max-sm:justify-between">
      <div className="relative flex min-w-0 flex-1 lg:items-center lg:gap-3.5">
        <div className="order-1 flex min-w-0 flex-1 flex-col max-sm:pr-10 lg:order-2">
          <MetricCardLabel>{label}</MetricCardLabel>
          <p
            className={`mt-1 line-clamp-2 text-[1.35rem] font-light leading-none max-sm:mt-1.5 ${mobileMetricPrimaryValueClass} lg:mt-1.5 lg:font-light ${valueClassName} ${valueAreaClassName} ${
              isLoading ? "opacity-35 text-white" : "text-white/94"
            }`}
          >
            {value}
          </p>
          <p className="mt-1 text-[0.6875rem] font-medium text-white/50 max-sm:mt-1.5 max-sm:text-xs max-sm:text-white/55 lg:mt-1.5 lg:text-xs lg:text-white/55">
            {detail}
          </p>
        </div>
        <div
          className={`${mobileMetricIconWrapperClass} ${desktopMetricIconFrameClass} ${iconFrameClassName}`}
          data-testid="metric-card-icon"
        >
          {icon}
        </div>
      </div>
      {mobileDetailAddon}
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
  mobileValueLayout = "numeric",
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
  mobileValueLayout?: "numeric" | "phrase";
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
      mobileValueLayout={mobileValueLayout}
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
  const sunshineMetricIconClassName = `${metricIconClassName} max-sm:text-karl-gold`;
  const spotIcon = isNightPresentation ? (
    <MoonIcon className={`${metricIconClassName} max-sm:text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon className={sunshineMetricIconClassName} />
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
          mobileValueLayout="phrase"
        />
        <MetricCard
          label={
            <TwoLineMetricLabel
              lineOne="Clear Skies"
              lineTwo="Score"
              desktopText="Clear Skies Score"
            />
          }
          value={isLoading || !current ? "--" : `${current.sunshineScore}`}
          detail={isLoading ? "Checking conditions" : "Bay Area average"}
          isLoading={isLoading}
          icon={<SunshineIcon className={sunshineMetricIconClassName} />}
          iconFrameClassName={desktopGoldIconClass}
          detailKey="sunshine-score"
          onOpenDetail={openMetricDetail}
          mobileDetailAddon={
            !isLoading && current ? (
              <ClearSkiesScoreSlider sunshineScore={current.sunshineScore} />
            ) : null
          }
        />
        <MetricCard
          label={
            <TwoLineMetricLabel
              lineOne="Clearest"
              lineTwo="Spot"
              desktopText="Clearest Spot"
            />
          }
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
          mobileDetailAddon={
            !isLoading && bestSunshine ? (
              <ClearestSpotGauge score={bestSunshine.sunshineScore} />
            ) : null
          }
        />
      </div>
      <MetricDetailSheet metricKey={activeMetric} onClose={closeMetricDetail} />
    </>
  );
}
