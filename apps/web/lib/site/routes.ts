import type { MetadataRoute } from "next";

export type PublicSitemapRoute = {
  path: "/" | "/map" | "/privacy" | "/support";
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

export const PUBLIC_SITEMAP_ROUTES: PublicSitemapRoute[] = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/map", changeFrequency: "hourly", priority: 0.9 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/support", changeFrequency: "monthly", priority: 0.3 },
];
