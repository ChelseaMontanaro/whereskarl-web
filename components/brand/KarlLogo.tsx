import Image from "next/image";

const KARL_LOGO_SRC = "/brand/wheres-karl-logo@2x.png";

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
