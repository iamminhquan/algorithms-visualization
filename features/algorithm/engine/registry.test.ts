import { describe, expect, test } from "bun:test";
import { interchangeSort } from "./algorithms/interchange-sort";
import { algorithms, getAlgorithm } from "./registry";

describe("registry", () => {
  test("getAlgorithm finds interchange sort", () => {
    expect(getAlgorithm("sap-xep-doi-cho-truc-tiep")).toBe(interchangeSort);
  });

  test("getAlgorithm returns undefined for unknown slug", () => {
    expect(getAlgorithm("khong-co")).toBeUndefined();
  });

  test("slugs are unique and match db format", () => {
    const slugs = algorithms.map((a) => a.slug);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
