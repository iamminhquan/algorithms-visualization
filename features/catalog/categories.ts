/**
 * Danh mục thuật toán. Trang chủ và footer đọc trực tiếp từ đây, còn `db/seed-data.ts` seed
 * chính danh sách này vào bảng `categories`, nên sửa tên/mô tả xong phải chạy lại `db:seed`.
 *
 * `slug`: Seed upsert theo slug, nên đổi slug sẽ tạo dòng mới thay vì sửa dòng cũ.
 */
export interface ICategory {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
}

export const CATEGORIES = [
  {
    slug: "sorting",
    name: "Thuật toán sắp xếp",
    description:
      "Xem các thuật toán sắp xếp chạy từng bước: so sánh, hoán đổi và đặt phần tử vào đúng vị trí.",
  },
  {
    slug: "data-structures",
    name: "Cấu trúc dữ liệu",
    description:
      "Mô phỏng tương tác cách danh sách liên kết, stack, queue và array lưu trữ và sắp xếp lại dữ liệu.",
  },
  {
    slug: "searching",
    name: "Thuật toán tìm kiếm",
    description:
      "Theo dõi tìm kiếm tuyến tính và nhị phân truy tìm giá trị mục tiêu qua từng phép so sánh.",
  },
  {
    slug: "core-concepts",
    name: "Khái niệm cốt lõi",
    description:
      "Đi qua các ý tưởng nền tảng: lời gọi đệ quy rẽ nhánh và quy hoạch động tái sử dụng kết quả.",
  },
] as const satisfies readonly ICategory[];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
