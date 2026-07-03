import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";
import { ConditionsStatusProvider } from "@/components/providers/ConditionsStatusProvider";
import { PublicEnvProvider } from "@/components/providers/PublicEnvProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { rootMetadata } from "@/lib/site/metadata";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-karl-navy text-foreground"
        data-api-base-url={apiBaseUrl}
      >
        <PublicEnvProvider apiBaseUrl={apiBaseUrl}>
          <QueryProvider>
            <ConditionsStatusProvider>
              <AppShell>{children}</AppShell>
            </ConditionsStatusProvider>
          </QueryProvider>
        </PublicEnvProvider>
      </body>
    </html>
  );
}
