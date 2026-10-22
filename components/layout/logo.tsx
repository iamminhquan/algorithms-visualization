import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_NAME } from "@/lib/site";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} – Trang chủ`}
      className={cn(
        "inline-flex h-10 items-center rounded-md px-4.5 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        className,
      )}
    >
      LOGO
    </Link>
  );
}
