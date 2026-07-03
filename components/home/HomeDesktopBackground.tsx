"use client";

import { useEffect, useState } from "react";

import type { HeroPresentation } from "@/lib/home/heroPresentation";
import { selectHeroImageSource } from "@/lib/home/heroPresentation";

type HomeDesktopBackgroundProps = {
  presentation: HeroPresentation;
};

export function HomeDesktopBackground({
  presentation,
}: HomeDesktopBackgroundProps) {
  const [remoteLoadFailed, setRemoteLoadFailed] = useState(false);
  const imageSource = selectHeroImageSource({
    imageUrl: presentation.imageUrl,
    remoteLoadFailed,
  });

  useEffect(() => {
    setRemoteLoadFailed(false);
  }, [presentation.stabilityKey]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 hidden lg:block"
    >
      {imageSource === "remote" && presentation.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={presentation.stabilityKey}
          src={presentation.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover motion-reduce:scale-100"
          onError={() => setRemoteLoadFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(242,163,38,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(148,92,20,0.14),transparent_34%),linear-gradient(180deg,rgb(7_22_35)_0%,rgb(3_11_20)_52%,rgb(0_0_0)_100%)]" />
      )}

      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background: `linear-gradient(180deg, rgba(3,11,20,${presentation.atmosphereTopOpacity}) 0%, rgba(3,11,20,0.08) 42%, rgba(3,11,20,${presentation.atmosphereBottomOpacity * 0.72}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(0deg, rgba(0,0,0,${presentation.bottomGradientLeadOpacity * 0.55}) 0%, rgba(0,0,0,${presentation.bottomGradientMidOpacity * 0.35}) 38%, rgba(0,0,0,0.18) 72%, rgba(0,0,0,0.08) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/35" />
    </div>
  );
}
