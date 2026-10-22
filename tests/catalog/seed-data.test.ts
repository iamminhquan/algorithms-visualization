import { describe, expect, test } from "bun:test";
import { seedAlgorithms, seedCategories } from "@/db/seed-data";
import { listAlgorithmInfo } from "@/features/catalog/catalog";
import { CATEGORIES } from "@/features/catalog/categories";

describe("seed-data", () => {
  test("mỗi thuật toán trong registry có đúng một dòng seed và ngược lại", () => {
    const seededKeys = seedAlgorithms.map((algorithm) => algorithm.key).sort();
    const registeredKeys = listAlgorithmInfo()
      .map((metadata) => metadata.key)
      .sort();
    expect(seededKeys).toEqual(registeredKeys);
  });

  test("mỗi thuật toán thuộc một danh mục có trong seed", () => {
    const categorySlugs = seedCategories.map((category) => category.slug);
    for (const algorithm of seedAlgorithms) {
      expect(categorySlugs).toContain(algorithm.categorySlug);
    }
  });

  test("danh mục ở trang chủ khớp đúng với danh mục trong seed", () => {
    const seededSlugs = seedCategories.map((category) => category.slug).sort();
    const homeSlugs = CATEGORIES.map((category) => category.slug).sort();
    expect(homeSlugs).toEqual(seededSlugs);
  });

  test("slug danh mục và slug thuật toán không trùng nhau vì dùng chung /visualization/[slug]", () => {
    const slugs = [
      ...seedCategories.map((category) => category.slug),
      ...seedAlgorithms.map((algorithm) => algorithm.slug),
    ];
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
