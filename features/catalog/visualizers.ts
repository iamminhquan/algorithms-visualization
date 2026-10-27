import type { ComponentType } from "react";
import { SEARCHING_VISUALIZERS } from "@/features/searching-algorithms/visualizers";
import { SORTING_VISUALIZERS } from "@/features/sorting-algorithms/visualizers";
import type { AlgorithmKey } from "./catalog";

/*
 * `satisfies` bắt lỗi ngay lúc typecheck khi thêm thuật toán vào registry mà quên trình mô phỏng.
 */
const VISUALIZERS = {
  ...SORTING_VISUALIZERS,
  ...SEARCHING_VISUALIZERS,
} satisfies Record<AlgorithmKey, ComponentType>;

const visualizersByKey = new Map<string, ComponentType>(
  Object.entries(VISUALIZERS),
);

export function findVisualizer(key: string): ComponentType | undefined {
  return visualizersByKey.get(key);
}
