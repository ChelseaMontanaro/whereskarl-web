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
      <div className="mx-auto flex max-w-[430px] items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
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
  const isPhonePortraitHome = pathname === "/" && isPhonePortrait;
  const mainBottomClass = isPhonePortraitHome
    ? "pb-[calc(4.25rem+env(safe-area-inset-bottom,0.5rem))]"
    : "max-lg:pb-24 lg:pb-0";

  return (
    <ClearSkiesNavProvider>
      <div className="min-h-screen bg-karl-navy">
        <DesktopTopNav />
        <div className="flex flex-col">
          <main className={`flex-1 ${mainBottomClass}`}>{children}</main>
          {isPhonePortraitHome ? null : <ConditionsFooter />}
          {isPhonePortraitHome ? null : <MobileSecondaryLinks />}
          {isPhonePortraitHome ? null : <DevStatusFooter />}
          <BottomNav />
        </div>
      </div>
    </ClearSkiesNavProvider>
  );
}
