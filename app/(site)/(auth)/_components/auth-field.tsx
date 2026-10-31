import type { ComponentProps, ReactNode } from "react";

type AuthFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  /**
   * Nội dung nằm bên phải nhãn, ví dụ link "Quên mật khẩu?".
   */
  labelAside?: ReactNode;
};

export function AuthField({ id, label, labelAside, ...props }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        className="h-11 rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent-default"
        {...props}
      />
    </div>
  );
}
