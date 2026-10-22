import Link from "next/link";
import { Fragment } from "react";

/**
 * Một mục trong breadcrumb.
 *
 * `href`: Bỏ trống ở mục cuối, tức trang hiện tại.
 */
export interface IBreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

type BreadcrumbProps = {
  items: readonly IBreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Đường dẫn">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {items.map((item, index) => (
          <Fragment key={item.href ?? item.label}>
            {index > 0 && (
              <li aria-hidden="true" className="text-text-muted">
                /
              </li>
            )}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text-primary">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
