export type PrimaryNavItem = {
  href: "/" | "/map" | "/favorites" | "/settings";
  label: string;
  shortLabel: string;
};

export type SecondaryNavItem = {
  href: "/privacy" | "/support";
  label: string;
};

export const primaryNavItems: PrimaryNavItem[] = [
  { href: "/", label: "Home", shortLabel: "Home" },
  { href: "/map", label: "Map", shortLabel: "Map" },
  { href: "/favorites", label: "Favorites", shortLabel: "Favorites" },
  { href: "/settings", label: "Settings", shortLabel: "Settings" },
];

export const secondaryNavItems: SecondaryNavItem[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/support", label: "Support" },
];

export function isPrimaryNavActive(pathname: string, href: PrimaryNavItem["href"]): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isSecondaryNavActive(
  pathname: string,
  href: SecondaryNavItem["href"],
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
