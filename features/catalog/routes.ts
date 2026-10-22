export const VISUALIZATION_PATH = "/visualization";

/**
 * Đường dẫn tới trang của một danh mục.
 *
 * @param categorySlug Slug trong bảng `categories`, ví dụ "sorting".
 */
export function getCategoryHref(categorySlug: string): string {
  return `${VISUALIZATION_PATH}/${categorySlug}`;
}

/**
 * Đường dẫn tới trang của một thuật toán, nằm dưới danh mục chứa nó.
 *
 * @param categorySlug Slug danh mục của thuật toán, ví dụ "sorting".
 * @param algorithmSlug Slug trong bảng `algorithms`, ví dụ "bubble-sort".
 */
export function getAlgorithmHref(
  categorySlug: string,
  algorithmSlug: string,
): string {
  return `${getCategoryHref(categorySlug)}/${algorithmSlug}`;
}
