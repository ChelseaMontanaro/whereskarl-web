import type { Metadata } from "next";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site/config";

export function createCanonicalUrl(path: string): string {
  if (path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path}`;
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: {
  title?: string;
  description?: string;
  path: string;
}): Metadata {
  const canonical = createCanonicalUrl(path);
  const pageTitle = title ?? SITE_NAME;
  const openGraphTitle =
    path === "/" ? `${SITE_NAME} | ${SITE_TAGLINE}` : `${pageTitle} | ${SITE_NAME}`;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url: canonical,
    },
    twitter: {
      title: openGraphTitle,
      description,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};
