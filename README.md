# Website minh họa thuật toán - Algorithms Visualization

Website mô phỏng từng bước chạy của các thuật toán, được xây dựng cho đồ án tốt nghiệp.
Người xem nhập mảng đầu vào, rồi phát, tạm dừng, tua và đổi tốc độ để theo dõi từng phép so sánh, hoán đổi cùng đoạn mã giả đang chạy.
Khung trợ lý AI (DeepSeek hoặc Gemini) bên cạnh hình mô phỏng giải thích đúng bước đang xem.

# Công nghệ sử dụng

| Nhóm           | Công nghệ                                                                        |
|----------------|----------------------------------------------------------------------------------|
| Framework      | Next.js 16.4 (App Router, Cache Components, Partial Prefetching, React Compiler) |
| Giao diện      | React 19, Tailwind CSS v4, `motion` (hoạt ảnh), `lucide-react` (icon)            |
| Cơ sở dữ liệu  | PostgreSQL, Drizzle ORM, `drizzle-kit` (migration)                               |
| Trợ lý AI      | DeepSeek qua `@anthropic-ai/sdk`, Gemini qua `@google/genai`, `react-markdown`   |
| Bộ nhớ đệm     | Redis (đếm lượt hỏi AI theo IP)                                                  |
| Công cụ        | Bun (runtime, package manager, test), Biome (lint và format), TypeScript         |
| Hạ tầng cục bộ | Docker Compose                                                                   |

# Cấu trúc dự án

```
app/                       Route, layout, trang lỗi; component riêng của từng route nằm trong _components/
components/
  ui/                      Primitive dùng chung, không biết nghiệp vụ
  visualization/           Khối mô phỏng dùng chung: điều khiển phát, khung, dãy cột, mã giả, khung chat AI
engine/
  algorithm/               Hợp đồng chung của mọi thuật toán và registry (TypeScript thuần)
  assistant/               Kiểu, giới hạn, giao thức stream và reducer hội thoại của trợ lý AI
  visualization/           Bộ điều khiển phát, bộ đếm theo bước, thang chiều cao (TypeScript thuần)
features/
  assistant/               Phần máy chủ của trợ lý AI: kiểm tra dữ liệu, prompt, DeepSeek, Gemini, giới hạn lượt hỏi
  catalog/                 Danh mục, ghép registry, truy vấn DB, dựng link, component trang chủ
  searching-algorithms/    Linear Search, Binary Search và trình mô phỏng
  sorting-algorithms/      Bubble Sort, Selection Sort, trình mô phỏng và ô nhập mảng
db/                        Schema Drizzle, dữ liệu seed, kết nối DB
drizzle/                   Migration do drizzle-kit sinh ra
lib/                       Tiện ích thuần như cn.ts, site.ts
scripts/                   Script phát triển, ví dụ server giả lập mô hình AI
tests/                     Test của engine, catalog, các thuật toán và trợ lý AI
```

Chiều phụ thuộc đi một hướng: `engine/` không import `features/`, `components/` hay React, còn các feature danh mục không import lẫn nhau.

Mỗi thuật toán là một `IAlgorithmDefinition` với hàm `execute(input)` đồng bộ, trả về danh sách `events`.
Mỗi event mang sẵn ảnh chụp trạng thái sau bước đó, nên giao diện vẽ lại được bất kỳ bước nào mà không cần phát lại từ đầu.

Route của website:

| Đường dẫn                               | Nội dung                              |
|-----------------------------------------|---------------------------------------|
| `/`                                     | Trang chủ                             |
| `/visualization`                        | Danh sách các danh mục                |
| `/visualization/[category]`             | Danh sách thuật toán của một danh mục |
| `/visualization/[category]/[algorithm]` | Trang mô phỏng một thuật toán         |
| `/api/assistant`                        | API chat với trợ lý AI (POST, stream) |

# Hướng dẫn cài đặt dự án

## Yêu cầu

- [Bun](https://bun.sh) 1.4.3 trở lên
- [Docker](https://www.docker.com) (để chạy PostgreSQL cục bộ) hoặc một PostgreSQL có sẵn

## Các bước

1. Tải mã nguồn và cài thư viện.

   ```bash
   git clone https://github.com/iamminhquan/algorithms-visualization.git
   cd algorithms-visualization
   bun install
   ```

2. Tạo file biến môi trường từ file mẫu, rồi điền thông tin kết nối.

   ```bash
   cp .env.example .env.local
   ```

   Biến bắt buộc là `DATABASE_URL`, ví dụ `postgresql://postgres:postgres@localhost:5432/algorithms_visualization`.
   Các biến `POSTGRES_*` dùng cho Docker Compose và cần khớp với `DATABASE_URL`.
   Muốn dùng trợ lý AI thì đặt thêm `DEEPSEEK_API_KEY` và/hoặc `GEMINI_API_KEY`.

3. Khởi động PostgreSQL.

   ```bash
   docker compose up -d postgres
   ```

4. Áp migration và nạp dữ liệu danh mục, thuật toán.

   ```bash
   bun run db:migrate
   bun run db:seed
   ```

5. Chạy ở chế độ phát triển, rồi mở [http://localhost:3000](http://localhost:3000).

   ```bash
   bun run dev
   ```

## Các lệnh thường dùng

| Lệnh                     | Tác dụng                                              |
|--------------------------|-------------------------------------------------------|
| `bun run dev`            | Chạy server phát triển                                |
| `bun run build`          | Build production (cần `DATABASE_URL` vì build đọc DB) |
| `bun run start`          | Chạy bản đã build                                     |
| `bun run lint`           | Kiểm tra bằng Biome                                   |
| `bun run format`         | Tự sửa định dạng                                      |
| `bunx tsc --noEmit`      | Kiểm tra kiểu                                         |
| `bun test`               | Chạy toàn bộ test                                     |
| `bun run db:generate`    | Sinh migration sau khi sửa `db/schema.ts`             |
| `bun run db:migrate`     | Áp migration                                          |
| `bun run db:seed`        | Nạp lại danh mục và thuật toán từ `db/seed-data.ts`   |
| `bun run db:studio`      | Mở Drizzle Studio để xem dữ liệu                      |
| `bun run assistant:mock` | Chạy server giả lập DeepSeek và Gemini ở cổng 4010    |

## Thêm một thuật toán mới

1. Cài đặt thuật toán trong thư mục feature của danh mục, ví dụ `features/sorting-algorithms/`.
2. Thêm vào `*_ALGORITHMS` và thêm trình mô phỏng (kèm mã giả) vào `*_VISUALIZERS`.
3. Thêm một dòng vào `db/seed-data.ts` với cùng `key`.
4. Chạy `bun run db:seed`, rồi chạy `bun test` để kiểm tra registry và seed không lệch nhau.

## Giấy phép

Phát hành theo giấy phép [MIT](LICENSE).
