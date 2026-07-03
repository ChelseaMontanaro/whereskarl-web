"use client";

import { useEffect, useState } from "react";

import { FindClearSkiesCta } from "@/components/home/FindClearSkiesCta";
import type { HeroPresentation } from "@/lib/home/heroPresentation";
import { selectHeroImageSource } from "@/lib/home/heroPresentation";

type HomeHeroProps = {
  presentation: HeroPresentation;
  headline: string;
  subheadline: string;
  confidenceText: string | null;
  isLoading: boolean;
  clearSkiesLocationId: string | null;
  isFindingClearSkies: boolean;
};

function HeroPositionBadge({ isLoading }: { isLoading: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.115em] text-white/78 backdrop-blur-sm">
      {isLoading ? "Reading Karl intelligence" : "Karl's current position"}
    </span>
  );
}

export function HomeHero({
  presentation,
  headline,
  subheadline,
  confidenceText,
  isLoading,
  clearSkiesLocationId,
  isFindingClearSkies,
}: HomeHeroProps) {
  const [remoteLoadFailed, setRemoteLoadFailed] = useState(false);
  const imageSource = selectHeroImageSource({
    imageUrl: presentation.imageUrl,
    remoteLoadFailed,
  });

  useEffect(() => {
    setRemoteLoadFailed(false);
  }, [presentation.stabilityKey]);

  return (
    <section
      aria-label="Karl conditions hero"
      className="relative min-h-[min(540px,70vh)] w-full overflow-hidden lg:min-h-0 lg:overflow-visible"
    >
      <div className="lg:hidden">
        {imageSource === "remote" && presentation.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={presentation.stabilityKey}
            src={presentation.imageUrl}
            alt={presentation.altText ?? "Bay Area weather hero image"}
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover motion-reduce:scale-100 motion-reduce:transition-none"
            onError={() => setRemoteLoadFailed(true)}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(242,163,38,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(148,92,20,0.14),transparent_34%),linear-gradient(180deg,rgb(7_22_35)_0%,rgb(3_11_20)_52%,rgb(0_0_0)_100%)]"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity}) 0%, rgba(3,11,20,0) 38%, rgba(3,11,20,${presentation.atmosphereBottomOpacity}) 100%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(0deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity}) 34%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.12) 100%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/35 to-transparent"
        />
      </div>

      <div className="relative mx-auto flex min-h-[min(540px,70vh)] w-full max-w-[430px] flex-col lg:min-h-0 lg:max-w-6xl lg:px-8 xl:max-w-7xl">
        <div className="flex flex-col items-center px-5 pt-6 text-center sm:pt-8 lg:hidden">
          <h2 className="font-serif text-[2rem] font-semibold leading-none tracking-[0.01em] text-white/[0.96] [text-shadow:0_7px_16px_rgba(0,0,0,0.52)] sm:text-[2.15rem]">
            Where&apos;s Karl?
          </h2>
          <p className="mt-1.5 font-serif text-xs font-bold uppercase tracking-[0.3em] text-karl-gold">
            Track Karl across the Bay
          </p>
        </div>

        <div className="mt-auto px-5 pb-14 lg:mt-0 lg:min-h-[17rem] lg:px-0 lg:pb-6 lg:pt-32 lg:text-left xl:min-h-[18rem]">
          <HeroPositionBadge isLoading={isLoading} />
          <h1
            className={`mt-3 max-w-[18ch] font-serif text-[1.75rem] font-semibold leading-[1.12] text-white/[0.98] [text-shadow:0_5px_14px_rgba(0,0,0,0.56)] sm:text-[1.85rem] lg:max-w-[22ch] lg:text-[2.65rem] lg:leading-[1.06] xl:max-w-[24ch] xl:text-[2.85rem] ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {headline}
          </h1>
          <p className="mt-3 max-w-[34ch] text-[0.9375rem] font-medium leading-snug text-white/[0.82] [text-shadow:0_4px_10px_rgba(0,0,0,0.46)] lg:max-w-[44ch] lg:text-[1.05rem] lg:leading-relaxed xl:max-w-[48ch]">
            {subheadline}
          </p>
          {confidenceText ? (
            <p className="mt-2.5 max-w-[34ch] text-[0.6875rem] font-medium text-white/50 [text-shadow:0_3px_8px_rgba(0,0,0,0.36)] lg:max-w-[44ch] lg:text-xs">
              {confidenceText}
            </p>
          ) : null}
          <FindClearSkiesCta
            locationId={clearSkiesLocationId}
            isLoading={isFindingClearSkies}
            className="mt-5 lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
