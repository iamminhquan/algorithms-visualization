import { Suspense } from "react";
import { getCategoryCatalog } from "@/features/catalog/queries";
import { getAlgorithmHref, getCategoryHref } from "@/features/catalog/routes";
import { Logo } from "../logo";
import { CommandPalette } from "./command-palette";
import { HeaderShell } from "./header-shell";
import { CurrentMobileMenu, MobileMenu } from "./mobile-menu";
import type { IHeaderCategory } from "./nav-items";
import { CurrentNavLinks, NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

async function getHeaderCategories(): Promise<IHeaderCategory[]> {
  const catalog = await getCategoryCatalog().catch((error: unknown) => {
    console.error("Không đọc được danh mục cho header", error);
    return [];
  });
  return catalog.map((category) => ({
    slug: category.slug,
    name: category.name,
    tagline: category.description ?? "",
    href: getCategoryHref(category.slug),
    isComingSoon: category.algorithms.length === 0,
    algorithms: category.algorithms.map((algorithm) => ({
      name: algorithm.name,
      href: getAlgorithmHref(category.slug, algorithm.slug),
    })),
  }));
}

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
          <UserMenu className="ml-2 hidden h-9 md:inline-flex" />
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
