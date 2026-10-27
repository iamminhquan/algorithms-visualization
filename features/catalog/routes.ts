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
