import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const CONTROL_CLASS_NAME =
  "w-full rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default read-only:bg-bg-subtle read-only:text-text-secondary";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input className={cn("h-9", CONTROL_CLASS_NAME, className)} {...props} />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn("min-h-24 py-2 leading-6", CONTROL_CLASS_NAME, className)}
      {...props}
    />
  );
}
