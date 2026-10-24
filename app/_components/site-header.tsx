import { Search } from "lucide-react";
import { Suspense } from "react";
import { LoginLink } from "./login-link";
import { Logo } from "./logo";
import { MobileMenu, SiteNav, SiteNavLinks } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-default bg-bg-surface">
      <div className="mx-auto flex h-18 max-w-360 items-center justify-between gap-3 px-4 sm:px-8 lg:px-20">
        <div className="flex items-center gap-6">
          <Logo className="text-text-primary" />
          <Suspense fallback={<SiteNavLinks pathname={null} />}>
            <SiteNav />
          </Suspense>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <label htmlFor="site-search" className="sr-only">
              Tìm kiếm thuật toán
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-text-muted"
            />
            <input
              id="site-search"
              type="search"
              placeholder="Tìm kiếm thuật toán..."
              className="h-10 w-56 rounded-lg border border-border-strong bg-bg-surface pr-3 pl-9 text-sm text-text-primary outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent-default xl:w-80"
            />
          </div>
          <button
            type="button"
            aria-label="Tìm kiếm thuật toán"
            className="flex size-10 items-center justify-center rounded-lg border border-border-strong bg-bg-surface text-text-muted transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default sm:hidden"
          >
            <Search aria-hidden="true" className="size-4" />
          </button>
          <LoginLink className="hidden h-9.25 lg:inline-flex" />
          <Suspense>
            <MobileMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
