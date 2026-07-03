"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ConditionsFooter } from "@/components/layout/ConditionsFooter";
import { DevStatusFooter } from "@/components/layout/DevStatusFooter";
import {
  isPrimaryNavActive,
  isSecondaryNavActive,
  primaryNavItems,
  secondaryNavItems,
  type PrimaryNavItem,
  type SecondaryNavItem,
} from "@/lib/navigation";

function NavIcon({ name }: { name: PrimaryNavItem["href"] }) {
  const common = "h-5 w-5";

  switch (name) {
    case "/":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="currentColor">
          <path d="M12 3.2 3 11v9.8h6.5V15H14.5v5.8H21V11L12 3.2Z" />
        </svg>
      );
    case "/map":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="currentColor">
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 2.2 6 2V17.8l-6-2V6.2Z" />
        </svg>
      );
    case "/favorites":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="currentColor">
          <path d="M12 20.3 4.5 12.8a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0L12 7.3l1-1a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5L12 20.3Z" />
        </svg>
      );
    case "/settings":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="currentColor">
          <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm8.1 3.6 1.6 1.2-1.5 2.6 1.8 1-1 1.7-2.1-.6-.9 1.9-2.2-.3-.3 2.2-.9-1.9-2.1.6-1-1.7 1.8-1-1.5-2.6 1.6-1.2-.3-2.2 2.2-.3.3-2.2.9 1.9 2.1-.6 1 1.7-1.8 1 1.5 2.6-1.6 1.2.3 2.2-2.2.3-.3 2.2Z" />
        </svg>
      );
  }
}

function primaryNavClassName(isActive: boolean, layout: "sidebar" | "bottom"): string {
  const base =
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karl-gold";

  if (layout === "bottom") {
    return `${base} flex-1 flex-col gap-1 py-2 text-xs ${
      isActive
        ? "text-karl-gold"
        : "text-white/55 hover:text-white/80"
    }`;
  }

  return `${base} ${
    isActive
      ? "bg-karl-navy-glass text-karl-gold border border-karl-gold/25"
      : "text-white/70 hover:bg-karl-navy-glass/70 hover:text-white"
  }`;
}

function PrimaryNavLink({
  item,
  layout,
}: {
  item: PrimaryNavItem;
  layout: "sidebar" | "bottom";
}) {
  const pathname = usePathname();
  const isActive = isPrimaryNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={primaryNavClassName(isActive, layout)}
    >
      <NavIcon name={item.href} />
      <span>{layout === "bottom" ? item.shortLabel : item.label}</span>
    </Link>
  );
}

function SecondaryNavLink({ item }: { item: SecondaryNavItem }) {
  const pathname = usePathname();
  const isActive = isSecondaryNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karl-gold ${
        isActive ? "text-karl-gold" : "text-white/45 hover:text-white/70"
      }`}
    >
      {item.label}
    </Link>
  );
}

function SidebarNav() {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-white/10 lg:bg-karl-navy-soft/70 lg:px-5 lg:py-8">
      <div className="mb-8 space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
          Where&apos;s Karl?
        </p>
        <p className="text-sm text-white/60">Track Karl across the Bay</p>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-1">
        {primaryNavItems.map((item) => (
          <PrimaryNavLink key={item.href} item={item} layout="sidebar" />
        ))}
      </nav>

      <nav
        aria-label="Legal and support"
        className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-6"
      >
        {secondaryNavItems.map((item) => (
          <SecondaryNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-karl-navy-soft/95 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-[430px] items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {primaryNavItems.map((item) => (
          <PrimaryNavLink key={item.href} item={item} layout="bottom" />
        ))}
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
      {secondaryNavItems.map((item) => (
        <SecondaryNavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-karl-navy">
      <SidebarNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        <ConditionsFooter />
        <MobileSecondaryLinks />
        <DevStatusFooter />
        <BottomNav />
      </div>
    </div>
  );
}
