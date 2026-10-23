import type { ComponentType } from "react";
import { SORTING_VISUALIZERS } from "@/features/sorting-algorithms/visualizers";
import type { AlgorithmKey } from "./catalog";

/*
 * `satisfies` bắt lỗi ngay lúc typecheck khi thêm thuật toán vào registry mà quên trình mô phỏng.
 */
const VISUALIZERS = {
  ...SORTING_VISUALIZERS,
} satisfies Record<AlgorithmKey, ComponentType>;

const visualizersByKey = new Map<string, ComponentType>(
  Object.entries(VISUALIZERS),
);

/**
 * Tìm trình mô phỏng theo cột `key` đọc từ bảng `algorithms`. Component trả về được tải lười,
 * nên phải render bên trong `<Suspense>`.
 *
 * @param key Key của thuật toán, chưa được kiểm tra.
 * @returns Trình mô phỏng của thuật toán, hoặc `undefined` nếu chưa có.
 */
export function findVisualizer(key: string): ComponentType | undefined {
  return visualizersByKey.get(key);
}
