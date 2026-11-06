# Website minh họa thuật toán - Algorithms Visualization

Website mô phỏng từng bước chạy của các thuật toán, được xây dựng cho đồ án tốt nghiệp.
Người xem nhập mảng đầu vào, rồi phát, tạm dừng, tua và đổi tốc độ để theo dõi từng phép so sánh, hoán đổi cùng đoạn mã
giả đang chạy.
Khung trợ lý AI bên cạnh hình mô phỏng giải thích đúng bước đang xem: mặc định dùng DeepSeek, tự chuyển sang Gemini khi DeepSeek lỗi.

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
algorithms-visualization/
├── .claude/                     # Ngữ cảnh dự án và các skill quy ước cho Claude Code
├── .github/
│   └── workflows/               # CI: lint, typecheck, test, build; đồng bộ nhánh dev
├── app/                         # Route, layout, trang lỗi (App Router)
│   ├── _components/             # Header, footer, logo dùng chung cho mọi trang
│   ├── (site)/                  # Các trang công khai, layout gắn header và footer
│   │   ├── (auth)/              # Đăng nhập, đăng ký, xác thực email
│   │   ├── learn/               # Lộ trình học
│   │   └── visualization/       # Danh mục, trang mô phỏng, trang so sánh hai thuật toán
│   ├── admin/                   # Trang quản trị với layout riêng
│   └── api/                     # API chat với trợ lý AI và route xác thực của Better Auth
├── components/
│   ├── ui/                      # Primitive dùng chung, không biết nghiệp vụ
│   └── visualization/           # Khối mô phỏng dùng chung: điều khiển phát, dãy cột, mã giả, khung chat AI
├── db/                          # Kết nối, schema Drizzle (db/schema/) và dữ liệu seed
├── drizzle/                     # Migration do drizzle-kit sinh ra
├── engine/                      # TypeScript thuần, không import React hay features/
│   ├── algorithm/               # Hợp đồng chung của mọi thuật toán và registry
│   ├── assistant/               # Kiểu, giới hạn, giao thức stream và reducer hội thoại của trợ lý AI
│   └── visualization/           # Bộ điều khiển phát, bộ đếm theo bước, thang chiều cao
├── features/
│   ├── assistant/               # Phần máy chủ của trợ lý AI: kiểm tra dữ liệu, prompt, DeepSeek, Gemini
│   ├── auth/                    # Giới hạn, thông điệp lỗi, route và nội dung mail xác thực
│   ├── catalog/                 # Danh mục, ghép registry, truy vấn DB, dựng link, component trang chủ
│   ├── searching-algorithms/    # Linear Search, Binary Search và trình mô phỏng
│   └── sorting-algorithms/      # Bubble, Selection, Insertion, Quick, Merge Sort và trình mô phỏng
├── lib/                         # Tiện ích và cấu hình dùng chung: cn.ts, format.ts, site.ts, theme.ts, auth.ts, mailer.ts
├── tests/                       # Test của engine, catalog, auth, các thuật toán và trợ lý AI
├── .env.example                 # Mẫu biến môi trường
├── AGENTS.md                    # Hướng dẫn cho AI agent (next dev tự sinh)
├── CLAUDE.md                    # Hướng dẫn cho Claude Code
├── LICENSE                      # Giấy phép MIT
├── biome.json                   # Cấu hình lint và format
├── bun.lock                     # Khoá phiên bản thư viện
├── docker-compose.yml           # PostgreSQL, Redis, RabbitMQ cục bộ
├── drizzle.config.ts            # Cấu hình drizzle-kit
├── next.config.ts               # Cấu hình Next.js
├── package.json                 # Thư viện và script
├── tsconfig.json                # Cấu hình TypeScript
└── README.md                    # Tài liệu tổng quan bạn đang đọc
```

Chiều phụ thuộc đi một hướng: `engine/` không import `features/`, `components/` hay React, còn các feature danh mục
không import lẫn nhau.

Mỗi thuật toán là một `IAlgorithmDefinition` với hàm `execute(input)` đồng bộ, trả về danh sách `events`.
Mỗi event mang sẵn ảnh chụp trạng thái sau bước đó, nên giao diện vẽ lại được bất kỳ bước nào mà không cần phát lại từ
đầu.

Route của website:

| Đường dẫn                               | Nội dung                                    |
|-----------------------------------------|---------------------------------------------|
| `/`                                     | Trang chủ                                   |
| `/visualization`                        | Danh sách các danh mục                      |
| `/visualization/[category]`             | Danh sách thuật toán của một danh mục       |
| `/visualization/[category]/[algorithm]` | Trang mô phỏng một thuật toán               |
| `/visualization/[category]/compare`     | So sánh song song hai thuật toán (`?a=&b=`) |
| `/learning`                             | Thư viện thuật toán và lớp học của tôi      |
| `/login`, `/register`                   | Đăng nhập, đăng ký                          |
| `/verify-email`                         | Xác thực email bằng mã OTP                  |
| `/admin`                                | Trang quản trị (layout riêng)               |
| `/api/assistant`                        | API chat với trợ lý AI (POST, stream)       |
| `/api/auth/[...all]`                    | Route xác thực của Better Auth              |

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

| Lệnh                         | Tác dụng                                                    |
|------------------------------|-------------------------------------------------------------|
| `bun run dev`                | Chạy server phát triển                                      |
| `bun run build`              | Build production (cần `DATABASE_URL` vì build đọc DB)       |
| `bun run start`              | Chạy bản đã build                                           |
| `bun run lint`               | Kiểm tra bằng Biome                                         |
| `bun run format`             | Tự sửa định dạng                                            |
| `bunx tsc --noEmit`          | Kiểm tra kiểu                                               |
| `bun test`                   | Chạy toàn bộ test                                           |
| `bun run db:generate`        | Sinh migration sau khi sửa `db/schema.ts`                   |
| `bun run db:migrate`         | Áp migration                                                |
| `bun run db:migrate:prod`    | Áp migration lên DB production (cần `PROD_DATABASE_URL`)    |
| `bun run db:migrate:preview` | Áp migration lên DB preview (cần `PREVIEW_DATABASE_URL`)    |
| `bun run db:seed`            | Nạp lại danh mục và thuật toán từ `db/seed-data.ts`         |
| `bun run db:seed:preview`    | Nạp dữ liệu mẫu cho DB preview (cần `PREVIEW_DATABASE_URL`) |
| `bun run db:studio`          | Mở Drizzle Studio để xem dữ liệu                            |

## Môi trường Production và Preview

Cùng một mã nguồn, chỉ khác `DATABASE_URL` theo môi trường. Trên Neon, production dùng branch `main`, preview dùng
branch `preview` tạo bằng `--schema-only` để không lẫn tài khoản và session của người dùng thật.

| Môi trường  | Nơi chạy                  | Database                              |
|-------------|---------------------------|---------------------------------------|
| Development | Máy local                 | PostgreSQL trong `docker-compose.yml` |
| Preview     | Vercel Preview Deployment | Branch `preview` trên Neon            |
| Production  | Vercel Production         | Branch `main` trên Neon               |

Trên Vercel, `DATABASE_URL` được đặt riêng cho scope Production và Preview. Giá trị runtime dùng chuỗi **pooled**
(`...-pooler...`) vì serverless mở nhiều kết nối, còn migration dùng chuỗi **direct** nên `drizzle.config.ts` ưu tiên
`DATABASE_URL_UNPOOLED` nếu có.

Sau khi thêm migration mới, áp cho cả hai database rồi nạp lại dữ liệu cho preview:

```bash
PROD_DATABASE_URL="<direct-prod>" bun run db:migrate:prod
PREVIEW_DATABASE_URL="<direct-preview>" bun run db:migrate:preview
PREVIEW_DATABASE_URL="<direct-preview>" bun run db:seed:preview
```

Dùng `db:migrate`, không dùng `db:push` trên production và preview vì `db:push` có thể xoá cột và dữ liệu.

## Thêm một thuật toán mới

1. Cài đặt thuật toán trong thư mục feature của danh mục, ví dụ `features/sorting-algorithms/`.
2. Thêm vào `*_ALGORITHMS` và thêm trình mô phỏng (kèm mã giả) vào `*_VISUALIZERS`.
3. Thêm một dòng vào `db/seed-data.ts` với cùng `key`.
4. Chạy `bun run db:seed`, rồi chạy `bun test` để kiểm tra registry và seed không lệch nhau.

## Giấy phép

Phát hành theo giấy phép [MIT](LICENSE).
