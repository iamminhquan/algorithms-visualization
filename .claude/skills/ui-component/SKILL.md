---
name: ui-component
description: Viết thành phần giao diện (component, trang, layout) cho dự án Next.js 16 này theo đúng quy ước - Server Component mặc định, Cache Components với Suspense, React Compiler, Tailwind v4 thuần, cấu trúc components/ui + features/<domain>, chữ hiển thị tiếng Việt. Dùng skill này bất cứ khi nào người dùng muốn tạo hoặc sửa giao diện - "viết component", "tạo button/card/navbar/modal/form", "làm trang danh sách", "thêm layout", "dựng UI cho trang", "sửa giao diện", "tách component", "build a component", "create a page" - kể cả khi họ chỉ mô tả thứ cần hiển thị mà không nói từ "component".
---

# Viết component giao diện

Dự án dùng **Next.js 16.4** với `cacheComponents`, `partialPrefetching` và `reactCompiler` đều bật
(xem `next.config.ts`), React 19, Tailwind CSS v4, Biome làm linter. Phiên bản Next này khác nhiều so
với kiến thức cũ (vd: `params` là Promise, quy tắc prerender mới, `catchError`). Khi không chắc một API,
đọc tài liệu đi kèm trong `node_modules/next/dist/docs/01-app/` trước khi viết — đừng đoán theo trí nhớ.
Các file hay cần nhất:

- `01-getting-started/05-server-and-client-components.md`
- `01-getting-started/08-caching.md` (Cache Components, Suspense, `use cache`)
- `02-guides/interactive-apps.md` (transition, optimistic UI, pending state)

Ví dụ code đầy đủ cho từng loại component nằm trong `references/examples.md` — đọc phần tương ứng khi
bắt đầu viết loại component đó.

## Quy trình

1. **Xem cái đã có.** Liệt kê `components/ui/` và `features/` để tái sử dụng primitive sẵn có (Button,
   Card...) thay vì viết lại. Đọc `app/globals.css` để biết các token màu/font hiện có.
2. **Quyết định Server hay Client** (mục bên dưới), và đặt file đúng chỗ.
3. **Viết component** theo quy ước API, style, accessibility.
4. **Ghép vào trang** nếu cần, bọc dữ liệu async bằng `<Suspense>` có skeleton.
5. **Kiểm tra**: `bun run lint` và `bunx tsc --noEmit`. Sửa hết lỗi trong file mình viết.

## Đặt file ở đâu

```
components/ui/          primitive dùng chung, không biết gì về nghiệp vụ: button.tsx, card.tsx, badge.tsx
components/layout/      khung trang dùng chung nhiều trang: site-header.tsx, site-footer.tsx
engine/                 lõi dùng chung cho mọi thuật toán, TypeScript thuần, không có React/UI
  algorithm/            Algorithm Engine: interface, registry mà mọi thuật toán phải triển khai
  visualization/        Visualization Engine
features/
  catalog/              phần dùng chung mọi danh mục: categories.ts, catalog.ts (ghép registry),
                        queries.ts, components/ (category-card, category-grid, illustrations/)
  sorting-algorithms/   mỗi danh mục một feature: bubble-sort/, selection-sort/, components/,
                        index.ts export SORTING_ALGORITHMS cho catalog ghép vào registry
  searching-algorithms/ (khi có) cùng khuôn với sorting-algorithms
app/                    page/layout/loading/error, ghép từ features và components
  <route>/_components/  component chỉ dùng cho đúng một route (vd: app/_components/home-hero.tsx)
lib/                    tiện ích thuần: cn.ts, format.ts
```

Mỗi feature có thể có `components/`, `queries.ts` (hàm đọc dữ liệu, `import "server-only"`) và
`actions.ts` (Server Functions, `"use server"`). Chiều phụ thuộc: `catalog` được import các feature danh
mục; các feature danh mục **không** import lẫn nhau — thứ cần dùng chung (vd: vẽ dãy cột cho cả sắp xếp
lẫn tìm kiếm) đẩy xuống `engine/visualization/` hoặc `components/`. Tên file viết
kebab-case (`algorithm-card.tsx`), tên component PascalCase (`AlgorithmCard`). Mỗi file một component
chính; component phụ nhỏ (skeleton, item) có thể nằm cùng file với component dùng nó.

Lý do tách như vậy: `components/ui` phải tái sử dụng được ở bất kỳ đâu nên không được import từ
`features/` hay `db/`. Nếu một primitive bắt đầu cần biết "thuật toán" là gì, nó thuộc về `features/`.
`engine/` là tầng thấp nhất: `features/` và UI được import từ `engine/`, còn `engine/` không bao giờ
import ngược lại `features/`, `components/` hay React. Component chỉ phục vụ một trang (hero, banner)
không phải nghiệp vụ, nên đặt trong `_components/` cạnh route đó (Next bỏ qua thư mục có `_` khi tạo
route) thay vì tạo một "domain" giả trong `features/`.

## Server hay Client Component

Mặc định là **Server Component** — không cần khai báo gì. Chỉ thêm `"use client"` khi component cần:
state/hook (`useState`, `useReducer`, `useEffect`...), event handler (`onClick`, `onChange`...), hoặc API
trình duyệt (`window`, `localStorage`).

Server Component không gửi JavaScript xuống trình duyệt và đọc dữ liệu trực tiếp được, nên càng nhiều
thì trang càng nhẹ. Vì thế hãy **đẩy ranh giới client xuống lá**: thay vì đánh dấu cả trang là client
chỉ vì một nút bấm, tách nút đó thành component client riêng. Khi component client cần bọc nội dung từ
server, nhận nó qua `children` thay vì import trực tiếp.

Lưu ý khi truyền props từ Server xuống Client: props phải serialize được (string, number, object/array
thuần, Date, Promise...). Không truyền hàm thường (trừ Server Function), class instance, hay cả object
lấy từ DB nếu client chỉ cần vài trường — chọn đúng trường cần dùng.

File đọc DB/secret phải có `import "server-only"` ở đầu (như `db/index.ts`) để build báo lỗi nếu lỡ
import vào client.

## Cache Components: dữ liệu async và Suspense

Với `cacheComponents` bật, Next prerender phần tĩnh của trang thành "static shell". Mọi thứ phải chờ
lúc request (truy vấn DB không cache, `cookies()`, `headers()`, `params`, `searchParams`) phải nằm trong
`<Suspense>`, nếu không dev overlay báo lỗi **blocking-route**. Quy tắc:

- **Dữ liệu dùng chung, ít đổi** (danh sách thuật toán, danh mục): cache ở hàm query bằng `"use cache"`
  + `cacheLife(...)` + `cacheTag(...)`. Kết quả vào thẳng static shell, không cần Suspense.
- **Dữ liệu theo request** (lượt chạy mới nhất, dữ liệu theo người dùng): không cache, đặt component
  đọc nó trong `<Suspense fallback={<XxxSkeleton />}>`.
- **`params` và `searchParams` là Promise.** Dùng kiểu global `PageProps<"/thuat-toan/[slug]">` /
  `LayoutProps<"/">`. Đừng `await params` ở đầu page nếu làm vậy chặn cả trang — truyền Promise xuống
  component con nằm trong Suspense, hoặc dùng `params.then(...)` trong JSX (xem ví dụ).
- **Client Component dùng `useSearchParams()`** cũng phải nằm trong `<Suspense>`.
- **Không gọi `Math.random()`, `Date.now()`, `new Date()`, `crypto.randomUUID()` khi render Server
  Component** — kết quả sẽ bị đóng băng vào static shell. Hoặc gọi `await connection()` (từ
  `next/server`) trước đó và đặt trong Suspense, hoặc chuyển vào event handler / effect phía client.
- Mỗi skeleton nên có kích thước gần giống nội dung thật để trang không bị nhảy khi dữ liệu tới.

Lỗi khi render: dùng `catchError` từ `next/error` cho error boundary cấp component, hoặc `error.tsx`
cho cấp route. `loading.tsx` vẫn dùng được, nhưng `<Suspense>` đặt sát chỗ chờ dữ liệu cho trải nghiệm
tốt hơn vì phần còn lại của trang hiện ngay.

## React Compiler

`reactCompiler: true` tự memo hoá component và giá trị. Vì vậy:

- **Không viết `useMemo`, `useCallback`, `React.memo`** để tối ưu — chúng thừa và làm code rối. Chỉ dùng
  khi có lý do khác ngoài hiệu năng (vd: giá trị cần ổn định để làm dependency của effect gọi API ngoài).
- Giữ component **thuần**: không mutate props/state, không đọc/ghi `ref.current` khi render, không có
  side effect trong thân component. Compiler dựa vào Rules of React; vi phạm thì nó âm thầm bỏ qua
  component đó, hoặc tệ hơn là gây bug khó thấy.

## Quy ước API của component

- **Named export** (`export function Button`). Chỉ `page.tsx`, `layout.tsx`, `error.tsx`... dùng
  `export default` vì Next yêu cầu.
- Props khai báo bằng `type XxxProps = {...}` ngay trên component.
- Primitive bọc một phần tử HTML thì mở rộng props gốc bằng `ComponentProps<"button">` và spread phần
  còn lại xuống phần tử, để người dùng truyền được `aria-*`, `disabled`, `type`... mà không cần khai báo
  lại từng cái.
- React 19: `ref` là prop thường, **không dùng `forwardRef`**.
- Luôn nhận `className` và ghép vào cuối bằng `cn()` từ `lib/cn.ts` (tạo file nếu chưa có — xem
  `references/examples.md`). Không có `tailwind-merge`, nên biến thể (variant/size) viết bằng object map
  thay vì để người dùng ghi đè class xung đột.
- Ưu tiên nhận dữ liệu qua props rõ ràng (`algorithm: Pick<Algorithm, "name" | "slug">`) hơn là để
  component tự fetch, trừ component "section" chuyên đọc dữ liệu đặt trong Suspense.

## Style với Tailwind v4

- Chỉ dùng class Tailwind, không viết CSS module hay inline `style` (trừ giá trị thật sự động như chiều
  cao tính từ dữ liệu).
- Dùng **token theo ngữ nghĩa** trong `app/globals.css` (`bg-background`, `text-foreground`). Cần màu
  mới (vd: `primary`, `muted`, `border`) thì thêm biến vào `:root`, bản dark trong
  `@media (prefers-color-scheme: dark)`, rồi khai báo trong `@theme inline` — đừng rải mã hex
  (`bg-[#383838]`) khắp component, vì đổi theme sau này sẽ phải sửa từng file.
- Dark mode theo `prefers-color-scheme` (variant `dark:` mặc định của Tailwind v4). Nếu đã dùng token
  thì thường không cần `dark:` nữa.
- Responsive mobile-first: viết cho màn hình nhỏ trước, thêm `sm:`/`md:`/`lg:` cho màn rộng hơn.
- Trạng thái tương tác đầy đủ: `hover:`, `focus-visible:` (vòng focus rõ ràng), `disabled:`,
  `aria-[current=page]:`... Có `transition-colors` cho thay đổi màu.

## Accessibility và chữ hiển thị

- Dùng phần tử đúng nghĩa: `<button>` cho hành động, `<Link>` cho điều hướng, `<nav>`, `<main>`,
  `<section>` có heading, danh sách dùng `<ul>/<li>`. Không gắn `onClick` vào `<div>`.
- Nút chỉ có icon cần `aria-label`. Input cần `<label>` liên kết. Ảnh cần `alt` có nghĩa (hoặc `alt=""`
  nếu chỉ trang trí).
- Thứ tự heading không nhảy cấp (h1 → h2 → h3), mỗi trang một `h1`.
- Chữ trên giao diện viết **tiếng Việt có dấu đầy đủ**, viết hoa chữ cái đầu câu (không Title Case kiểu
  tiếng Anh): "Danh sách thuật toán", "Xem chi tiết", "Không tìm thấy thuật toán nào". Thuật ngữ như
  `O(n log n)` giữ nguyên. Root layout nên đặt `<html lang="vi">`.
- Luôn xử lý trạng thái rỗng (danh sách không có phần tử) bằng một thông báo thân thiện.

## Dùng primitive của Next

- `next/link` cho mọi điều hướng nội bộ. Với Partial Prefetching, `<Link href="...">` mặc định đã
  prefetch App Shell — **không thêm `prefetch={true}`** trừ khi có lý do cụ thể.
- `next/image` thay cho `<img>`, luôn có `width`/`height` (hoặc `fill` + container có kích thước) và
  `alt`.
- Font đã cấu hình bằng `next/font` trong `app/layout.tsx` qua biến `--font-geist-sans`/`--font-mono`
  → dùng `font-sans`/`font-mono`.

## Trước khi báo xong

Chạy và sửa đến khi sạch:

```bash
bun run lint
bunx tsc --noEmit
```

Rồi báo người dùng: đã tạo/sửa file nào, component nào là client và vì sao, và chỗ nào có Suspense.
Nếu viết component mà chưa gắn vào trang nào, nói rõ cách dùng (một đoạn JSX ví dụ).
