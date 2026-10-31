import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "rounded-sm font-medium text-accent-text transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        className,
      )}
      {...props}
    />
  );
}
