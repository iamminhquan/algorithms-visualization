import Link from "next/link";
import { Fragment } from "react";
import { BreadcrumbMenu, type IBreadcrumbOption } from "./breadcrumb-menu";

export interface IBreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  readonly options?: readonly IBreadcrumbOption[];
}

type BreadcrumbProps = {
  items: readonly IBreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Đường dẫn">
      <ol className="relative flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {items.map((item, index) => (
          <Fragment key={item.href ?? item.label}>
            {index > 0 && (
              <li aria-hidden="true" className="text-text-muted">
                /
              </li>
            )}
            <li>
              <BreadcrumbItemContent item={item} />
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

type BreadcrumbItemContentProps = {
  item: IBreadcrumbItem;
};

function BreadcrumbItemContent({ item }: BreadcrumbItemContentProps) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="rounded-sm transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
      >
        {item.label}
      </Link>
    );
  }
  if (item.options && item.options.length > 1) {
    return <BreadcrumbMenu label={item.label} options={item.options} />;
  }
  return (
    <span aria-current="page" className="text-text-primary">
      {item.label}
    </span>
  );
}
