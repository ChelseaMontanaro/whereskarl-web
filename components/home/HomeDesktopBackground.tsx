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
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover motion-reduce:scale-100"
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
        className="absolute inset-0 mix-blend-multiply lg:hidden"
        style={{
          background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity * 0.72}) 0%, rgba(3,11,20,0.04) 42%, rgba(3,11,20,${presentation.atmosphereBottomOpacity * 0.48}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background: `linear-gradient(0deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity * 0.42}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity * 0.22}) 38%, rgba(0,0,0,0.14) 68%, rgba(0,0,0,0.06) 100%)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/22 to-transparent lg:hidden" />
      <div
        className="absolute inset-0 hidden mix-blend-multiply lg:block"
        style={{
          background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity * 0.55}) 0%, rgba(3,11,20,0.02) 48%, rgba(3,11,20,${presentation.atmosphereBottomOpacity * 0.32}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background: `linear-gradient(0deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity * 0.28}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity * 0.16}) 45%, rgba(0,0,0,0.06) 80%, transparent 100%)`,
        }}
      />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/28 via-transparent to-black/18 md:block" />
    </div>
  );
}
