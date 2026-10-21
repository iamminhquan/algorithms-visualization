---
name: typescript-convention
description: Viết code TypeScript cho dự án này theo đúng quy ước - quy tắc đặt tên (PascalCase/camelCase, interface có tiền tố I, generic dạng TName), kiểu chặt chẽ (strict, unknown thay any, không non-null assertion, union phân biệt bằng `type`), import/export, xử lý lỗi, và quy tắc comment riêng của dự án (chỉ comment khi cần, không comment điều hiển nhiên; luôn dùng /** */ hoặc /* */ nhiều dòng, giải thích interface/class trước rồi mới tới từng field, mỗi field một dòng). Dùng skill này bất cứ khi nào viết hoặc sửa file .ts/.tsx - "viết hàm", "thêm interface/type", "tạo class", "viết thuật toán", "thêm comment", "refactor đoạn này", "đặt tên lại", "write a function", "add a type" - kể cả khi người dùng không nhắc tới chữ TypeScript.
---

# Viết code TypeScript

Quy ước dưới đây gộp hướng dẫn của Microsoft (TypeScript Coding Guidelines, TypeScript Handbook) với
những gì cộng đồng dùng phổ biến (typescript-eslint, Google TypeScript Style Guide), cộng thêm vài quy
tắc riêng của dự án. **Quy tắc riêng của dự án luôn thắng khi xung đột** (ví dụ tiền tố `I` cho
interface — Microsoft không dùng, nhưng dự án này dùng).

Định dạng (thụt lề 2 dấu cách, nháy kép, dấu chấm phẩy, thứ tự import) do Biome lo — đừng chỉnh tay,
cứ chạy `bun run lint` ở bước cuối.

## Comment (quy tắc riêng của dự án)

**Chỉ comment khi thật sự cần.** Trước khi viết, tự hỏi: người đọc code có tự hiểu được điều này từ
tên biến, tên hàm, kiểu dữ liệu hoặc chính dòng code không? Nếu có thì **không viết**. Comment chỉ
dành cho những gì code không tự nói được:

- **Tại sao** chọn cách này khi cách hiển nhiên hơn lại sai (`Mỗi sự kiện giữ bản sao riêng của mảng,
  nên các bước sau không làm đổi ảnh chụp trước đó`).
- **Ràng buộc hoặc bẫy** không thấy được từ code (`NaN không so sánh được nên sẽ cho ra kết quả sai
  mà không báo lỗi`, `bộ nhớ tăng ~n³`).
- **Nguồn gốc của một con số** (`mọi cặp đều sai thứ tự nên có n(n-1)/2 lần đổi chỗ`).
- **Lý do ép kiểu** `as` (bắt buộc, xem mục Kiểu dữ liệu).
- **Hợp đồng của khai báo dùng chung** (interface/type/hàm export) mà tên chưa nói hết: định dạng,
  đơn vị, thứ tự, bất biến, khi nào trả `undefined`/ném lỗi.

Không comment những thứ sau (xoá nếu gặp trong code đang sửa):

```ts
/*
 * Không có lần đổi chỗ nào nghĩa là phần còn lại đã đúng thứ tự.   ← thuật lại đúng điều kiện `if`
 */
if (!swapped) {
  break;
}

/*
 * Sắp xếp trên bản sao.                                             ← `[...input]` đã nói rõ
 */
const array = [...input];

/**
 * Một lượt chạy mô phỏng thuật toán.                                ← lặp lại tên `runsTable`
 *
 * `stepCount`: Số bước mô phỏng.                                    ← lặp lại tên field
 */
```

Trong comment giải thích field, chỉ liệt kê field cần giải thích; field tự rõ nghĩa (`name`,
`description`, `id`) thì bỏ qua.

Khi đã cần comment thì viết theo đúng format:

1. **Chỉ dùng comment khối, và luôn viết nhiều dòng.** Dòng mở `/**` (hoặc `/*`) và dòng đóng `*/`
   nằm riêng, mỗi dòng nội dung bắt đầu bằng ` * `. Không dùng `//`, không viết comment khối trên một
   dòng như `/** Mô tả. */`.
   - Comment cho khai báo (interface, type, class, hàm, hằng export, field): dùng `/** */` để hiện
     trong hover của editor.
   - Comment giải thích bên trong thân hàm: dùng `/* */`.
   - Ngoại lệ duy nhất là chỉ thị mà công cụ bắt buộc dạng dòng: `/// <reference ... />`,
     `// @ts-expect-error ...`, `// biome-ignore ...`.
2. **Giải thích interface/class/type theo thứ tự:** trước hết nó là gì (một hoặc vài câu), một dòng
   ` *` trống, rồi giải thích từng thành phần, **mỗi thành phần một dòng** theo dạng
   `` `tên`: Mô tả. `` Mô tả dài thì xuống dòng và thụt thêm 2 dấu cách. Không rải comment riêng lên
   từng field — gom hết vào comment đầu khai báo.
3. Hàm cần giải thích tham số thì dùng đúng format trên: mô tả hàm, dòng trống, mỗi tham số một dòng.
4. Comment viết **tiếng Việt có dấu**.

```ts
/**
 * Sự kiện dành riêng cho thuật toán Bubble Sort.
 *
 * `BubbleSortStep`: Các bước trong thuật toán.
 * `IBubbleSortState`: Trạng thái hiện tại của mảng đang được sắp xếp tới đâu.
 */
export type BubbleSortEvent = IExecutionEvent<BubbleSortStep, IBubbleSortState>;

/**
 * Các chỉ số đo của một lần chạy Bubble Sort.
 *
 * `comparisons`: Số lần so sánh hai phần tử (bằng số sự kiện "compare").
 * `swaps`: Số lần thực sự đổi chỗ (bằng số sự kiện "swap").
 * `writes`: Số lần ghi vào mảng đang sắp xếp; mỗi lần đổi chỗ ghi 2 ô nên luôn bằng 2 × swaps.
 *   Bản sao ban đầu từ input không được tính.
 */
export interface IBubbleSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

for (const [index, value] of input.entries()) {
  /*
   * NaN không so sánh được nên sẽ cho ra kết quả sai mà không báo lỗi.
   */
  if (Number.isNaN(value)) {
    throw new RangeError(`Phần tử tại vị trí ${index} không phải là số (NaN)`);
  }
}
```

Sai format:

```ts
// NaN không so sánh được               ← dùng //
/** Thao tác trong một bước. */         ← comment khối trên một dòng
export interface IBubbleSortState {
  /** Các vị trí đã sắp xong. */        ← comment rải trên từng field
  readonly sortedIndices: readonly number[];
}
```

## Đặt tên

| Thứ | Kiểu chữ | Ví dụ |
|---|---|---|
| Interface | PascalCase, **tiền tố `I`** (riêng dự án) | `IExecutionResult`, `IBubbleSortState` |
| Type alias, class, enum | PascalCase, không tiền tố | `BubbleSortResult`, `DuplicateAlgorithmError` |
| Tham số generic | `T` + tên có nghĩa; chỉ dùng `T` trơn khi có đúng một tham số hiển nhiên | `TInput`, `TDefinition`, `TId` |
| Hàm, biến, tham số, property, method | camelCase | `executeBubbleSort`, `sortedFrom` |
| Hằng số cấp module (giá trị cố định, cấu hình) | UPPER_SNAKE_CASE | `MAX_INPUT_LENGTH`, `BUBBLE_SORT_ID` |
| Tên file | kebab-case | `bubble-sort.ts`, `registry.test.ts` |

- Dùng từ đầy đủ, không viết tắt khó đoán (`comparisons` chứ không `cmp`). Viết tắt quen thuộc như
  `id`, `url`, `html` thì viết như một từ: `algorithmId`, `parseUrl`.
- Không thêm tiền tố `_` cho thành viên private — dùng `private` hoặc `#field`.
- Boolean đặt tên như câu hỏi đúng/sai: `swapped`, `isSorted`, `hasNext`.

## Kiểu dữ liệu

- `strict` đã bật trong `tsconfig.json`. Không tắt, không lách.
- **Không dùng `any`.** Dữ liệu chưa rõ kiểu (JSON, input từ ngoài, `catch`) thì dùng `unknown` rồi
  thu hẹp bằng kiểm tra. Không dùng `Function`, `Object`, `{}` làm kiểu.
- **Không dùng non-null assertion `!`** và hạn chế `as`. Nếu phải ép kiểu, comment lý do tại sao chắc
  chắn đúng. Ưu tiên `satisfies` khi chỉ muốn kiểm tra giá trị khớp kiểu mà vẫn giữ kiểu hẹp.
- **`interface` cho hình dạng object** (nhất là thứ sẽ được `extends`/implement); **`type` cho union,
  intersection, tuple, mapped/conditional type và alias của generic** (`type BubbleSortResult =
  IExecutionResult<...>`). Props của React component theo skill `ui-component` (`type XxxProps`).
- Mô hình nhiều trường hợp bằng **union phân biệt** có field `type`, và kiểm tra hết các nhánh bằng
  `never`:

  ```ts
  switch (step.type) {
    case "compare":
    case "swap":
      return highlight(step.indices);
    case "mark-sorted":
      return markSorted(step.indices);
    case "complete":
      return finish();
    default: {
      const unreachable: never = step;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
  ```

- **Không dùng `enum` và `namespace`.** Thay `enum` bằng union chuỗi (`"compare" | "swap"`) hoặc object
  `as const`; thay `namespace` bằng module ES.
- Dữ liệu không được sửa sau khi tạo thì đánh dấu `readonly` (field) và `readonly T[]` (mảng).
- Hàm được export ghi rõ kiểu trả về để thay đổi bên trong không âm thầm làm đổi API.
- Tự viết thì dùng `undefined` cho "không có giá trị" (theo hướng dẫn của Microsoft); giữ `null` khi
  API bên ngoài hoặc DB (Drizzle) trả về `null`. Truy cập an toàn bằng `?.` và mặc định bằng `??`
  (không dùng `||` cho số/chuỗi vì `0` và `""` bị coi là rỗng).

## Biến, hàm, module

- `const` mặc định, `let` khi thật sự gán lại, không dùng `var`. Mỗi câu lệnh khai báo một biến.
- Luôn dùng `===`/`!==`. Luôn có `{}` cho `if`/`for`/`while`, kể cả thân một dòng.
- Arrow function cho callback và hàm cục bộ; `function` cho hàm cấp module (được hoisting, có tên rõ
  trong stack trace).
- **Named export**, không `export default` (trừ file Next.js bắt buộc: `page.tsx`, `layout.tsx`...).
  Module có `index.ts` thì chỉ re-export những gì bên ngoài cần dùng.
- Import chỉ dùng làm kiểu thì viết `import type { ... }` hoặc `type` trong danh sách import.
- Import chéo thư mục dùng alias `@/` (`@/features/algorithm/engine`); import trong cùng feature được
  dùng đường dẫn tương đối.
- Không mutate tham số đầu vào; tạo bản sao (`[...input]`, `{ ...obj }`) như code hiện có.

## Lỗi

- Chỉ `throw` đối tượng `Error` (hoặc lớp con), không `throw` chuỗi. Lỗi nghiệp vụ cần phân biệt thì
  tạo lớp con có `name` riêng (như `DuplicateAlgorithmError`).
- Thông báo lỗi tiếng Việt, nêu giá trị gây lỗi: `` `Dữ liệu đầu vào có ${n} phần tử, vượt quá giới hạn ${MAX}` ``.
- Biến trong `catch` là `unknown`; kiểm tra `error instanceof Error` trước khi đọc `message`.
- Kiểm tra dữ liệu ở ranh giới (input người dùng, URL, API ngoài) rồi tin vào kiểu ở bên trong.

## Trước khi báo xong

```bash
bun run lint
bunx tsc --noEmit
bun test
```

Sửa hết lỗi trong file mình viết, rồi tự rà lại comment theo mục **Comment** ở trên (Biome không kiểm
tra quy tắc đó): xoá comment hiển nhiên, sửa comment sai format.
