import Link from "next/link";

import { MoonIcon, SunshineIcon } from "@/components/home/ConditionIcons";
import {
  CardLabel,
  InsightCardChevron,
  InsightIconFrame,
} from "@/components/home/InsightCardParts";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopInsightIconSizeClass,
  mobileInsightCardSurfaceClass,
} from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import { buildMapHref } from "@/lib/map/routing";

type BestRightNowSectionProps = {
  items: BestRightNowItem[];
  isLoading?: boolean;
  isNightPresentation?: boolean;
  layout?: "both" | "mobile" | "desktop";
};

function BestRightNowSpotIcon({
  isNightPresentation,
}: {
  isNightPresentation: boolean;
}) {
  return isNightPresentation ? (
    <MoonIcon className={`${desktopInsightIconSizeClass} text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon className={desktopInsightIconSizeClass} />
  );
}

function MobileBestRightNowSection({
  items,
  isNightPresentation = false,
}: BestRightNowSectionProps) {
  return (
    <GlassCard variant="insight" className={`px-4 py-4 ${mobileInsightCardSurfaceClass}`}>
      <CardLabel className="text-white/45 lg:text-white/45">
        Best Right Now
      </CardLabel>
      <ul className="mt-3 max-sm:mt-3.5 space-y-0">
        {items.map((item) => (
          <li
            key={item.locationId}
            className="flex items-start gap-3 max-sm:gap-3.5 border-t border-white/8 pt-3 max-sm:pt-3.5 first:border-t-0 first:pt-0"
          >
            <InsightIconFrame
              tone={isNightPresentation ? "mist" : "gold"}
              size="compact"
            >
              <BestRightNowSpotIcon isNightPresentation={isNightPresentation} />
            </InsightIconFrame>
            <div className="min-w-0 flex-1">
              <p className="text-base max-sm:text-[1.0625rem] font-semibold text-white">
                {item.locationName}
              </p>
              <p className="mt-1 max-sm:mt-1.5 text-sm max-sm:text-[0.9375rem] leading-snug text-white/65">{item.detail}</p>
              {item.isDegraded ? (
                <DegradedDataLabel variant="bestRightNow" className="mt-1.5" />
              ) : null}
            </div>
            {item.score != null ? (
              <BestRightNowScore score={item.score} size="mobile" />
            ) : null}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function BestRightNowScore({
  score,
  size = "desktop",
}: {
  score: number;
  size?: "mobile" | "desktop";
}) {
  return (
    <span
      className={`font-light leading-none text-karl-gold ${
        size === "mobile"
          ? "text-[1.75rem]"
          : "text-xl lg:text-[1.65rem]"
      }`}
    >
      {score}
    </span>
  );
}

function DesktopBestRightNowCard({
  item,
  isNightPresentation = false,
}: {
  item: BestRightNowItem;
  isNightPresentation?: boolean;
}) {
  if (!item.locationId) {
    return (
      <GlassCard variant="desktop" className="flex h-full items-center gap-4 px-5 py-5">
        <InsightIconFrame tone={isNightPresentation ? "mist" : "gold"}>
          <BestRightNowSpotIcon isNightPresentation={isNightPresentation} />
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>Best Right Now</CardLabel>
          <p className="mt-1.5 text-lg font-semibold text-white lg:text-xl">
            {item.locationName}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/68">{item.detail}</p>
          {item.isDegraded ? (
            <DegradedDataLabel variant="bestRightNow" className="mt-1.5" />
          ) : null}
        </div>
        {item.score != null ? (
          <div className="flex shrink-0 items-center gap-2">
            <BestRightNowScore score={item.score} />
          </div>
        ) : null}
      </GlassCard>
    );
  }

  const href = buildMapHref(item.locationId);

  return (
    <Link
      href={href}
      aria-label={`View ${item.locationName} on map`}
      className={`${desktopClickableCardLinkClass} h-full`}
    >
      <GlassCard
        variant="desktop"
        className={`flex h-full items-center gap-4 px-5 py-5 ${desktopClickableCardHoverClass}`}
      >
        <InsightIconFrame tone={isNightPresentation ? "mist" : "gold"}>
          <BestRightNowSpotIcon isNightPresentation={isNightPresentation} />
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>Best Right Now</CardLabel>
          <p className="mt-1.5 text-lg font-semibold text-white lg:text-xl">
            {item.locationName}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/68">{item.detail}</p>
          {item.isDegraded ? (
            <DegradedDataLabel variant="bestRightNow" className="mt-1.5" />
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.score != null ? <BestRightNowScore score={item.score} /> : null}
          <InsightCardChevron />
        </div>
      </GlassCard>
    </Link>
  );
}

function DesktopBestRightNowGrid({
  items,
  isLoading = false,
  isNightPresentation = false,
}: BestRightNowSectionProps) {
  if (isLoading) {
    return (
      <GlassCard variant="desktop" className="col-span-2 px-5 py-5">
        <p className="text-lg font-semibold text-white/50">Finding best spots…</p>
      </GlassCard>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {items.map((item) => (
        <DesktopBestRightNowCard
          key={item.locationId}
          item={item}
          isNightPresentation={isNightPresentation}
        />
      ))}
    </>
  );
}

export function BestRightNowSection({
  items,
  isLoading = false,
  isNightPresentation = false,
  layout = "both",
}: BestRightNowSectionProps) {
  if (layout === "mobile") {
    if (items.length === 0) {
      return null;
    }

    return <MobileBestRightNowSection items={items} isNightPresentation={isNightPresentation} />;
  }

  if (layout === "desktop") {
    return <DesktopBestRightNowGrid items={items} isLoading={isLoading} isNightPresentation={isNightPresentation} />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileBestRightNowSection
          items={items}
          isNightPresentation={isNightPresentation}
        />
      </div>
      <div className="hidden lg:block">
        <DesktopBestRightNowGrid
          items={items}
          isLoading={isLoading}
          isNightPresentation={isNightPresentation}
        />
      </div>
    </>
  );
}
