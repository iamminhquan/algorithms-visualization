import { useState } from "react";
import { ArrayInputForm } from "@/components/visualization/array-input-form";
import { PlaybackControls } from "@/components/visualization/playback-controls";
import { useEventPlayback } from "@/components/visualization/use-playback";
import { VariablesPanel } from "@/components/visualization/variables-panel";
import { VisualizerFrame } from "@/components/visualization/visualizer-frame";
import { createStepContext } from "@/engine/assistant";
import {
  DEFAULT_ARRAY,
  getEventIndex,
  type IPseudocode,
  type IVariable,
  type SourceCode,
} from "@/engine/visualization";
import { MAX_ARRAY_LENGTH } from "../array-input";
import {
  createSortingRun,
  getRunDescription,
  getRunEvent,
  getRunMetrics,
} from "../run";
import type { ISortingVisualConfig } from "../visual-configs";
import type { SortingEvent } from "../visualization";
import { SortingStage } from "./sorting-stage";

const SORTING_ASSISTANT_SUGGESTIONS: readonly string[] = [
  "Giải thích bước đang xem",
  "Vì sao hai phần tử này đổi chỗ?",
  "Độ phức tạp của thuật toán là bao nhiêu?",
];

type SortingVisualizerProps = ISortingVisualConfig & {
  readonly pseudocode: IPseudocode<SortingEvent["payload"]>;
  readonly sourceCode: SourceCode;
};

export function SortingVisualizer({
  algorithm,
  pseudocode,
  sourceCode,
  getFrame,
  getVariables,
  legend,
  counters,
}: SortingVisualizerProps) {
  const [run, setRun] = useState(() =>
    createSortingRun(algorithm, DEFAULT_ARRAY),
  );
  const controls = useEventPlayback(run.events.length);
  const { index } = controls.state;
  const eventIndex = getEventIndex(index);
  const event = getRunEvent(run, index);
  const metrics = getRunMetrics(run, index, counters);
  const variables: readonly IVariable[] =
    event === undefined
      ? [{ name: "n", value: run.values.length }]
      : getVariables(event);

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
      description={getRunDescription(run, index)}
      code={{
        pseudocode: pseudocode.lines,
        sourceCode,
        activeLine:
          event === undefined
            ? undefined
            : pseudocode.getActiveLine(event.payload),
      }}
      variables={<VariablesPanel variables={variables} compact />}
      controls={<PlaybackControls controls={controls} />}
      legend={legend}
      metrics={metrics}
      assistant={{
        context:
          event === undefined
            ? undefined
            : createStepContext({
                algorithmKey: algorithm.metadata.key,
                input: run.values,
                events: run.events,
                index: eventIndex,
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
