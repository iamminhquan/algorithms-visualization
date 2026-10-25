import { Suspense } from "react";
import { CATEGORIES } from "@/features/catalog/categories";
import { getCategoryCatalog } from "@/features/catalog/queries";
import { getAlgorithmHref, getCategoryHref } from "@/features/catalog/routes";
import { Logo } from "../logo";
import { CommandPalette } from "./command-palette";
import { HeaderShell } from "./header-shell";
import { LoginLink } from "./login-link";
import { CurrentMobileMenu, MobileMenu } from "./mobile-menu";
import { CATEGORY_TAGLINES, type IHeaderCategory } from "./nav-items";
import { CurrentNavLinks, NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * Danh mục theo thứ tự của `CATEGORIES`, kèm thuật toán chạy được đọc từ DB (đã cache).
 * Header nằm trong root layout nên lỗi DB ở đây sẽ làm hỏng mọi trang, kể cả trang đăng nhập;
 * vì vậy khi DB lỗi header vẫn hiện danh mục, chỉ thiếu thuật toán và nhãn "Sắp ra mắt".
 */
async function getHeaderCategories(): Promise<IHeaderCategory[]> {
  const catalog = await getCategoryCatalog().catch((error: unknown) => {
    console.error("Không đọc được danh mục cho header", error);
    return null;
  });
  const algorithmsBySlug = new Map(
    catalog?.map((category) => [category.slug, category.algorithms]),
  );
  return CATEGORIES.map((category) => {
    const algorithms = algorithmsBySlug.get(category.slug) ?? [];
    return {
      slug: category.slug,
      name: category.name,
      tagline: CATEGORY_TAGLINES[category.slug],
      href: getCategoryHref(category.slug),
      isComingSoon: catalog !== null && algorithms.length === 0,
      algorithms: algorithms.map((algorithm) => ({
        name: algorithm.name,
        href: getAlgorithmHref(category.slug, algorithm.slug),
      })),
    };
  });
}

/*
 * Lề ngang và `max-w-310` trùng với lưới card bên dưới để mép logo và mép nút thẳng hàng với card.
 */
export async function SiteHeader() {
  const categories = await getHeaderCategories();

  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-310 items-center gap-6">
        <Logo showWordmark className="shrink-0 text-text-primary" />
        <Suspense
          fallback={<NavLinks categories={categories} pathname={null} />}
        >
          <CurrentNavLinks categories={categories} />
        </Suspense>
        <div className="ml-auto flex items-center gap-1">
          <CommandPalette categories={categories} />
          <ThemeToggle />
          <LoginLink className="ml-2 hidden h-9 md:inline-flex" />
          <Suspense
            fallback={<MobileMenu categories={categories} pathname={null} />}
          >
            <CurrentMobileMenu categories={categories} />
          </Suspense>
        </div>
      </div>
    </HeaderShell>
  );
}
