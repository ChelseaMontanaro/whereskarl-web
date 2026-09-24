import Image from "next/image";

import { KARL_LOGO_SRC } from "@/lib/brand/karlLogo";

type KarlLogoProps = {
  className?: string;
  /** Render size in pixels. Defaults to 32 so existing surfaces stay unchanged. */
  size?: number;
  /**
   * Paint the source file directly. The mobile overlay header needs this so
   * iOS does not resample the face through the optimizer srcset.
   */
  unoptimized?: boolean;
};

export function KarlLogo({
  className = "h-8 w-8",
  size = 32,
  unoptimized = false,
}: KarlLogoProps) {
  return (
    <Image
      src={KARL_LOGO_SRC}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`${className} object-contain`}
      priority
      unoptimized={unoptimized}
    />
  );
}
