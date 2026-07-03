import Link from "next/link";

import { SunshineIcon } from "@/components/home/ConditionIcons";
import {
  CardLabel,
  InsightCardChevron,
  InsightIconFrame,
  SunshineScoreBadge,
} from "@/components/home/InsightCardParts";
import { desktopClickableCardHoverClass, desktopClickableCardLinkClass, desktopInsightIconSizeClass } from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import { buildMapHref } from "@/lib/map/routing";

type BestRightNowSectionProps = {
  items: BestRightNowItem[];
  layout?: "both" | "mobile" | "desktop";
};

function MobileBestRightNowSection({ items }: BestRightNowSectionProps) {
  return (
    <GlassCard className="px-4 py-4">
      <CardLabel className="text-white/45 lg:text-white/45">
        Best Right Now
      </CardLabel>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={item.locationId}
            className="border-t border-white/8 pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-white">
                  {item.locationName}
                </p>
                <p className="mt-1 text-sm text-white/65">{item.detail}</p>
              </div>
              {item.score != null ? (
                <span className="rounded-full border border-karl-gold/25 px-2 py-1 text-xs font-semibold text-karl-gold">
                  {item.score}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function DesktopBestRightNowCard({ item }: { item: BestRightNowItem }) {
  if (!item.locationId) {
    return (
      <GlassCard variant="desktop" className="flex h-full items-center gap-4 px-5 py-5">
        <InsightIconFrame tone="gold">
          <SunshineIcon className={desktopInsightIconSizeClass} />
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>Best Right Now</CardLabel>
          <p className="mt-1.5 text-lg font-semibold text-white lg:text-xl">
            {item.locationName}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/68">{item.detail}</p>
        </div>
        {item.score != null ? (
          <div className="flex shrink-0 items-center gap-2">
            <SunshineScoreBadge score={item.score} />
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
      className={desktopClickableCardLinkClass}
    >
      <GlassCard
        variant="desktop"
        className={`flex h-full items-center gap-4 px-5 py-5 ${desktopClickableCardHoverClass}`}
      >
        <InsightIconFrame tone="gold">
          <SunshineIcon className={desktopInsightIconSizeClass} />
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>Best Right Now</CardLabel>
          <p className="mt-1.5 text-lg font-semibold text-white lg:text-xl">
            {item.locationName}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/68">{item.detail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.score != null ? <SunshineScoreBadge score={item.score} /> : null}
          <InsightCardChevron />
        </div>
      </GlassCard>
    </Link>
  );
}

export function BestRightNowSection({
  items,
  layout = "both",
}: BestRightNowSectionProps) {
  if (items.length === 0) {
    return null;
  }

  if (layout === "mobile") {
    return <MobileBestRightNowSection items={items} />;
  }

  if (layout === "desktop") {
    return <DesktopBestRightNowCard item={items[0]} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileBestRightNowSection items={items} />
      </div>
      <div className="hidden lg:block">
        <DesktopBestRightNowCard item={items[0]} />
      </div>
    </>
  );
}
