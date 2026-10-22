import { describe, expect, test } from "bun:test";
import { seedAlgorithms, seedCategories } from "@/db/seed-data";
import { listAlgorithmInfo } from "@/features/catalog/catalog";

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
});
