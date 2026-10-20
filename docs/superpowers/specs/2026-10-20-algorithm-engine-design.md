# Algorithm Engine — Thiết kế

Ngày: 2026-10-20 · Nhánh: `feature/algorithm-engine`

## 1. Mục đích

Dự án cần một **algorithm engine** chạy thuật toán và "ghi hình" quá trình chạy thành một chuỗi
bước (**step history**). Sau này:

- **visualization engine** đọc từng bước để vẽ các cột, tô màu theo trạng thái, hiện message và
  bộ đếm;
- **playback controller** di chuyển qua lại trên step history: tới, lùi, nhảy đến bước bất kỳ,
  tự chạy theo tốc độ.

Cả hai phần đó **chưa làm** trong đợt này. Engine phải được thiết kế sao cho chúng chỉ cần *đọc*
step history, không bao giờ phải chạy lại thuật toán hay tự tính trạng thái.

Thuật toán đầu tiên: **Interchange Sort** (sắp xếp đổi chỗ trực tiếp).

## 2. Người xem cần thấy gì (yêu cầu từ chủ dự án)

Tại mỗi bước, màn hình phải dựng lại được:

- các cột với giá trị hiện tại của mảng;
- màu của từng cột theo trạng thái: **xanh lá = đã sắp xếp**, **vàng = đang so sánh**,
  **cam = đang hoán đổi**, còn lại là màu mặc định;
- một message mô tả hành động đang làm;
- **số lần so sánh** và **số lần hoán đổi**.

## 3. Mục tiêu, không làm, và những điều phải tránh

**Mục tiêu**

1. Chạy thuật toán một lượt từ đầu đến cuối, sinh toàn bộ step history ngay lập tức.
2. Mỗi bước là một **bản chụp đầy đủ**: tự nó đủ để vẽ màn hình, không phụ thuộc bước trước.
3. Bộ đếm trong mỗi bước là giá trị **tính đến bước đó**, để khi tua lùi con số cũng lùi đúng.
4. Thêm thuật toán mới chỉ cần viết thêm một file thuật toán và đăng ký nó, không sửa engine.

**Không làm trong đợt này**

- Giao diện visualization, playback controller, trang hiển thị.
- Lưu lượt chạy vào database (bảng `runs` đã có, sẽ nối sau).
- Redis, RabbitMQ, chạy trên server, Web Worker.
- Tối ưu bộ nhớ kiểu chỉ lưu phần thay đổi (delta). Mảng đầu vào nhỏ, cỡ vài chục phần tử.
- Thuật toán khác ngoài Interchange Sort.
- Bước riêng để đánh dấu vị trí i, j trước khi so sánh (chủ dự án đã nói không cần).

**Phải tránh (dù code vẫn "chạy được" thì vẫn coi là hỏng)**

- Code thuật toán bị rối vì phải tự ghi bước, tự đếm, tự tạo message.
- Bộ đếm hoặc hình ảnh lệch so với những gì thuật toán thật sự làm.
- Tua đến một bước mà mảng, màu hoặc bộ đếm không khớp với thời điểm đó.
- Engine import React, Next.js, database hay bất cứ thứ gì chỉ chạy được ở server hoặc ở client.
- Engine quyết định màu sắc. Engine chỉ ghi *trạng thái*, màu là việc của visualization engine.

## 4. Thiết kế đã chốt

### 4.1 Engine là module TypeScript thuần

Không phụ thuộc React, Next.js, database, `server-only`. Chạy được trong trình duyệt, trong test,
và sau này trong Web Worker hay trên server mà không phải sửa.

### 4.2 Thuật toán làm việc qua "mảng có theo dõi"

Thuật toán **không được đụng trực tiếp vào mảng**. Engine đưa cho nó một đối tượng mảng có theo
dõi (tạm gọi `TrackedArray`) với các thao tác:

| Thao tác | Ý nghĩa | Bước sinh ra |
|---|---|---|
| `compare(i, j)` | so sánh `a[i]` với `a[j]`, trả về số âm / 0 / dương | 1 bước `compare`, tăng bộ đếm so sánh |
| `swap(i, j)` | hoán đổi `a[i]` và `a[j]` | 1 bước `swap`, tăng bộ đếm hoán đổi |
| `markSorted(i)` | đánh dấu vị trí `i` đã đúng chỗ | 1 bước `mark-sorted` |
| `length`, `get(i)` | đọc kích thước, đọc giá trị (không sinh bước, không đếm) | không |

Mỗi lần gọi thao tác sinh bước, engine tự chụp mảng, gán trạng thái cho các cột, cập nhật bộ đếm và
tạo message. Như vậy bộ đếm và hình ảnh luôn khớp với hành động thật.

Code Interchange Sort phải đọc gần như bản gốc:

```ts
for (let i = 0; i < n - 1; i++) {
  for (let j = i + 1; j < n; j++) {
    if (arr.compare(i, j) > 0) arr.swap(i, j);
  }
  arr.markSorted(i);
}
```

### 4.3 Nội dung một bước

Mỗi bước chứa ít nhất:

- `index`: số thứ tự bước, bắt đầu từ 0;
- `action`: loại hành động: `init`, `compare`, `swap`, `mark-sorted`, `done`;
- `array`: bản sao giá trị mảng tại thời điểm đó;
- `states`: trạng thái từng cột: `default`, `comparing`, `swapping`, `sorted`;
- `indices`: các vị trí liên quan đến hành động (rỗng với `init`/`done`);
- `message`: câu mô tả bằng tiếng Việt;
- `comparisons`, `swaps`: bộ đếm tính đến bước này.

Bước và step history là dữ liệu chỉ đọc. Playback controller và visualization không được sửa chúng.
Dữ liệu phải là object thuần (JSON hoá được), vì sau này có thể truyền qua Worker hoặc lưu lại.

### 4.4 Quy tắc trạng thái

- `comparing` và `swapping` chỉ có ở đúng bước đó, trên các vị trí trong `indices`.
- `sorted` đã gán thì **giữ nguyên ở mọi bước sau**.
- Nếu một vị trí vừa `sorted` vừa nằm trong hành động hiện tại, trạng thái của hành động thắng
  trong bước đó.

### 4.5 Chuỗi bước của Interchange Sort

1. `init`: mảng gốc, mọi cột `default`, bộ đếm 0.
2. Mỗi lần so sánh: một bước `compare`, hai cột i, j `comparing`.
3. Mỗi lần `a[i] > a[j]`: một bước `swap`, hai cột `swapping`. `array` là mảng **sau** khi hoán đổi.
4. Hết vòng i: một bước `mark-sorted` cho vị trí i.
5. `done`: mọi cột `sorted`, message tổng kết. Phần tử cuối không cần `markSorted` riêng, bước
   `done` lo việc này.

Mảng 0 hoặc 1 phần tử chỉ có `init` và `done`.

### 4.6 Message

Engine tự sinh message tiếng Việt theo loại hành động, kèm giá trị cụ thể. Mẫu tham khảo, câu chữ
cuối cùng do người làm chọn:

- `init`: "Bắt đầu với mảng gồm 5 phần tử"
- `compare`: "So sánh a[0] = 5 và a[3] = 2"
- `swap`: "Hoán đổi a[0] và a[3] (5 ↔ 2)"
- `mark-sorted`: "a[0] = 1 đã nằm đúng vị trí"
- `done`: "Hoàn tất: 10 lần so sánh, 4 lần hoán đổi"

Mỗi thao tác nhận thêm một message tuỳ chọn để thuật toán ghi đè khi muốn câu riêng.

### 4.7 Đăng ký thuật toán

Mỗi thuật toán là một đối tượng gồm ít nhất `slug`, `name` và hàm chạy nhận `TrackedArray`.
Engine có một danh sách đăng ký tra theo `slug`. `slug` trùng định dạng với cột `algorithms.slug`
trong `db/schema.ts` (chữ thường, không dấu, nối bằng gạch ngang) để sau này nối với database.

Có một hàm chạy chung, dạng `run(algorithm, input) → StepHistory`. Hàm này **không sửa** mảng
đầu vào. `StepHistory` cho biết tổng số bước (sau này ghi vào `runs.step_count`), lấy được bước
theo chỉ số, và mang theo `slug` thuật toán cùng bản sao mảng đầu vào. Chỉ số ngoài phạm vi hoặc
thao tác `TrackedArray` với vị trí không hợp lệ thì báo lỗi, không âm thầm bỏ qua.

### 4.8 Kiểm thử

Dùng `bun test` có sẵn trong Bun. Cần kiểm tra ít nhất:

- mảng ở bước cuối đã sắp xếp đúng, và mảng đầu vào không bị sửa;
- với Interchange Sort, số lần so sánh luôn bằng n(n−1)/2; số lần hoán đổi đúng với vài mảng mẫu
  tính tay, bằng 0 với mảng đã sắp xếp;
- mảng rỗng, 1 phần tử, có phần tử trùng, đã sắp xếp, sắp xếp ngược;
- bộ đếm không giảm qua các bước, và mỗi bước chỉ tăng đúng bộ đếm của loại hành động đó;
- vị trí đã `sorted` thì vẫn `sorted` ở mọi bước sau; bước `done` có mọi cột `sorted`;
- lấy một bước bất kỳ theo chỉ số thì `array`, `states`, bộ đếm khớp với việc chạy tuần tự đến đó.

## 5. Ràng buộc từ dự án

- Next.js 16.4, React 19.3, TypeScript, Bun 1.4, Biome (`bun run lint` phải sạch).
- Alias `@/*` trỏ về gốc repo.
- Quy ước thư mục trong `.claude/skills/ui-component`: code theo nghiệp vụ nằm trong
  `features/<domain>/`, domain hiện có là `algorithm`; `lib/` chỉ cho tiện ích chung.
- Tên file kebab-case. Chữ hiển thị cho người dùng bằng tiếng Việt.
- Commit theo skill `commit` của dự án; không có dòng attribution.

## 6. Quyết định của Claude (chủ dự án chưa xác nhận riêng)

- Vị trí code: `features/algorithm/engine/` cho phần lõi, thuật toán trong một thư mục con riêng
  (ví dụ `features/algorithm/engine/algorithms/interchange-sort.ts`). Test đặt cạnh file nguồn
  (`*.test.ts`).
- `slug` của Interchange Sort: `sap-xep-doi-cho-truc-tiep`, tên hiển thị
  "Sắp xếp đổi chỗ trực tiếp (Interchange Sort)".
- Bước `swap` chụp mảng **sau** khi hoán đổi.
- Đầu vào chỉ nhận số hữu hạn; gặp `NaN`/`Infinity` thì báo lỗi ngay, không sinh bước.
- Thêm `@types/bun` vào devDependencies và script `"test": "bun test"` vào `package.json`, để
  TypeScript hiểu `bun:test`.

## 7. Để người làm tự quyết

- Tên chính xác của type, hàm, file bên trong `features/algorithm/engine/`.
- Câu chữ message cụ thể (giữ đúng tinh thần ở mục 4.6).
- Cách tổ chức nội bộ của `TrackedArray` và `StepHistory`, miễn giữ đúng hành vi đã mô tả.
- Có thêm trường phụ vào bước hay không (ví dụ mô tả ngắn cho người đọc màn hình), miễn không bỏ
  trường nào ở mục 4.3.
