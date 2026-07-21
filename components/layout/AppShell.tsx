"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ConditionsFooter } from "@/components/layout/ConditionsFooter";
import { DesktopTopNav } from "@/components/layout/DesktopTopNav";
import { DevStatusFooter } from "@/components/layout/DevStatusFooter";
import {
  PrimaryNavList,
  SecondaryNavList,
} from "@/components/layout/NavLinks";
import { ClearSkiesNavProvider } from "@/components/providers/ClearSkiesNavProvider";
import { usePhonePortrait } from "@/lib/hooks/usePhonePortrait";

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/12 bg-black/40 backdrop-blur-lg shadow-[0_-10px_32px_rgba(0,0,0,0.28)] lg:hidden"
    >
      {/*
        Keep nav content above the home-indicator / browser bottom chrome.
        `viewport-fit=cover` makes env(safe-area-inset-bottom) non-zero; the
        0.5rem floor preserves the pre-cover minimum gap on devices without a
        home indicator. Padding lives on the inner row so the glass bar still
        paints edge-to-edge while icons/labels stay fully visible.
      */}
      <div className="mx-auto flex max-w-[430px] items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-2">
        <PrimaryNavList layout="bottom" />
      </div>
    </nav>
  );
}

function MobileSecondaryLinks() {
  return (
    <nav
      aria-label="Legal and support"
      className="mx-auto flex w-full max-w-[430px] items-center justify-center gap-4 px-4 pb-2 lg:hidden"
    >
      <SecondaryNavList />
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPhonePortrait = usePhonePortrait();
  /**
   * Phone-portrait Home and Map are full-bleed immersive surfaces. Extra
   * in-flow chrome (`min-h-screen` / `pb-24` / footers) makes the document
   * taller than the visual viewport; with `viewport-fit=cover`, that pushes
   * `position:fixed; bottom:0` nav under the browser chrome. Trim to nav
   * clearance only — same pattern Home already used.
   */
  const isPhonePortraitImmersive =
    isPhonePortrait && (pathname === "/" || pathname === "/map");
  const mainBottomClass = isPhonePortraitImmersive
    ? "pb-[calc(4.25rem+env(safe-area-inset-bottom,0.5rem))]"
    : "max-lg:pb-24 lg:pb-0";
  const shellClassName = isPhonePortraitImmersive
    ? "bg-karl-navy"
    : "min-h-screen bg-karl-navy";

  return (
    <ClearSkiesNavProvider>
      <div className={shellClassName}>
        <DesktopTopNav />
        <div className="flex flex-col">
          <main
            className={
              isPhonePortraitImmersive
                ? mainBottomClass
                : `flex-1 ${mainBottomClass}`
            }
          >
            {children}
          </main>
          {isPhonePortraitImmersive ? null : <ConditionsFooter />}
          {isPhonePortraitImmersive ? null : <MobileSecondaryLinks />}
          {isPhonePortraitImmersive ? null : <DevStatusFooter />}
          <BottomNav />
        </div>
      </div>
    </ClearSkiesNavProvider>
  );
}
