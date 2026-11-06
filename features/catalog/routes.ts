import { COMPARISON_PARAMS } from "@/engine/visualization";

export const VISUALIZATION_PATH = "/visualization";

export function getCategoryHref(categorySlug: string): string {
  return `${VISUALIZATION_PATH}/${categorySlug}`;
}

export function getAlgorithmHref(
  categorySlug: string,
  algorithmSlug: string,
): string {
  return `${getCategoryHref(categorySlug)}/${algorithmSlug}`;
}

export function getCompareHref(
  categorySlug: string,
  lanes?: readonly string[],
): string {
  const href = `${getCategoryHref(categorySlug)}/compare`;
  if (!lanes || lanes.length === 0) {
    return href;
  }
  const query = new URLSearchParams();
  COMPARISON_PARAMS.forEach((param, index) => {
    const slug = lanes[index];
    if (slug !== undefined) {
      query.set(param, slug);
    }
  });
  return `${href}?${query.toString()}`;
}
