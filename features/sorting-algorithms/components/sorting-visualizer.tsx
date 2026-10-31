import { useState } from "react";
import { ArrayInputForm } from "@/components/visualization/array-input-form";
import { CodePanel } from "@/components/visualization/code-panel";
import { PlaybackControls } from "@/components/visualization/playback-controls";
import { usePlayback } from "@/components/visualization/use-playback";
import { VariablesPanel } from "@/components/visualization/variables-panel";
import { VisualizerFrame } from "@/components/visualization/visualizer-frame";
import { createStepContext } from "@/engine/assistant";
import { DEFAULT_ARRAY } from "@/engine/visualization";
import { MAX_ARRAY_LENGTH } from "../array-input";
import { createSortingRun } from "../run";
import type { ISortingVisualConfig } from "../visual-configs";
import { SortingStage } from "./sorting-stage";

const SORTING_ASSISTANT_SUGGESTIONS: readonly string[] = [
  "Giải thích bước đang xem",
  "Vì sao hai phần tử này đổi chỗ?",
  "Độ phức tạp của thuật toán là bao nhiêu?",
];

type SortingVisualizerProps = ISortingVisualConfig;

export function SortingVisualizer({
  algorithm,
  pseudocode,
  sourceCode,
  getFrame,
  getVariables,
  legend,
}: SortingVisualizerProps) {
  const [run, setRun] = useState(() =>
    createSortingRun(algorithm, DEFAULT_ARRAY),
  );
  const controls = usePlayback(run.events.length);
  const { index } = controls.state;
  const event = run.events[index];
  const counts = run.counts[index];
  const metrics = [
    { label: "So sánh", value: counts.compare },
    { label: "Hoán đổi", value: counts.swap },
  ];

  return (
    <VisualizerFrame
      toolbar={
        <ArrayInputForm
          initialValues={run.values}
          maxLength={MAX_ARRAY_LENGTH}
          onChange={(values) => {
            const next = createSortingRun(algorithm, values);
            setRun(next);
            controls.load(next.events.length);
          }}
        />
      }
      description={event.description}
      code={
        <CodePanel
          pseudocode={pseudocode.lines}
          sourceCode={sourceCode}
          activeLine={pseudocode.getActiveLine(event.payload)}
        />
      }
      variables={<VariablesPanel variables={getVariables(event)} />}
      controls={<PlaybackControls controls={controls} />}
      legend={legend}
      metrics={metrics}
      assistant={{
        context: createStepContext({
          algorithmKey: algorithm.metadata.key,
          input: run.values,
          events: run.events,
          index,
          pseudocode,
          metrics,
        }),
        suggestions: SORTING_ASSISTANT_SUGGESTIONS,
        onAsk: controls.pause,
      }}
    >
      <SortingStage
        className="h-full"
        run={run}
        index={index}
        getFrame={getFrame}
      />
    </VisualizerFrame>
  );
}
