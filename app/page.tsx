import { CategoryGrid } from "@/features/catalog/components/category-grid";
import { HomeExplainer } from "./_components/home-explainer";
import { HomeHero } from "./_components/home-hero";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-12 px-4 pt-10 pb-28 sm:pt-14 sm:px-8 lg:px-20">
      <HomeHero />
      <CategoryGrid />
      <HomeExplainer />
    </main>
  );
}
