import Image from "next/image";

import { KARL_LOGO_SRC } from "@/lib/brand/karlLogo";

type KarlLogoProps = {
  className?: string;
};

export function KarlLogo({ className = "h-8 w-8" }: KarlLogoProps) {
  return (
    <Image
      src={KARL_LOGO_SRC}
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      className={`${className} object-contain`}
      priority
    />
  );
}
