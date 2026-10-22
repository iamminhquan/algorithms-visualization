import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryGrid } from "@/features/catalog/components/category-grid";
import { HomeHero } from "./_components/home-hero";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center gap-12 px-4 pt-22 pb-28 sm:px-8 lg:px-20">
        <HomeHero />
        <CategoryGrid />
      </main>
      <SiteFooter />
    </>
  );
}
