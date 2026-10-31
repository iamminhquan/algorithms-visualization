import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const VARIANT_CLASS_NAMES = {
  primary: "bg-accent-default text-accent-on hover:bg-accent-hover",
  secondary:
    "border border-border-strong bg-bg-surface text-text-primary hover:bg-bg-subtle",
  ghost: "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
  danger: "bg-danger-default text-danger-on hover:bg-danger-hover",
} as const;

const SIZE_CLASS_NAMES = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-9 gap-2 px-4 text-sm",
  icon: "size-8",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASS_NAMES;
export type ButtonSize = keyof typeof SIZE_CLASS_NAMES;

export function getButtonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    VARIANT_CLASS_NAMES[variant],
    SIZE_CLASS_NAMES[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName(variant, size, className)}
      {...props}
    />
  );
}
