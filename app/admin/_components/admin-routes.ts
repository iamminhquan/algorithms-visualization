import {
  FolderTree,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  School,
  Users,
  Workflow,
} from "lucide-react";
import type { UserRole } from "@/db/schema";

export const ADMIN_ROUTES = {
  overview: "/admin",
  categories: "/admin/categories",
  algorithms: "/admin/algorithms",
  newAlgorithm: "/admin/algorithms/new",
  lessons: "/admin/lessons",
  classes: "/admin/classes",
  questions: "/admin/questions",
  users: "/admin/users",
} as const;

export function getAdminAlgorithmHref(algorithmSlug: string): string {
  return `${ADMIN_ROUTES.algorithms}/${algorithmSlug}`;
}

export interface IAdminNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly roles?: readonly UserRole[];
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
      {
        label: "Danh mục",
        href: ADMIN_ROUTES.categories,
        icon: FolderTree,
        roles: ["admin"],
      },
      {
        label: "Thuật toán",
        href: ADMIN_ROUTES.algorithms,
        icon: Workflow,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Đào tạo",
    items: [
      { label: "Lớp học", href: ADMIN_ROUTES.classes, icon: School },
      {
        label: "Ngân hàng câu hỏi",
        href: ADMIN_ROUTES.questions,
        icon: ListChecks,
      },
      { label: "Người dùng", href: ADMIN_ROUTES.users, icon: Users },
    ],
  },
];

export function getVisibleAdminNavGroups(
  role: UserRole | null,
): readonly IAdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((group) => {
    const items = group.items.filter((item) => {
      if (!item.roles) {
        return true;
      }
      if (role === null) {
        return false;
      }
      return item.roles.includes(role);
    });
    return { ...group, items };
  }).filter((group) => group.items.length > 0);
}

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
