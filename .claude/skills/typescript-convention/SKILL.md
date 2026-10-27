---
name: typescript-convention
description: Viết code TypeScript cho dự án này theo đúng quy ước - quy tắc đặt tên (PascalCase/camelCase, interface có tiền tố I, generic dạng TName), kiểu chặt chẽ (strict, unknown thay any, không non-null assertion, union phân biệt bằng `type`), import/export, xử lý lỗi, và quy tắc comment riêng của dự án (tuyệt đối không viết comment trong code, chỉ giải thích trong câu trả lời khi người dùng hỏi). Dùng skill này bất cứ khi nào viết hoặc sửa file .ts/.tsx - "viết hàm", "thêm interface/type", "tạo class", "viết thuật toán", "refactor đoạn này", "đặt tên lại", "write a function", "add a type" - kể cả khi người dùng không nhắc tới chữ TypeScript.
---

# Viết code TypeScript

Quy ước dưới đây gộp hướng dẫn của Microsoft (TypeScript Coding Guidelines, TypeScript Handbook) với
những gì cộng đồng dùng phổ biến (typescript-eslint, Google TypeScript Style Guide), cộng thêm vài quy
tắc riêng của dự án. **Quy tắc riêng của dự án luôn thắng khi xung đột** (ví dụ tiền tố `I` cho
interface — Microsoft không dùng, nhưng dự án này dùng).

Định dạng (thụt lề 2 dấu cách, nháy kép, dấu chấm phẩy, thứ tự import) do Biome lo — đừng chỉnh tay,
cứ chạy `bun run lint` ở bước cuối.

## Comment (quy tắc riêng của dự án)

**Tuyệt đối không viết comment trong code.** Không `//`, không `/* */`, không `/** */` (kể cả JSDoc cho
interface, type, hàm export hay field), không comment cuối dòng, không comment "TODO". Quy tắc này
thắng mọi hướng dẫn chung khuyên comment để giải thích code.

- Thay vì comment, để code tự nói: tên biến/hàm/kiểu rõ nghĩa, tách hằng có tên cho con số đặc biệt
  (`MAX_INPUT_LENGTH` thay vì `20`), tách hàm nhỏ có tên mô tả đúng việc nó làm.
- Điều code không tự nói được (vì sao chọn cách này, ràng buộc, bẫy, nguồn gốc một con số, lý do ép
  kiểu) thì **không ghi vào code**. Chỉ giải thích trong câu trả lời khi người dùng hỏi.
- Comment có sẵn trong code: không tự xoá hàng loạt khi chỉ sửa đoạn khác. Nếu thay đổi của bạn làm
  một comment cũ sai, xoá comment đó thay vì viết lại.
- Ngoại lệ duy nhất là chỉ thị mà công cụ bắt buộc phải nằm trong code: `/// <reference ... />`,
  `// @ts-expect-error ...`, `// biome-ignore ...`. Chỉ dùng khi thật sự không có cách khác, và phần lý
  do mà công cụ yêu cầu viết ngắn trên đúng một dòng.

```ts
/*
 * NaN không so sánh được nên sẽ cho ra kết quả sai mà không báo lỗi.   ← không viết
 */
if (Number.isNaN(value)) {
  throw new RangeError(`Phần tử tại vị trí ${index} không phải là số (NaN)`);
}

/**
 * Các chỉ số đo của một lần chạy Bubble Sort.                         ← không viết, kể cả JSDoc
 */
export interface IBubbleSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
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
- **Không dùng non-null assertion `!`** và hạn chế `as`. Nếu phải ép kiểu, đừng comment lý do trong
  code; chỉ giải thích khi người dùng hỏi. Ưu tiên `satisfies` khi chỉ muốn kiểm tra giá trị khớp kiểu mà vẫn giữ kiểu hẹp.
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
- Import chéo thư mục dùng alias `@/` (`@/engine/algorithm`); import trong cùng feature được
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

Sửa hết lỗi trong file mình viết, rồi tự rà lại theo mục **Comment** ở trên (Biome không kiểm tra quy
tắc đó): phần code bạn vừa viết không được có comment nào ngoài các chỉ thị công cụ bắt buộc.
