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
  pair?: readonly [string, string],
): string {
  const href = `${getCategoryHref(categorySlug)}/compare`;
  if (!pair) {
    return href;
  }
  const query = new URLSearchParams({
    [COMPARISON_PARAMS.left]: pair[0],
    [COMPARISON_PARAMS.right]: pair[1],
  });
  return `${href}?${query.toString()}`;
}
