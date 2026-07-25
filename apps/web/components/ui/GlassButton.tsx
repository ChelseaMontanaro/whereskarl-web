import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type GlassButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
} & Omit<ComponentProps<"button">, "className">;

export function GlassButton({
  children,
  className = "",
  href,
  type = "button",
  ...props
}: GlassButtonProps) {
  const styles =
    "inline-flex items-center justify-center rounded-full border border-karl-gold/30 bg-karl-navy-glass/80 px-4 py-2 text-sm font-medium text-karl-gold transition-colors motion-reduce:transition-none hover:border-karl-gold/50 hover:bg-karl-navy-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karl-gold";

  if (href) {
    return (
      <Link href={href} className={`${styles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={`${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
