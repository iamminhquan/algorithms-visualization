import {
  BookOpen,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
  School,
  Users,
  Workflow,
} from "lucide-react";

export const ADMIN_ROUTES = {
  overview: "/admin",
  categories: "/admin/categories",
  algorithms: "/admin/algorithms",
  newAlgorithm: "/admin/algorithms/new",
  lessons: "/admin/lessons",
  classes: "/admin/classes",
  users: "/admin/users",
} as const;

export function getAdminAlgorithmHref(algorithmSlug: string): string {
  return `${ADMIN_ROUTES.algorithms}/${algorithmSlug}`;
}

export interface IAdminNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

export interface IAdminNavGroup {
  readonly label: string;
  readonly items: readonly IAdminNavItem[];
}

export const ADMIN_NAV_GROUPS: readonly IAdminNavGroup[] = [
  {
    label: "Chung",
    items: [
      {
        label: "Tổng quan",
        href: ADMIN_ROUTES.overview,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { label: "Danh mục", href: ADMIN_ROUTES.categories, icon: FolderTree },
      { label: "Thuật toán", href: ADMIN_ROUTES.algorithms, icon: Workflow },
      { label: "Bài học", href: ADMIN_ROUTES.lessons, icon: BookOpen },
    ],
  },
  {
    label: "Đào tạo",
    items: [
      { label: "Lớp học", href: ADMIN_ROUTES.classes, icon: School },
      { label: "Người dùng", href: ADMIN_ROUTES.users, icon: Users },
    ],
  },
];

export function isActiveAdminItem(
  href: string,
  pathname: string | null,
): boolean {
  if (pathname === null) {
    return false;
  }
  if (href === ADMIN_ROUTES.overview) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
