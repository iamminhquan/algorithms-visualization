import { VISUALIZATION_PATH } from "@/features/catalog/routes";

export interface INavItem {
  readonly label: string;
  readonly href: string;
  readonly matchPrefix?: boolean;
}

export const NAV_ITEMS: readonly INavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Mô phỏng", href: VISUALIZATION_PATH, matchPrefix: true },
  { label: "Học tập", href: "/learning", matchPrefix: true },
  { label: "Giới thiệu", href: "/#about" },
];

export interface IHeaderCategory {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly href: string;
  readonly isComingSoon: boolean;
  readonly algorithms: readonly IHeaderAlgorithm[];
}

export interface IHeaderAlgorithm {
  readonly name: string;
  readonly href: string;
}

export function isCurrentPage(item: INavItem, pathname: string | null) {
  if (pathname === null || item.href.includes("#")) {
    return false;
  }
  return item.matchPrefix
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href;
}

export const FOCUS_RING_CLASS_NAME =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";
