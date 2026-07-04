"use client";

import { useEffect, useState } from "react";

import type { HeroPresentation } from "@/lib/home/heroPresentation";
import {
  activeHeroImageUrl,
  selectHeroImageSource,
} from "@/lib/home/heroPresentation";

type HomeDesktopBackgroundProps = {
  presentation: HeroPresentation;
};

export function HomeDesktopBackground({
  presentation,
}: HomeDesktopBackgroundProps) {
  const [remoteLoadFailed, setRemoteLoadFailed] = useState(false);
  const [fallbackLoadFailed, setFallbackLoadFailed] = useState(false);
  const imageSource = selectHeroImageSource({
    imageUrl: presentation.imageUrl,
    fallbackImageUrl: presentation.fallbackImageUrl,
    remoteLoadFailed,
    fallbackLoadFailed,
  });
  const heroImageUrl = activeHeroImageUrl(presentation, imageSource);

  useEffect(() => {
    setRemoteLoadFailed(false);
    setFallbackLoadFailed(false);
  }, [presentation.stabilityKey]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      {heroImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${presentation.stabilityKey}|${imageSource}`}
          src={heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover brightness-[1.06] contrast-[1.1] saturate-[1.14] motion-reduce:scale-100 motion-reduce:brightness-100 motion-reduce:contrast-100 motion-reduce:saturate-100"
          onError={() => {
            if (imageSource === "remote") {
              setRemoteLoadFailed(true);
              return;
            }

            setFallbackLoadFailed(true);
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(242,163,38,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(148,92,20,0.14),transparent_34%),linear-gradient(180deg,rgb(7_22_35)_0%,rgb(3_11_20)_52%,rgb(0_0_0)_100%)]" />
      )}

      <div
        className="absolute inset-0 mix-blend-soft-light lg:hidden"
        style={{
          background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity * 0.5}) 0%, rgba(3,11,20,0.02) 42%, rgba(3,11,20,${presentation.atmosphereBottomOpacity * 0.34}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background: `linear-gradient(0deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity * 0.3}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity * 0.16}) 38%, rgba(0,0,0,0.1) 68%, rgba(0,0,0,0.04) 100%)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/42 via-black/16 to-transparent lg:hidden" />
      <div
        className="absolute inset-0 hidden mix-blend-soft-light lg:block"
        style={{
          background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity * 0.4}) 0%, rgba(3,11,20,0.01) 48%, rgba(3,11,20,${presentation.atmosphereBottomOpacity * 0.22}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background: `linear-gradient(0deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity * 0.22}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity * 0.12}) 45%, rgba(0,0,0,0.04) 80%, transparent 100%)`,
        }}
      />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/18 via-transparent to-black/10 md:block" />
    </div>
  );
}
