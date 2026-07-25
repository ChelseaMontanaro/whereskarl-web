"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isPrimaryNavActive,
  isSecondaryNavActive,
  primaryNavItems,
  secondaryNavItems,
  type PrimaryNavItem,
  type SecondaryNavItem,
} from "@/lib/navigation";

export function NavIcon({ name }: { name: PrimaryNavItem["href"] }) {
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

function primaryNavClassName(
  isActive: boolean,
  layout: "bottom" | "top",
): string {
  const base =
    "rounded-full text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karl-gold";

  if (layout === "bottom") {
    return `${base} flex flex-1 flex-col items-center gap-1 px-3 py-2 text-xs ${
      isActive
        ? "text-karl-gold"
        : "text-white/55 hover:text-white/80"
    }`;
  }

  return `${base} px-3.5 py-1.5 ${
    isActive
      ? "border border-karl-gold/25 bg-karl-gold/12 text-karl-gold"
      : "text-white/72 hover:bg-white/6 hover:text-white"
  }`;
}

export function PrimaryNavLink({
  item,
  layout,
}: {
  item: PrimaryNavItem;
  layout: "bottom" | "top";
}) {
  const pathname = usePathname();
  const isActive = isPrimaryNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={primaryNavClassName(isActive, layout)}
    >
      {layout === "bottom" ? (
        <>
          <NavIcon name={item.href} />
          <span>{item.shortLabel}</span>
        </>
      ) : (
        <span>{item.label}</span>
      )}
    </Link>
  );
}

export function SecondaryNavLink({ item }: { item: SecondaryNavItem }) {
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

export function PrimaryNavList({ layout }: { layout: "bottom" | "top" }) {
  return (
    <>
      {primaryNavItems.map((item) => (
        <PrimaryNavLink key={item.href} item={item} layout={layout} />
      ))}
    </>
  );
}

export function SecondaryNavList() {
  return (
    <>
      {secondaryNavItems.map((item) => (
        <SecondaryNavLink key={item.href} item={item} />
      ))}
    </>
  );
}
