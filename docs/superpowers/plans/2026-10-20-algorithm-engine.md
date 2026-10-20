# Algorithm Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Engine TypeScript thuần chạy thuật toán sắp xếp qua một "mảng có theo dõi", sinh step history chỉ đọc (bản chụp đầy đủ mỗi bước), với Interchange Sort là thuật toán đầu tiên.

**Architecture:** Thuật toán chỉ thao tác qua `TrackedArray` (`compare`/`swap`/`markSorted`). Một recorder nội bộ biến mỗi thao tác thành một `Step` đóng băng (mảng, trạng thái cột, message, bộ đếm tích luỹ). `runAlgorithm` kiểm tra đầu vào, chạy thuật toán trên bản sao, trả về `StepHistory` là object thuần JSON hoá được. Một registry tra thuật toán theo `slug`.

**Tech Stack:** TypeScript (strict), Bun 1.4 (`bun test`), Biome 2.4.

**Spec:** `docs/superpowers/specs/2026-10-20-algorithm-engine-design.md`

## Global Constraints

- Mọi file engine nằm trong `features/algorithm/engine/`; không import React, Next.js, `server-only`, `db/` hay bất kỳ API chỉ có ở trình duyệt/server.
- Tên file kebab-case; test đặt cạnh file nguồn, đuôi `.test.ts`, import từ `bun:test`.
- Mọi message hiển thị bằng tiếng Việt, đúng nguyên văn ở Task 1.
- Engine chỉ ghi trạng thái (`default` | `comparing` | `swapping` | `sorted`), không có màu sắc.
- `Step` và `StepHistory` là object thuần, đóng băng (`Object.freeze`), JSON hoá được (không có method, class, Map).
- `bun run lint` và `bunx tsc --noEmit` phải sạch sau mỗi task.
- Commit qua skill `commit` của dự án (Conventional Commits, mô tả tiếng Việt, tiêu đề 80-100 ký tự, không có dòng attribution).

## Review Focus

- Mảng có phần tử trùng: `compare` trả 0, không hoán đổi → test `[2, 2, 1]` ở Task 3.
- Số âm và số thập phân sắp xếp đúng → test `[-1.5, 3, 0, -2]` ở Task 3.
- Thuật toán ném lỗi giữa chừng: lỗi phải lan ra ngoài, không trả về history dở dang → test ở Task 2.
- Người dùng (visualization/playback) cố sửa bước đã trả về: dữ liệu đã đóng băng, không ảnh hưởng bước khác → test ở Task 2.
- Mảng 100 phần tử sắp xếp ngược (10 001 bước) chạy xong và đếm đúng → test ở Task 3.

---

### Task 1: Kiểu dữ liệu, message và recorder

**Files:**
- Modify: `package.json` (thêm script `"test": "bun test"`, devDependency `@types/bun`), `bun.lock`
- Create: `features/algorithm/engine/types.ts`
- Create: `features/algorithm/engine/messages.ts`
- Create: `features/algorithm/engine/recorder.ts`
- Test: `features/algorithm/engine/recorder.test.ts`

**Interfaces:**
- Produces (`types.ts`):

```ts
export type BarState = "default" | "comparing" | "swapping" | "sorted";
export type StepAction = "init" | "compare" | "swap" | "mark-sorted" | "done";

export interface Step {
  readonly index: number;
  readonly action: StepAction;
  readonly array: readonly number[];
  readonly states: readonly BarState[];
  readonly indices: readonly number[];
  readonly message: string;
  readonly comparisons: number;
  readonly swaps: number;
}

export interface TrackedArray {
  readonly length: number;
  get(index: number): number;
  compare(i: number, j: number, message?: string): number; // a[i] - a[j]
  swap(i: number, j: number, message?: string): void;
  markSorted(index: number, message?: string): void;
}

export interface SortingAlgorithm {
  readonly slug: string;
  readonly name: string;
  sort(array: TrackedArray): void;
}

export interface StepHistory {
  readonly slug: string;
  readonly input: readonly number[];
  readonly steps: readonly Step[];
}
```

- Produces (`recorder.ts`): `createRecorder(input: readonly number[]): { array: TrackedArray; finish(): readonly Step[] }`. Tạo xong là đã có bước `init`; `finish()` thêm bước `done` và trả về toàn bộ bước. Không kiểm tra `NaN` (việc của Task 2).
- Produces (`messages.ts`): các hàm tạo message nguyên văn sau (`a` là mảng tại thời điểm ghi, với `swap` là giá trị **trước** khi đổi):
  - init: `` `Bắt đầu với mảng gồm ${n} phần tử` ``
  - compare: `` `So sánh a[${i}] = ${a[i]} và a[${j}] = ${a[j]}` ``
  - swap: `` `Hoán đổi a[${i}] và a[${j}] (${a[i]} ↔ ${a[j]})` ``
  - mark-sorted: `` `a[${i}] = ${a[i]} đã nằm đúng vị trí` ``
  - done: `` `Hoàn tất: ${comparisons} lần so sánh, ${swaps} lần hoán đổi` ``

- [ ] **Step 1: Commit tài liệu thiết kế và kế hoạch**

Dùng skill `commit` cho `docs/superpowers/specs/2026-10-20-algorithm-engine-design.md` và `docs/superpowers/plans/2026-10-20-algorithm-engine.md` (type `docs`).

- [ ] **Step 2: Cài `@types/bun` và thêm script test**

Run: `bun add -d @types/bun`, rồi thêm `"test": "bun test"` vào `scripts` trong `package.json`.

- [ ] **Step 3: Viết test thất bại trong `recorder.test.ts`**

Mỗi test tạo `createRecorder([3, 1, 2])` trừ khi ghi khác.

- `init step`: ngay sau khi tạo, `finish()` trả 2 bước; bước 0 có `action "init"`, `array [3,1,2]`, `states` toàn `"default"`, `indices []`, `message "Bắt đầu với mảng gồm 3 phần tử"`, `comparisons 0`, `swaps 0`.
- `compare records step and returns difference`: `array.compare(0, 1)` trả `2`; bước 1 có `action "compare"`, `indices [0,1]`, `states ["comparing","comparing","default"]`, `comparisons 1`, `swaps 0`, `message "So sánh a[0] = 3 và a[1] = 1"`.
- `swap records array after swap`: `array.swap(0, 1)`; bước 1 có `array [1,3,2]`, `states ["swapping","swapping","default"]`, `swaps 1`, `comparisons 0`, `message "Hoán đổi a[0] và a[1] (3 ↔ 1)"`; sau đó `array.get(0)` là `1`.
- `sorted persists across later steps`: `markSorted(0)` rồi `compare(1, 2)`; bước mark-sorted có `states ["sorted","default","default"]`, `message "a[0] = 3 đã nằm đúng vị trí"`; bước compare sau đó vẫn có `states[0] === "sorted"`.
- `action state wins over sorted`: `markSorted(0)` rồi `compare(0, 1)`; bước compare có `states[0] === "comparing"`; bước kế tiếp (`compare(1, 2)`) có lại `states[0] === "sorted"`.
- `done marks everything sorted`: `compare(0,1)`, `swap(0,1)`, rồi `finish()`; bước cuối có `action "done"`, `states` toàn `"sorted"`, `indices []`, `comparisons 1`, `swaps 1`, `message "Hoàn tất: 1 lần so sánh, 1 lần hoán đổi"`.
- `custom message overrides default`: `compare(0, 1, "Tuỳ chỉnh")` → bước 1 có `message "Tuỳ chỉnh"`.
- `step index is sequential`: sau 3 thao tác bất kỳ và `finish()`, `steps.map(s => s.index)` là `[0,1,2,3,4]`.
- `snapshots are independent`: sau `swap(0,1)`, bước 0 vẫn có `array [3,1,2]`.
- `invalid index throws`: `compare(0, 3)`, `swap(-1, 0)`, `markSorted(1.5)`, `get(3)` đều ném `RangeError`; không bước nào được thêm (sau đó `finish()` trả đúng 2 bước).
- `does not mutate input`: biến `input = [3,1,2]`, `createRecorder(input)`, `swap(0,1)` → `input` vẫn `[3,1,2]`.
- `length`: `array.length === 3`.

- [ ] **Step 4: Chạy test, xác nhận thất bại**

Run: `bun test features/algorithm/engine/recorder.test.ts`
Expected: FAIL (không tìm thấy module `./recorder`).

- [ ] **Step 5: Viết `types.ts`, `messages.ts`, `recorder.ts`**

Recorder giữ một bản sao mảng làm việc, một `Set<number>` vị trí đã sorted, và hai bộ đếm. Chỉ số hợp lệ là số nguyên trong `[0, length)`; kiểm tra **trước** khi đổi trạng thái hoặc đếm. `swap(i, i)` và `compare(i, i)` hợp lệ và vẫn được đếm. Mỗi bước và các mảng con của nó được `Object.freeze`.

- [ ] **Step 6: Chạy test, xác nhận đạt; chạy lint và typecheck**

Run: `bun test features/algorithm/engine/recorder.test.ts && bun run lint && bunx tsc --noEmit`
Expected: mọi test PASS, lint và tsc không báo lỗi.

- [ ] **Step 7: Commit**

Dùng skill `commit` (type `feat`): `package.json`, `bun.lock`, `types.ts`, `messages.ts`, `recorder.ts`, `recorder.test.ts`.

---

### Task 2: `runAlgorithm`, `getStep` và kiểm tra đầu vào

**Files:**
- Create: `features/algorithm/engine/run.ts`
- Test: `features/algorithm/engine/run.test.ts`

**Interfaces:**
- Consumes: `createRecorder`, `SortingAlgorithm`, `StepHistory`, `Step` từ Task 1.
- Produces:
  - `runAlgorithm(algorithm: SortingAlgorithm, input: readonly number[]): StepHistory`, ném `TypeError` nếu có phần tử không hữu hạn (`!Number.isFinite`), trước khi chạy thuật toán.
  - `getStep(history: StepHistory, index: number): Step`, ném `RangeError` nếu `index` không phải số nguyên trong `[0, history.steps.length)`.

- [ ] **Step 1: Viết test thất bại trong `run.test.ts`**

Dùng thuật toán giả khai báo ngay trong file test: `fake = { slug: "gia-lap", name: "Giả lập", sort: (a) => { if (a.compare(0, 1) > 0) a.swap(0, 1); a.markSorted(0); } }`.

- `returns history with slug, input copy and steps`: `runAlgorithm(fake, [2, 1])` có `slug "gia-lap"`, `input [2,1]`, `steps.map(s => s.action)` là `["init","compare","swap","mark-sorted","done"]`, bước cuối `array [1,2]`.
- `does not mutate input`: biến `input = [2, 1]` vẫn `[2,1]` sau khi chạy.
- `rejects non-finite input`: `[1, NaN]`, `[Infinity]`, `[-Infinity, 0]` đều ném `TypeError`; thuật toán giả dùng `sort` đếm số lần gọi để khẳng định nó **không** được gọi.
- `propagates algorithm errors`: thuật toán có `sort: () => { throw new Error("hỏng") }` → `runAlgorithm` ném `Error` với message `"hỏng"`.
- `history is frozen`: `Object.isFrozen(history)`, `Object.isFrozen(history.steps)`, `Object.isFrozen(history.input)`, `Object.isFrozen(history.steps[1].array)` đều `true`.
- `history is JSON round-trippable`: `JSON.parse(JSON.stringify(history))` `toEqual` `history`.
- `getStep returns step by index`: `getStep(history, 2).action === "swap"`.
- `getStep rejects out of range`: `getStep(history, -1)`, `getStep(history, history.steps.length)`, `getStep(history, 0.5)` ném `RangeError`.
- `empty input`: `runAlgorithm({ ...fake, sort: () => {} }, [])` có 2 bước `init`, `done`.

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `bun test features/algorithm/engine/run.test.ts`
Expected: FAIL (không tìm thấy module `./run`).

- [ ] **Step 3: Viết `run.ts`**

- [ ] **Step 4: Chạy test, xác nhận đạt; chạy lint và typecheck**

Run: `bun test && bun run lint && bunx tsc --noEmit`
Expected: mọi test PASS, lint và tsc không báo lỗi.

- [ ] **Step 5: Commit**

Dùng skill `commit` (type `feat`): `run.ts`, `run.test.ts`.

---

### Task 3: Interchange Sort và registry

**Files:**
- Create: `features/algorithm/engine/algorithms/interchange-sort.ts`
- Create: `features/algorithm/engine/registry.ts`
- Test: `features/algorithm/engine/algorithms/interchange-sort.test.ts`
- Test: `features/algorithm/engine/registry.test.ts`

**Interfaces:**
- Consumes: `SortingAlgorithm`, `TrackedArray` (Task 1); `runAlgorithm` (Task 2).
- Produces:
  - `interchangeSort: SortingAlgorithm` với `slug "sap-xep-doi-cho-truc-tiep"`, `name "Sắp xếp đổi chỗ trực tiếp (Interchange Sort)"`. Thân `sort` đúng như vòng lặp trong spec mục 4.2 (`i` từ 0 đến `n - 2`, `j` từ `i + 1`, `compare(i, j) > 0` thì `swap`, hết vòng `markSorted(i)`).
  - `algorithms: readonly SortingAlgorithm[]` và `getAlgorithm(slug: string): SortingAlgorithm | undefined` trong `registry.ts`.

- [ ] **Step 1: Viết test thất bại trong `interchange-sort.test.ts`**

`run = (input) => runAlgorithm(interchangeSort, input)`; "cuối" là `steps.at(-1)`.

- `exact step sequence for [3, 1, 2]`: `actions` là `["init","compare","swap","compare","mark-sorted","compare","swap","mark-sorted","done"]`; `indices` theo thứ tự `[[],[0,1],[0,1],[0,2],[0],[1,2],[1,2],[1],[]]`; bước cuối `array [1,2,3]`, `comparisons 3`, `swaps 2`.
- Bảng kiểm (`test.each`) với cột `input → sorted, comparisons, swaps, stepCount`:

| input | mảng cuối | comparisons | swaps | số bước |
|---|---|---|---|---|
| `[5, 3, 8, 1, 2]` | `[1, 2, 3, 5, 8]` | 10 | 7 | 23 |
| `[5, 4, 3, 2, 1]` | `[1, 2, 3, 4, 5]` | 10 | 10 | 26 |
| `[1, 2, 3, 4]` | `[1, 2, 3, 4]` | 6 | 0 | 11 |
| `[2, 2, 1]` | `[1, 2, 2]` | 3 | 1 | 8 |
| `[-1.5, 3, 0, -2]` | `[-2, -1.5, 0, 3]` | 6 | 4 | 15 |
| `[7]` | `[7]` | 0 | 0 | 2 |
| `[]` | `[]` | 0 | 0 | 2 |

- `comparisons always n(n-1)/2`: với n từ 0 đến 8, mảng `Array.from({ length: n }, (_, k) => (k * 7) % 5)`, `comparisons` bước cuối bằng `n * (n - 1) / 2`.
- `counters never decrease and only the matching one increments`: với `[5, 3, 8, 1, 2]`, giữa hai bước liền kề: bước `compare` thì `comparisons` tăng đúng 1 và `swaps` giữ nguyên; bước `swap` thì ngược lại; các loại khác giữ nguyên cả hai.
- `sorted stays sorted`: với `[5, 3, 8, 1, 2]`, một khi `states[k] === "sorted"` ở bước t, mọi bước sau t có `states[k]` là `"sorted"` hoặc nằm trong `indices` của bước đó.
- `sorted prefix is final`: tại mỗi bước `mark-sorted` cho vị trí `i`, `array[i]` bằng phần tử thứ `i` của mảng đã sắp xếp.
- `large reversed input`: `Array.from({ length: 100 }, (_, k) => 100 - k)` → `comparisons 4950`, `swaps 4950`, `steps.length 10001`, mảng cuối tăng dần 1..100.

- [ ] **Step 2: Viết test thất bại trong `registry.test.ts`**

- `getAlgorithm finds interchange sort`: `getAlgorithm("sap-xep-doi-cho-truc-tiep") === interchangeSort`.
- `getAlgorithm returns undefined for unknown slug`: `getAlgorithm("khong-co")` là `undefined`.
- `slugs are unique and match db format`: mọi `slug` trong `algorithms` khớp `/^[a-z0-9]+(-[a-z0-9]+)*$/` và không trùng nhau.

- [ ] **Step 3: Chạy test, xác nhận thất bại**

Run: `bun test features/algorithm/engine/algorithms features/algorithm/engine/registry.test.ts`
Expected: FAIL (không tìm thấy module).

- [ ] **Step 4: Viết `interchange-sort.ts` và `registry.ts`**

- [ ] **Step 5: Chạy toàn bộ test, lint và typecheck**

Run: `bun test && bun run lint && bunx tsc --noEmit`
Expected: mọi test PASS, lint và tsc không báo lỗi.

- [ ] **Step 6: Commit**

Dùng skill `commit` (type `feat`): bốn file của task này.
