import type { ReactNode } from "react";

type RowActionsProps = {
  children: ReactNode;
};

export function RowActions({ children }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">{children}</div>
  );
}
