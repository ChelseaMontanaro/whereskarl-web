import { notFound } from "next/navigation";

/**
 * Development-only routes under /dev/*.
 * Unavailable in production builds (including Vercel production).
 */
export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return children;
}
