"use client";

import { Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualization/visualizer-frame";
import { findVisualizer } from "../visualizers";

type AlgorithmVisualizerProps = {
  algorithmKey: string;
};

export function AlgorithmVisualizer({
  algorithmKey,
}: AlgorithmVisualizerProps) {
  const Visualizer = findVisualizer(algorithmKey);
  if (!Visualizer) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-text-secondary">
        Thuật toán này chưa có phần mô phỏng.
      </p>
    );
  }

  return (
    <Suspense fallback={<VisualizerSkeleton />}>
      <Visualizer key={algorithmKey} />
    </Suspense>
  );
}
