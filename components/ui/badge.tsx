import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const TONE_CLASS_NAMES = {
  neutral: "bg-bg-subtle text-text-secondary",
  accent: "bg-accent-subtle text-accent-text",
  success: "bg-success-subtle text-success-text",
  warning: "bg-warning-subtle text-warning-text",
  danger: "bg-danger-subtle text-danger-text",
} as const;

export type BadgeTone = keyof typeof TONE_CLASS_NAMES;

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        TONE_CLASS_NAMES[tone],
        className,
      )}
      {...props}
    />
  );
}
