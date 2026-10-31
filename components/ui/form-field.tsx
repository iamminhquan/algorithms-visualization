import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function getFieldHintId(fieldId: string): string {
  return `${fieldId}-hint`;
}

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-text-primary"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p id={getFieldHintId(htmlFor)} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
