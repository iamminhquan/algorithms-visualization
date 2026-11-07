import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const TONE_CLASS_NAMES = {
  neutral: "text-text-secondary",
  accent: "text-accent-text",
  success: "text-success-text",
  warning: "text-warning-text",
  danger: "text-danger-text",
} as const;

export type BadgeTone = keyof typeof TONE_CLASS_NAMES;

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        TONE_CLASS_NAMES[tone],
        className,
      )}
      {...props}
    />
  );
}
