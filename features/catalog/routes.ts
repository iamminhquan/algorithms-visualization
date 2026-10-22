export const VISUALIZATION_PATH = "/visualization";

/**
 * Đường dẫn tới trang của một danh mục hoặc một thuật toán. Hai loại dùng chung một segment
 * `[slug]`, nên slug danh mục và slug thuật toán không được trùng nhau.
 *
 * @param slug Slug trong bảng `categories` hoặc `algorithms`, ví dụ "sorting", "bubble-sort".
 */
export function getVisualizationHref(slug: string): string {
  return `${VISUALIZATION_PATH}/${slug}`;
}
