import {
  FolderPlus,
  FolderTree,
  type LucideIcon,
  Plus,
  School,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { isCategorySlug } from "@/features/catalog/categories";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import {
  getAlgorithmCatalog,
  getCategoryCatalog,
} from "@/features/catalog/queries";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber } from "@/lib/format";
import {
  ADMIN_ROUTES,
  getAdminAlgorithmHref,
} from "./_components/admin-routes";
import { PageHeader } from "./_components/page-header";
import { Panel } from "./_components/panel";
import { SAMPLE_CLASSES, SAMPLE_USERS } from "./_components/sample-data";
import { SampleDataBadge } from "./_components/sample-data-badge";
import { StatCard } from "./_components/stat-card";

export const metadata: Metadata = {
  title: "Tổng quan",
};

const RECENT_ALGORITHM_LIMIT = 5;

interface IQuickAction {
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

const QUICK_ACTIONS: readonly IQuickAction[] = [
  {
    label: "Thêm thuật toán",
    description: "Khai báo thông tin và mã nguồn",
    href: ADMIN_ROUTES.newAlgorithm,
    icon: Plus,
  },
  {
    label: "Quản lý danh mục",
    description: "Sửa tên, mô tả, đường dẫn",
    href: ADMIN_ROUTES.categories,
    icon: FolderPlus,
  },
  {
    label: "Mở lớp học",
    description: "Tạo lớp và giao bài học",
    href: ADMIN_ROUTES.classes,
    icon: School,
  },
  {
    label: "Mời người dùng",
    description: "Thêm giáo viên hoặc học viên",
    href: ADMIN_ROUTES.users,
    icon: UserPlus,
  },
];

const LINK_FOCUS_CLASS_NAME =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";

export default async function AdminOverviewPage() {
  const [algorithms, categories] = await Promise.all([
    getAlgorithmCatalog(),
    getCategoryCatalog(),
  ]);
  const activeCategoryCount = categories.filter(
    (category) => category.algorithms.length > 0,
  ).length;
  const ongoingClasses = SAMPLE_CLASSES.filter(
    (sampleClass) => sampleClass.status === "ongoing",
  );
  const activeUserCount = SAMPLE_USERS.filter(
    (user) => user.status === "active",
  ).length;
  const categoriesBySize = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      algorithmCount: category.algorithms.length,
    }))
    .sort((a, b) => b.algorithmCount - a.algorithmCount);
  const largestCategorySize = Math.max(
    0,
    ...categoriesBySize.map((category) => category.algorithmCount),
  );
  const recentAlgorithms = [...algorithms]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, RECENT_ALGORITHM_LIMIT);

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Tình hình nội dung mô phỏng, lớp học và người dùng của hệ thống."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Thuật toán"
          value={algorithms.length}
          hint={`Thuộc ${formatNumber(activeCategoryCount)} danh mục`}
          icon={Workflow}
        />
        <StatCard
          label="Danh mục"
          value={categories.length}
          hint={`${formatNumber(categories.length - activeCategoryCount)} danh mục chưa có thuật toán`}
          icon={FolderTree}
        />
        <StatCard
          label="Người dùng"
          value={SAMPLE_USERS.length}
          hint={`${formatNumber(activeUserCount)} đang hoạt động`}
          icon={Users}
          isSampleData
        />
        <StatCard
          label="Lớp học"
          value={SAMPLE_CLASSES.length}
          hint={`${formatNumber(ongoingClasses.length)} lớp đang diễn ra`}
          icon={School}
          isSampleData
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Thuật toán theo danh mục"
          description="Số thuật toán đã có trình mô phỏng trong từng danh mục."
          className="lg:col-span-2"
        >
          <ul className="flex flex-col gap-4 px-5 py-5">
            {categoriesBySize.map((category) => (
              <li
                key={category.slug}
                className="grid grid-cols-[minmax(0,12rem)_1fr_2rem] items-center gap-4"
              >
                <span className="flex min-w-0 items-center gap-2.5 text-sm text-text-primary">
                  {isCategorySlug(category.slug) && (
                    <CategoryIcon slug={category.slug} size="sm" />
                  )}
                  <span className="truncate">{category.name}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="h-2.5 overflow-hidden rounded-r-sm bg-bg-subtle"
                >
                  {category.algorithmCount > 0 && (
                    <span
                      className="block h-full rounded-r-sm bg-accent-default"
                      style={{
                        width: `${(category.algorithmCount / largestCategorySize) * 100}%`,
                      }}
                    />
                  )}
                </span>
                <span className="text-right text-sm font-medium text-text-primary tabular-nums">
                  {formatNumber(category.algorithmCount)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Lối tắt">
          <ul className="flex flex-col p-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.label}>
                  <Link
                    href={action.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-bg-subtle",
                      LINK_FOCUS_CLASS_NAME,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent-text"
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary">
                        {action.label}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {action.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Thuật toán cập nhật gần đây"
          className="lg:col-span-2"
          actions={
            <Link
              href={ADMIN_ROUTES.algorithms}
              className={cn(
                "rounded-sm text-sm font-medium text-accent-text hover:text-accent-hover",
                LINK_FOCUS_CLASS_NAME,
              )}
            >
              Xem tất cả
            </Link>
          }
        >
          {recentAlgorithms.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-text-secondary">
              Chưa có thuật toán nào.
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {recentAlgorithms.map((algorithm) => (
                <li key={algorithm.id}>
                  <Link
                    href={getAdminAlgorithmHref(algorithm.slug)}
                    className={cn(
                      "flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-bg-subtle/50",
                      LINK_FOCUS_CLASS_NAME,
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-text-primary">
                        {algorithm.name}
                      </span>
                      <span className="truncate text-xs text-text-secondary">
                        {algorithm.category.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-text-muted tabular-nums">
                      {formatDate(algorithm.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Lớp đang diễn ra" actions={<SampleDataBadge />}>
          <ul className="divide-y divide-border-default">
            {ongoingClasses.map((sampleClass) => (
              <li
                key={sampleClass.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-text-primary">
                    {sampleClass.name}
                  </span>
                  <span className="truncate text-xs text-text-secondary">
                    {sampleClass.teacherName}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-text-muted tabular-nums">
                  {formatNumber(sampleClass.studentCount)} học viên
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
