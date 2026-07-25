import type { NextConfig } from "next";

import { PUBLIC_ENV_VARS } from "@/lib/env/publicEnv";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "snhitxyrhse7o7xm.public.blob.vercel-storage.com",
        port: "",
        pathname: "/hero/**",
        search: "",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

if (process.env.VERCEL_ENV === "production" && !process.env[PUBLIC_ENV_VARS.apiUrl]) {
  throw new Error(
    `${PUBLIC_ENV_VARS.apiUrl} must be configured for production deployments.`,
  );
}

export default nextConfig;
