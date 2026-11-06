import type { ComponentType } from "react";
import { SEARCHING_VISUALIZERS } from "@/features/searching-algorithms/visualizers";
import { SORTING_VISUALIZERS } from "@/features/sorting-algorithms/visualizers";
import type { AlgorithmKey } from "./catalog";
import type { IAlgorithmCodeContent } from "./code-content";

const VISUALIZERS = {
  ...SORTING_VISUALIZERS,
  ...SEARCHING_VISUALIZERS,
} satisfies Record<AlgorithmKey, ComponentType<IAlgorithmCodeContent>>;

const visualizersByKey = new Map<string, ComponentType<IAlgorithmCodeContent>>(
  Object.entries(VISUALIZERS),
);

export function findVisualizer(
  key: string,
): ComponentType<IAlgorithmCodeContent> | undefined {
  return visualizersByKey.get(key);
}
