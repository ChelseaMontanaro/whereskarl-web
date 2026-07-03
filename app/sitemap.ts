import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site/config";
import { PUBLIC_SITEMAP_ROUTES } from "@/lib/site/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ROUTES.map((route) => ({
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
