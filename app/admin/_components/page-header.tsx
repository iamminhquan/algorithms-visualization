import type { ReactNode } from "react";
import { Breadcrumb, type IBreadcrumbItem } from "@/components/ui/breadcrumb";
import { ADMIN_ROUTES } from "./admin-routes";
import { SampleDataBadge } from "./sample-data-badge";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: readonly IBreadcrumbItem[];
  actions?: ReactNode;
  isSampleData?: boolean;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  isSampleData = false,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {breadcrumb && (
          <Breadcrumb
            items={[
              { label: "Quản trị", href: ADMIN_ROUTES.overview },
              ...breadcrumb,
            ]}
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {isSampleData && <SampleDataBadge />}
        </div>
        {description && (
          <p className="max-w-160 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </header>
  );
}
