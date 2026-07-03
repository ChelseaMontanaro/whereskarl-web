import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { SITE_URL } from "@/lib/site/config";
import { PUBLIC_SITEMAP_ROUTES } from "@/lib/site/routes";

describe("sitemap and robots", () => {
  it("includes the expected public routes on the production domain", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(PUBLIC_SITEMAP_ROUTES.length);
    expect(entries.map((entry) => entry.url)).toEqual([
      SITE_URL,
      `${SITE_URL}/map`,
      `${SITE_URL}/privacy`,
      `${SITE_URL}/support`,
    ]);
  });

  it("points robots to the production sitemap", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});
