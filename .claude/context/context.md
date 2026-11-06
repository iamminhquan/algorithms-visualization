# Ngữ cảnh dự án

- Website mô phỏng thuật toán (đồ án tốt nghiệp): Next.js 16.4 (App Router, `cacheComponents`, `partialPrefetching`,
  `reactCompiler`), React 19, Tailwind CSS v4, Drizzle ORM + PostgreSQL, Bun, Biome.
- Chữ trên giao diện và commit message viết tiếng Việt; route và slug viết tiếng Anh.

## Lệnh

```bash
bun run dev                    # next dev
bun run build                  # next build — cần DATABASE_URL vì generateStaticParams đọc DB
bun run lint                   # biome check
bun run format                 # biome format --write: chỉ sửa định dạng, không sắp lại import
bunx biome check --write       # áp các bản sửa an toàn của lint, gồm cả thứ tự import
bunx tsc --noEmit              # typecheck; nếu thiếu kiểu PageProps/LayoutProps thì chạy `bunx next typegen` trước
bun test                       # toàn bộ test trong tests/
bun test tests/sorting-algorithms/bubble-sort.test.ts   # một file
bun test -t "tên test"         # lọc theo tên

docker compose up -d postgres  # Postgres local
bun run db:generate            # sinh migration vào drizzle/ sau khi sửa db/schema.ts
bun run db:migrate             # áp migration
bun run db:seed                # upsert danh mục + thuật toán từ db/seed-data.ts
bun run db:push                # đẩy thẳng schema lên DB, không tạo migration (chỉ dùng khi thử nghiệm)
bun run db:studio              # Drizzle Studio để xem dữ liệu trong DB
bun run db:migrate:prod        # áp migration lên DB production (cần PROD_DATABASE_URL, chuỗi direct)
bun run db:migrate:preview     # áp migration lên DB preview (cần PREVIEW_DATABASE_URL, chuỗi direct)
bun run db:seed:preview        # nạp seed cho DB preview (cần PREVIEW_DATABASE_URL)
```

- CI (`.github/workflows/ci.yml`) chạy khi push `dev` và khi mở PR vào `main`: một job lint, `next typegen`, typecheck,
  test; một job dựng Postgres rồi `db:migrate`, `db:seed`, `build` (lỗi Cache Components chỉ lộ ra lúc build).
- `db/index.ts` có `import "server-only"`, nên script Bun nào import code đọc DB phải chạy với
  `--conditions=react-server` (như `db:seed`).
- Biến môi trường: xem `.env.example`; trợ lý AI cần `DEEPSEEK_API_KEY` và/hoặc `GEMINI_API_KEY`, `REDIS_URL` là tuỳ
  chọn.
- `DATABASE_URL_UNPOOLED` là chuỗi direct dùng khi migrate, `PROD_DATABASE_URL` và `PREVIEW_DATABASE_URL` là chuỗi
  direct của hai nhánh database cho `db:migrate:prod` / `db:migrate:preview` / `db:seed:preview`.
- Gửi mail cần `SMTP_USER` và `SMTP_PASSWORD` (App Password của Gmail), `MAIL_FROM` tuỳ chọn; ở development thiếu hai
  biến này thì nội dung mail (kèm mã OTP) được in ra log server thay vì gửi.

## Triển khai

- Một mã nguồn, ba môi trường, khác nhau ở `DATABASE_URL`.

  | Nơi chạy                                 | Database                              |
    |------------------------------------------|---------------------------------------|
  | Máy local (`bun run dev`)                | PostgreSQL trong `docker-compose.yml` |
  | Preview Deployment (nhánh `dev`, mọi PR) | Neon branch `preview`                 |
  | Production (nhánh `main`)                | Neon branch `main`                    |

- Mỗi nhánh Git có alias riêng `algorithms-visualization-git-<branch>-...vercel.app` (alias của `dev` là URL preview hay
  dùng), mỗi deployment có URL bất biến `algorithms-visualization-<hash>-...`. Mọi preview dùng chung một scope Preview
  nên đều ghi vào branch `preview`.
- Workflow `sync-dev.yml` fast-forward `dev` lên `main` mỗi khi push `main`, nên deploy production cũng kéo theo một
  deployment preview mới cho `dev`.
- Trên Vercel, `DATABASE_URL` đặt riêng cho scope Production và Preview với giá trị **pooled** (`...-pooler...`) vì
  serverless mở nhiều kết nối; migration dùng chuỗi **direct** nên `drizzle.config.ts` ưu tiên `DATABASE_URL_UNPOOLED`
  rồi mới tới `DATABASE_URL`.
- Env chỉ có hiệu lực ở deployment mới: đổi biến trên Vercel phải redeploy lại đúng môi trường (và cả alias
  `-git-dev-`), nếu không deployment cũ vẫn giữ giá trị cũ. Đây là lý do đổi mật khẩu database mà không redeploy thì
  preview trả `28P01 password authentication failed`.
- **Push/merge code.** Không có migration mới thì chỉ cần push, Vercel tự build và alias chuyển khi deployment Ready.
  Migration **không** tự chạy trong `next build`, nên khi `drizzle/*.sql` thay đổi phải chạy tay:

  ```bash
  PREVIEW_DATABASE_URL="<direct-preview>" bun run db:migrate:preview   # trước khi merge vào dev
  PREVIEW_DATABASE_URL="<direct-preview>" bun run db:seed:preview      # nếu db/seed-data.ts thay đổi
  PROD_DATABASE_URL="<direct-prod>" bun run db:migrate:prod            # trước khi merge vào main
  ```

- Chạy migration trước khi merge vì `next build` đọc DB (`generateStaticParams`): code mới + schema cũ làm build preview
  fail, hoặc build qua nhưng runtime lỗi `column ... does not exist`.
- Không có đồng bộ hai chiều giữa `main` và `preview`: tài khoản tạo trên preview không đăng nhập được ở production và
  ngược lại.
- Dữ liệu test của `dev` và các PR nằm lẫn nhau trong cùng branch `preview`; muốn làm sạch thì
  `bunx neon@latest branches reset preview --parent` (xoá hết dữ liệu preview rồi copy lại từ `main`, kể cả tài khoản
  thật, cân nhắc trước).
- Sau khi deploy, kiểm tra DB đọc được:

  ```bash
  bunx vercel@latest curl /visualization --deployment <deployment-url>
  bunx vercel@latest logs <deployment-url> --since 5m --non-interactive
  ```

- Deployment Protection khiến `curl` thường nhận 302; dùng `bunx vercel@latest curl` để bypass.
- Google login sinh `redirect_uri` theo domain đang chạy, nên domain preview mới muốn dùng Google phải thêm riêng vào
  Authorized redirect URI và Authorized JavaScript origin trong Google Cloud Console (Google không nhận wildcard).
- Dùng `db:migrate`, không dùng `db:push` trên production và preview vì `db:push` có thể xoá cột và dữ liệu.

## Kiến trúc

**Engine (`engine/algorithm/`)**

- Đây là hợp đồng chung, TypeScript thuần, không biết thuật toán cụ thể nào và không import React, `features/` hay
  `components/`.
- Mỗi thuật toán là một `IAlgorithmDefinition`: `metadata.key` cùng hàm `execute(input)` đồng bộ, tất định, trả về
  `IExecutionResult` gồm `output`, `metrics` và `events`.
- Mỗi event có `description` (câu tiếng Việt hiển thị cho người xem), `payload` (union phân biệt bằng `type`, ví dụ
  `compare`/`swap`/`mark-sorted`/`complete`) và `state` là ảnh chụp đầy đủ, đã đóng băng *sau* bước đó.
- Nhờ vậy UI vẽ lại bất kỳ bước nào mà không cần phát lại từ đầu.
- `createAlgorithmRegistry` nhận tuple `const` để giữ key literal: `getAlgorithm("bubble-sort")` trả đúng kiểu, còn
  `findAlgorithm(string)` dùng cho key đọc từ DB.

**Visualization Engine**

- Thuật toán chạy một lần ở client khi input đổi, rồi UI phát lại `events` như tua video; server chỉ truyền
  `algorithm.key`.
- `engine/visualization/` là TypeScript thuần: `playbackReducer` (phát, tua, tốc độ), `countPayloadTypes` (bộ đếm theo
  bước), `scaleBarHeights`, `elementAt` (đọc `a[i]` an toàn khi `i` chưa có), kiểu `VisualTone`, `IPseudocode` và
  `IVariable`, cùng phần so sánh bốn thuật toán: `COMPARISON_PARAMS` (tên tham số URL `a`/`b`/`c`/`d`),
  `COMPARISON_LANE_COUNT`, `resolveComparisonLanes` (chuẩn hoá danh sách slug từ URL, bù thuật toán còn thiếu và bỏ
  trùng), `getComparisonTotal`, `getLaneIndex`, `isLaneFinished`, và các mẫu mảng `sortAscending`/`sortDescending`/
  `nearlySorted`.
- `components/visualization/` là React dùng chung, không biết thuật toán cụ thể: `usePlayback` (gọi `load` khi đổi vết),
  `usePlaybackShortcuts`, `PlaybackControls`, `VisualizerFrame` (nút toàn màn hình qua `useFullscreen`: dùng Fullscreen
  API, trình duyệt không hỗ trợ như Safari iPhone thì phủ `fixed` lên khung nhìn; khi toàn màn hình chỉ ẩn form nhập và
  chat bằng CSS để giữ state), `ArrayBars` (cột trượt bằng `motion`), `CodePanel` (mã giả tô dòng đang chạy, dropdown
  chuyển sang mã nguồn C++), `VariablesPanel` (khung "Biến" cạnh mã giả, khi toàn màn hình nằm dưới mã giả),
  `AiChatPanel` (khung chat AI), `ComparisonLane` (một làn của trình so sánh song song: tiêu đề, các chỉ số được truyền
  vào như So sánh/Hoán đổi, khung vẽ, mô tả bước và nhãn "Xong sau X bước" luôn chiếm chỗ cố định để thanh phát không
  nhảy), `LegendList` (chú giải màu dùng lại ở trình mô phỏng đơn lẻ và trình so sánh).
- Feature chỉ chuyển event thành hình: chọn tone (`getBarTones`), giữ định danh phần tử khi hoán đổi
  (`trackElementIds`), khai báo mã giả (`pseudocode.ts`) và mã nguồn theo ngôn ngữ (`source-code.ts`, kiểu
  `SourceCode`).
- Mỗi thuật toán có `getXxxVariables(event)` trong `visualization.ts`, suy giá trị biến từ `payload` và `state`; tên và
  thứ tự biến khớp mã giả, biến chưa có hoặc đã hết phạm vi thì `value` là `undefined` (hiện `—`).
- Mã giả viết bằng tiếng Việt, ngắn gọn kiểu Python nhưng không phải Python (thụt lề thay ngoặc, không `def`/`range`/
  `len`, mỗi dòng một thao tác như `lặp i từ 0 đến n - 1`, `nếu ...`, `hoán đổi ...`, tên biến giữ dạng code, gán bằng
  `=`, kết thúc bằng `kết thúc`); xem `IPseudocode`.
- Mỗi feature export map key → trình mô phỏng tải lười (`SORTING_VISUALIZERS`); `features/catalog/visualizers.ts` ghép
  lại và `satisfies Record<AlgorithmKey, ...>`, `AlgorithmVisualizer` (client) tra theo key trong `<Suspense>`.
- Input mặc định phải cố định (không random khi render) để HTML server khớp lần render đầu ở client; mảng mặc định dùng
  chung là `DEFAULT_ARRAY` trong `engine/visualization/`.

**Trợ lý AI**

- `engine/assistant/` là TypeScript thuần dùng chung client và server: kiểu, giới hạn (`limits.ts`), giao thức stream
  NDJSON, `chatReducer`, `createStepContext`.
- Visualizer truyền `assistant={{ context, suggestions, onAsk }}` vào `VisualizerFrame`; ngữ cảnh là ảnh chụp bước đang
  xem (đầu vào, payload, state, mã giả, dòng đang chạy, chỉ số).
- `POST /api/assistant` (`app/api/assistant/route.ts`) gọi `handleAssistantRequest` trong `features/assistant/`: kiểm
  tra body, giới hạn 20 câu hỏi/10 phút theo IP (Redis, Redis lỗi thì đếm trong bộ nhớ), tra thông tin thuật toán qua
  `getAlgorithmCatalog`, rồi stream từ mô hình đầu tiên chạy được theo thứ tự ưu tiên trong `ASSISTANT_PROVIDERS`
  (DeepSeek rồi Gemini); người dùng không chọn mô hình, lỗi trước khi có chữ thì tự chuyển mô hình kế tiếp.
- DeepSeek gọi qua Anthropic SDK tới endpoint tương thích Anthropic, Gemini qua `@google/genai` (Google không có
  endpoint kiểu Anthropic); cả hai cài `IAssistantProvider` trong `features/assistant/providers/` và khai báo trong
  `PROVIDER_DEFINITIONS` (`providers/registry.ts`). Thêm mô hình mới chỉ cần thêm mục vào `ASSISTANT_PROVIDERS`
  (`engine/assistant/types.ts`), viết provider rồi thêm vào registry; biến môi trường theo mẫu `<ID>_API_KEY`,
  `<ID>_MODEL`, `<ID>_BASE_URL`.
- Chỉ `features/assistant/server.ts` đọc `process.env` và DB (`server-only`); các file khác nhận cấu hình qua tham số
  nên test bằng provider giả và server SSE giả trong `tests/assistant/`, không gọi API thật.
- Chưa dùng RabbitMQ vì chat là luồng hỏi–đáp đồng bộ stream thẳng về trình duyệt, chưa có việc chạy nền.

**Đăng nhập**

- Better Auth cấu hình ở `lib/auth.ts` (`server-only`), client ở `lib/auth-client.ts`, route
  `app/api/auth/[...all]/route.ts`; bảng nằm trong `db/schema/auth.ts`.
- Có hai cách: Google (`GoogleSignInButton`) và email + mật khẩu với `requireEmailVerification`.
- Đăng ký xong chưa có phiên; plugin `emailOTP` (`overrideDefaultEmailVerification`, mã 6 số, hạn 10 phút, lưu dạng
  hash, sai 3 lần phải gửi lại) gửi mã, người dùng nhập ở `/verify-email` và được đăng nhập luôn
  (`autoSignInAfterVerification`).
- Đăng nhập bằng email chưa xác thực trả `EMAIL_NOT_VERIFIED`: `LoginForm` gửi mã mới rồi chuyển sang `/verify-email`.
- `features/auth/` là TypeScript thuần: `limits.ts` (độ dài mật khẩu, mã, thời gian chờ gửi lại), `routes.ts`,
  `error-messages.ts` (`getAuthErrorMessage` đổi mã lỗi Better Auth sang tiếng Việt), `emails/verification-otp.ts` (nội
  dung mail); `lib/mailer.ts` gửi qua Gmail SMTP bằng nodemailer, transporter tạo lười nên build không cần biến SMTP.
- Các form (`login-form.tsx`, `register-form.tsx`, `verify-email-form.tsx`) là client component trong
  `app/(site)/(auth)/_components/`, gọi `authClient` trực tiếp; chưa có quên mật khẩu.

**Feature theo danh mục**

- `features/sorting-algorithms/` chứa `bubble-sort/`, `selection-sort/`, `insertion-sort/`, `quick-sort/` và
  `merge-sort/`, export `SORTING_ALGORITHMS`; `run.ts` có `createSortingRun` (chạy thuật toán một lần rồi dựng vết phát
  lại) và `getRunMetrics` (bộ đếm hiển thị theo `counters` của cấu hình: Merge Sort đếm `write` thay cho `swap`, mỗi
  `write` dời phần tử từ `from` về `to` nên `trackElementIds` vẫn giữ được định danh cột),
  `components/sorting-stage.tsx` có `SortingStage` (khung vẽ thanh cột dùng chung cho trình đơn lẻ và trình so sánh),
  `visual-configs.ts` có `SORTING_VISUAL_CONFIGS` và `findSortingVisualConfig` (cấu hình hình vẽ theo key: mã giả, chú
  giải, hàm dựng khung và biến).
- `features/searching-algorithms/` chứa `linear-search/` và `binary-search/`, export `SEARCHING_ALGORITHMS`; danh mục
  mới theo cùng khuôn.
- Phần dùng chung trong một danh mục nằm ở gốc feature đó, ví dụ `features/sorting-algorithms/shared.ts`
  (`assertSortInput`, `range`).
- `features/catalog/` là phần dùng chung: `catalog.ts` ghép registry từ mọi feature, `queries.ts` đọc DB, `routes.ts`
  dựng link, `categories.ts` và `components/` phục vụ trang chủ và `/visualization`.
- Các feature danh mục không import lẫn nhau; thứ dùng chung đẩy xuống `engine/` hoặc `components/`.

**Code ↔ DB**

- Bảng `algorithms` nối với code qua cột `key` (không đổi sau khi tạo); cột `slug` dùng cho URL.
- Dòng DB không có cài đặt trong registry bị ẩn (`getAlgorithmCatalog`, `getCategoryCatalog`).
- Thêm một thuật toán gồm: cài đặt trong feature, thêm vào `*_ALGORITHMS`, thêm trình mô phỏng vào `*_VISUALIZERS` (kèm
  mã giả, mã nguồn C++ và `getXxxVariables`), thêm dòng vào `db/seed-data.ts` cùng `key`, rồi chạy `db:seed`.
- Với danh mục sắp xếp, thuật toán còn phải có cấu hình hình vẽ trong `SORTING_VISUAL_CONFIGS`
  (`features/sorting-algorithms/visual-configs.ts`) thì mới xuất hiện ở trang so sánh.
- `tests/catalog/seed-data.test.ts` bắt chỗ lệch giữa registry và seed, `tests/catalog/visualizers.test.ts` bắt thuật
  toán thiếu trình mô phỏng.
- Danh mục chỉ khai báo một nơi là `CATEGORIES` trong `features/catalog/categories.ts`: trang chủ và footer đọc trực
  tiếp, `seedCategories` lấy lại chính nó, nên sửa xong phải chạy `db:seed`.

**Route**

- `/` là trang chủ, `/visualization` liệt kê mọi danh mục, `/visualization/[category]` là trang danh mục,
  `/visualization/[category]/[algorithm]` là trang thuật toán.
- `/visualization/[category]/compare` là trang so sánh song song bốn thuật toán (hiện chỉ danh mục `sorting`, danh mục
  khác `notFound()`); danh sách thuật toán lấy từ query `?a=<slug>&b=<slug>&c=<slug>&d=<slug>` qua
  `resolveComparisonLanes`, dựng link bằng `getCompareHref()`, và trang này đọc `searchParams` trong `<Suspense>` giống
  cách đọc `params`.
- Không có tuỳ chọn nào bị vô hiệu hoá: chọn thuật toán đang ở một làn khác thì hai làn đổi chỗ (dùng lại lần chạy trên
  mảng hiện tại), chọn thuật toán khác thì chỉ thay làn đó, và mọi thay đổi đều đặt lại phát.
- URL luôn phản chiếu các làn đang hiển thị: `SortingComparison` có effect so `useSearchParams()` với danh sách làn hiện
  tại và gọi `history.replaceState` (giữ tham số khác và hash) khi chúng lệch, còn URL sạch đang hiện danh sách mặc định
  thì giữ nguyên.
- `/learn` liệt kê các lộ trình học (chưa có bài, đều "Sắp ra mắt"); `/login`, `/register` và `/verify-email` nằm trong
  route group `app/(site)/(auth)/`; `/verify-email?email=...` đọc `searchParams` trong `<Suspense>`, thiếu email thì
  `redirect` về `/register`.
- Các trang công khai nằm trong route group `app/(site)/`, layout của group này gắn header và footer; root layout chỉ có
  `<html>`, `<body>` và theme.
- `/admin` là trang quản trị với layout riêng (sidebar, thanh trên cùng, `noindex`), chưa có đăng nhập nên ai cũng vào
  được.
- Admin đọc danh mục và thuật toán thật từ DB (mã nguồn lấy từ code qua `findSourceCode` trong
  `features/catalog/source-codes.ts`), còn người dùng, bài học, lớp học là dữ liệu mẫu trong
  `app/admin/_components/sample-data.ts` (gắn nhãn "Dữ liệu mẫu").
- Form và hộp xác nhận xoá trong admin chỉ là giao diện: `<form method="dialog">` đóng hộp thoại mà không gửi đi đâu.
- Thuật toán phải đúng danh mục của nó (`getAlgorithmBySlug(category, algorithm)`), sai danh mục thì `notFound()`.
- Dựng link bằng `getCategoryHref()` / `getAlgorithmHref()` / `getCompareHref()` trong `features/catalog/routes.ts`.
- Root layout có `title.template`, trang chỉ đặt tên riêng của nó; admin có template riêng.
- `app/not-found.tsx` tự gắn header và footer vì nó render ngay trong root layout, còn `app/(site)/error.tsx`,
  `app/admin/error.tsx`, `app/admin/not-found.tsx` nằm trong layout của group nên giữ khung trang;
  `app/global-error.tsx` lo lỗi ở chính root layout.
- Query có `"use cache"` + `cacheLife("hours")` + `cacheTag("catalog")` nên đi vào static shell; dữ liệu theo request
  phải nằm trong `<Suspense>`.
- Page không `await params`: truyền Promise xuống view async nằm trong `<Suspense>` (xem `CategoryView`), nếu không
  `partialPrefetching` báo lỗi `instant-shell-url-data` vì App Shell dùng chung cho mọi URL của route.
- Chạy `db:seed` xong phải build lại (hoặc đợi hết `revalidate`), vì script seed chạy ngoài Next nên không gọi được
  `revalidateTag`.
- Với Cache Components không dùng được `dynamicParams`, nên slug lạ được xử lý bằng `notFound()`.
- Hiện repo chưa có `proxy.ts` (hay `middleware.ts`) nên không có chỗ kiểm tra slug trước khi render. Trang đã bắt đầu
  stream nên slug lạ thành soft 404 (status 200 kèm `noindex`); muốn 404 thật thì thêm `proxy.ts` kiểm tra slug trước
  khi trang stream.

**Đặt file**

- `components/ui/` chứa primitive không biết nghiệp vụ (không import `features/`, `db/`).
- Header, footer và logo nằm ở `app/_components/` vì dùng chung cho `app/(site)/layout.tsx`, `app/not-found.tsx` và
  admin (logo, nút đổi theme).
- Header tách thành nhiều file trong `app/_components/header/`: `site-header.tsx` (Server Component đọc danh mục từ DB,
  DB lỗi vẫn hiện danh mục), `nav-items.ts` (mục menu), menu danh mục, bảng tìm kiếm Ctrl K (`command-palette.tsx`), nút
  đổi theme và menu trượt mobile.
- Component dùng chung cho các trang trong một route group đặt ở `_components/` của group đó (ví dụ
  `app/(site)/(auth)/_components/`, `app/admin/_components/`).
- Component chỉ một route dùng thì đặt ở `app/<route>/_components/`; component dùng chung cho cả `/visualization` và
  `/visualization/[category]` nằm ở `app/(site)/visualization/_components/` (ví dụ `algorithm-grid.tsx`).
- `lib/` chứa tiện ích dùng chung không gắn nghiệp vụ (`cn.ts`, `site.ts`, `format.ts`).

**Style**

- Chỉ dùng token ngữ nghĩa khai báo trong `app/globals.css` (`bg-bg-surface`, `text-text-secondary`,
  `border-border-strong`, `bg-accent-default`...), không dùng hex hay palette mặc định (`slate-*`, `indigo-*`).
- `accent/*` dành cho tương tác; `success/*`, `warning/*`, `danger/*` cho trạng thái và hành động nguy hiểm (badge, nút
  xoá); `state/*` (compare, swap, pivot, pointer, sorted) chỉ dùng trong hình mô phỏng.
- Dark mode bật bằng `data-theme="dark"` trên `<html>`: `lib/theme.ts` đặt thuộc tính này trước khi hydrate (theo lựa
  chọn đã lưu, chưa lưu thì theo hệ điều hành) và biến CSS đổi theo, nên thường không cần `dark:`.

## Quy ước

- Các skill trong `.claude/skills/` là quy ước của dự án, đọc trước khi làm việc tương ứng.
- `ui-component` dành cho component và trang.
- `typescript-convention` áp dụng cho mọi file .ts/.tsx: interface có tiền tố `I`, không dùng `any`/`enum`/`!`, tuyệt
  đối không viết comment trong code (chỉ giải thích khi người dùng hỏi).
- `commit` và `open-pr`: làm trên nhánh tính năng (`feature/*` cho feat, type khác giữ nguyên prefix như `fix/*`), merge
  `--no-ff` vào `dev` rồi push, `dev` ổn mới mở PR `dev` → `main`; tiêu đề dạng `type: mô tả tiếng Việt`, không có dòng
  attribution.
- Tiêu đề commit và tiêu đề PR đều tối đa 80 ký tự, kiểm bằng `.claude/skills/commit/scripts/check_commit_msg.py`.
