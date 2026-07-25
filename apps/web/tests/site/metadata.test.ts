import { describe, expect, it } from "vitest";

import {
  createCanonicalUrl,
  createPageMetadata,
  rootMetadata,
} from "@/lib/site/metadata";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site/config";

describe("site metadata", () => {
  it("uses the production domain as metadata base", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
  });

  it("includes the core site title and description", () => {
    expect(rootMetadata.title).toMatchObject({
      default: expect.stringContaining(SITE_NAME),
    });
    expect(rootMetadata.description).toBe(DEFAULT_DESCRIPTION);
  });

  it("avoids social image references until CDN assets exist", () => {
    expect(rootMetadata.openGraph?.images).toBeUndefined();
    expect(rootMetadata.twitter?.images).toBeUndefined();
    expect(JSON.stringify(rootMetadata.twitter)).toContain('"summary"');
  });

  it("builds canonical URLs for public routes", () => {
    expect(createCanonicalUrl("/")).toBe(SITE_URL);
    expect(createCanonicalUrl("/privacy")).toBe(`${SITE_URL}/privacy`);
  });

  it("creates route metadata with canonical and social fallbacks", () => {
    const metadata = createPageMetadata({
      title: "Map",
      path: "/map",
    });

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/map`);
    expect(metadata.openGraph?.url).toBe(`${SITE_URL}/map`);
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.description).toBe(DEFAULT_DESCRIPTION);
  });
});
