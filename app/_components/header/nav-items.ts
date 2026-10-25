import type { CategorySlug } from "@/features/catalog/categories";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";

/**
 * Một mục trên thanh điều hướng.
 *
 * `href`: Link tới một phần của trang (có `#`) không bao giờ được đánh dấu là trang hiện tại,
 *   vì `usePathname()` không chứa phần `#`.
 * `matchPrefix`: Coi mọi đường dẫn con (vd: `/visualization/sorting`) cũng là đang ở mục này.
 */
export interface INavItem {
  readonly label: string;
  readonly href: string;
  readonly matchPrefix?: boolean;
}

export const NAV_ITEMS: readonly INavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Mô phỏng", href: VISUALIZATION_PATH, matchPrefix: true },
  { label: "Học tập", href: "/learn", matchPrefix: true },
  { label: "Giới thiệu", href: "/#about" },
];

/**
 * Danh mục kèm thuật toán, đã rút gọn còn đúng những trường header cần để truyền xuống client.
 *
 * `tagline`: Mô tả ngắn vừa một dòng trong menu, khác `description` dài trên card trang chủ.
 * `isComingSoon`: Danh mục chưa có thuật toán nào chạy được.
 */
export interface IHeaderCategory {
  readonly slug: CategorySlug;
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

export const CATEGORY_TAGLINES = {
  sorting: "So sánh và hoán đổi từng bước",
  "data-structures": "Stack, queue, danh sách liên kết",
  searching: "Tìm kiếm tuyến tính và nhị phân",
  "core-concepts": "Đệ quy và quy hoạch động",
  graphs: "BFS, DFS và đường đi ngắn nhất",
  trees: "Cây tìm kiếm và cây cân bằng",
} satisfies Record<CategorySlug, string>;

/**
 * Mục có đang là trang hiện tại không.
 *
 * @param pathname `null` khi chưa biết trang hiện tại (fallback của Suspense), lúc đó luôn là `false`.
 */
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
