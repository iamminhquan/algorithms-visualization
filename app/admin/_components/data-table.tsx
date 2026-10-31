import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export const TABLE_CELL_CLASS_NAME = "px-4 py-3 align-middle";

export const TABLE_ROW_CLASS_NAME = "transition-colors hover:bg-bg-subtle/50";

export interface ITableColumn {
  readonly label: string;
  readonly align?: "left" | "right";
  readonly isLabelHidden?: boolean;
}

type DataTableProps = {
  columns: readonly ITableColumn[];
  rowCount: number;
  itemLabel: string;
  searchPlaceholder: string;
  filters?: ReactNode;
  emptyMessage: string;
  children: ReactNode;
};

export function DataTable({
  columns,
  rowCount,
  itemLabel,
  searchPlaceholder,
  filters,
  emptyMessage,
  children,
}: DataTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
      <div className="flex flex-col gap-3 border-b border-border-default p-4 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-border-strong bg-bg-surface pr-3 pl-9 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          />
        </div>
        {filters && (
          <div className="flex flex-wrap gap-2 sm:ml-auto">{filters}</div>
        )}
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-200 text-left text-sm">
          <thead className="bg-bg-subtle/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cn(
                    "h-10 px-4 text-xs font-medium whitespace-nowrap text-text-secondary",
                    column.align === "right" && "text-right",
                  )}
                >
                  {column.isLabelHidden ? (
                    <span className="sr-only">{column.label}</span>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rowCount === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14">
                  <div className="flex flex-col items-center gap-2 text-center text-text-secondary">
                    <Inbox
                      aria-hidden="true"
                      className="size-6 text-text-muted"
                    />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border-default px-4 py-3 text-sm text-text-secondary">
        <p>
          {formatNumber(rowCount)} {itemLabel}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled>
            <ChevronLeft aria-hidden="true" />
            Trước
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Sau
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
