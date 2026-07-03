"use client";

import { useEffect, useState } from "react";

import type { HeroPresentation } from "@/lib/home/heroPresentation";
import { selectHeroImageSource } from "@/lib/home/heroPresentation";

type CinematicHeroProps = {
  presentation: HeroPresentation;
  headline: string;
  subheadline: string;
  statusLabel: string;
  isLoading: boolean;
};

export function CinematicHero({
  presentation,
  headline,
  subheadline,
  statusLabel,
  isLoading,
}: CinematicHeroProps) {
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
      className="relative min-h-[70vh] w-full overflow-hidden"
    >
      {imageSource === "remote" && presentation.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={presentation.imageUrl}
          alt={presentation.altText ?? "Bay Area weather hero image"}
          className="absolute inset-0 h-full w-full object-cover motion-reduce:transition-none"
          onError={() => setRemoteLoadFailed(true)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,163,38,0.18),transparent_42%),linear-gradient(180deg,rgb(7_22_35)_0%,rgb(3_11_20)_52%,rgb(0_0_0)_100%)]"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity}) 0%, rgba(3,11,20,0) 38%, rgba(3,11,20,${presentation.atmosphereBottomOpacity}) 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity}) 34%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.18) 100%)`,
        }}
      />

      <div className="relative mx-auto flex h-full min-h-[70vh] w-full max-w-[430px] flex-col justify-end px-4 pb-10 pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-karl-gold/90">
          {isLoading ? "Reading Karl intelligence" : statusLabel}
        </p>
        <h1 className="mt-3 max-w-[18ch] text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {headline}
        </h1>
        <p className="mt-3 max-w-[30ch] text-sm text-white/72 sm:text-base">
          {subheadline}
        </p>
      </div>
    </section>
  );
}
