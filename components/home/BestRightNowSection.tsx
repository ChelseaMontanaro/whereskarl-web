import { MoonIcon, SunshineIcon } from "@/components/home/ConditionIcons";
import {
  CardLabel,
  InsightPlainIcon,
} from "@/components/home/InsightCardParts";
import {
  desktopInsightIconSizeClass,
  mobileInsightCardSurfaceClass,
} from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

type BestRightNowSectionProps = {
  items: BestRightNowItem[];
  isLoading?: boolean;
  isNightPresentation?: boolean;
  layout?: "both" | "mobile" | "desktop";
};

/** Prevents iOS Safari from auto-linking city names to Apple/Google Maps. */
const preventLocationAutoLinkProps = {
  "x-apple-data-detectors": "false",
} as const;

function BestRightNowSpotIcon({
  isNightPresentation,
  sunIconClassName = "",
}: {
  isNightPresentation: boolean;
  sunIconClassName?: string;
}) {
  return isNightPresentation ? (
    <MoonIcon className={`${desktopInsightIconSizeClass} text-[#8CB8D8]`} />
  ) : (
    <SunshineIcon
      className={`${desktopInsightIconSizeClass} ${sunIconClassName}`.trim()}
    />
  );
}

function BestRightNowLocationCopy({
  locationName,
  detail,
  weatherMetadata,
  isDegraded,
  nameClassName,
  detailClassName,
  metadataClassName,
}: {
  locationName: string;
  detail: string;
  weatherMetadata?: string[];
  isDegraded?: boolean;
  nameClassName: string;
  detailClassName: string;
  metadataClassName: string;
}) {
  return (
    <>
      <p className={nameClassName}>{locationName}</p>
      <p className={detailClassName}>{detail}</p>
      {weatherMetadata && weatherMetadata.length > 0 ? (
        <p className={metadataClassName}>{weatherMetadata.join(" • ")}</p>
      ) : null}
      {isDegraded ? (
        <DegradedDataLabel variant="bestRightNow" className="mt-1.5" />
      ) : null}
    </>
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
      <ul
        className="mt-3 max-sm:mt-3.5 space-y-2"
        {...preventLocationAutoLinkProps}
      >
        {items.map((item) => (
          <li
            key={item.locationId}
            className="flex items-start gap-3 max-sm:gap-3.5"
          >
            <InsightPlainIcon size="compact">
              <BestRightNowSpotIcon
                isNightPresentation={isNightPresentation}
                sunIconClassName="text-karl-gold"
              />
            </InsightPlainIcon>
            <div className="min-w-0 flex-1" {...preventLocationAutoLinkProps}>
              <BestRightNowLocationCopy
                locationName={item.locationName}
                detail={item.detail}
                weatherMetadata={item.weatherMetadata}
                isDegraded={item.isDegraded}
                nameClassName="text-base max-sm:text-[1.0625rem] font-semibold text-white"
                detailClassName="mt-1 max-sm:mt-1.5 text-sm max-sm:text-[0.9375rem] leading-snug text-white/65"
                metadataClassName="mt-1 max-sm:mt-1 text-[0.6875rem] max-sm:text-xs font-medium leading-snug text-white/48"
              />
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
  return (
    <GlassCard variant="desktop" className="flex h-full items-center gap-4 px-5 py-5">
      <InsightPlainIcon>
        <BestRightNowSpotIcon isNightPresentation={isNightPresentation} />
      </InsightPlainIcon>
      <div className="min-w-0 flex-1" {...preventLocationAutoLinkProps}>
        <CardLabel>Best Right Now</CardLabel>
        <BestRightNowLocationCopy
          locationName={item.locationName}
          detail={item.detail}
          weatherMetadata={item.weatherMetadata}
          isDegraded={item.isDegraded}
          nameClassName="mt-1.5 text-lg font-semibold text-white lg:text-xl"
          detailClassName="mt-1 text-sm leading-relaxed text-white/68"
          metadataClassName="mt-1.5 text-[0.65rem] font-medium text-white/48"
        />
      </div>
      {item.score != null ? (
        <div className="flex shrink-0 items-center gap-2">
          <BestRightNowScore score={item.score} />
        </div>
      ) : null}
    </GlassCard>
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
