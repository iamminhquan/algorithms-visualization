/**
 * Danh mục hiển thị ở trang chủ và footer.
 *
 * `slug`: Trùng với `categories.slug` trong DB khi danh mục đã được seed.
 * `href`: Đường dẫn tới trang danh mục.
 */
export interface ICategory {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly href: string;
}

export const CATEGORIES = [
  {
    slug: "sap-xep",
    name: "Thuật toán sắp xếp",
    description:
      "Xem các thuật toán sắp xếp chạy từng bước: so sánh, hoán đổi và đặt phần tử vào đúng vị trí.",
    href: "/sap-xep",
  },
  {
    slug: "cau-truc-du-lieu",
    name: "Cấu trúc dữ liệu",
    description:
      "Mô phỏng tương tác cách danh sách liên kết, stack, queue và array lưu trữ và sắp xếp lại dữ liệu.",
    href: "/cau-truc-du-lieu",
  },
  {
    slug: "tim-kiem",
    name: "Thuật toán tìm kiếm",
    description:
      "Theo dõi tìm kiếm tuyến tính và nhị phân truy tìm giá trị mục tiêu qua từng phép so sánh.",
    href: "/tim-kiem",
  },
  {
    slug: "khai-niem-cot-loi",
    name: "Khái niệm cốt lõi",
    description:
      "Đi qua các ý tưởng nền tảng: lời gọi đệ quy rẽ nhánh và quy hoạch động tái sử dụng kết quả.",
    href: "/khai-niem-cot-loi",
  },
] as const satisfies readonly ICategory[];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
