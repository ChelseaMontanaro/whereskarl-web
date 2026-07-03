"use client";

import type { ReactNode } from "react";

import { ConditionsFooter } from "@/components/layout/ConditionsFooter";
import { DesktopNavDrawer } from "@/components/layout/DesktopNavDrawer";
import { DevStatusFooter } from "@/components/layout/DevStatusFooter";
import {
  PrimaryNavList,
  SecondaryNavList,
} from "@/components/layout/NavLinks";

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-karl-navy-soft/95 backdrop-blur-md lg:hidden"
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
  return (
    <div className="min-h-screen bg-karl-navy">
      <DesktopNavDrawer />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        <ConditionsFooter />
        <MobileSecondaryLinks />
        <DevStatusFooter />
        <BottomNav />
      </div>
    </div>
  );
}
