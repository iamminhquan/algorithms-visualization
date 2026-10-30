import { useState } from "react";
import { ArrayBars } from "@/components/visualization/array-bars";
import { ArrayInputForm } from "@/components/visualization/array-input-form";
import { CodePanel } from "@/components/visualization/code-panel";
import { PlaybackControls } from "@/components/visualization/playback-controls";
import { usePlayback } from "@/components/visualization/use-playback";
import { VariablesPanel } from "@/components/visualization/variables-panel";
import {
  type ILegendItem,
  VisualizerFrame,
} from "@/components/visualization/visualizer-frame";
import type {
  IAlgorithmDefinition,
  IExecutionResult,
} from "@/engine/algorithm";
import { createStepContext } from "@/engine/assistant";
import {
  DEFAULT_ARRAY,
  type IPseudocode,
  type IVariable,
  type SourceCode,
} from "@/engine/visualization";
import {
  DEFAULT_TARGET,
  MAX_ARRAY_LENGTH,
  pickRandomTarget,
} from "../search-input";
import type { ISearchInput, ISearchMetrics, SearchOutput } from "../types";
import {
  getRemainingCount,
  type ISearchingFrame,
  type SearchingEvent,
} from "../visualization";
import { TargetInputForm } from "./target-input-form";

const SEARCHING_ASSISTANT_SUGGESTIONS: readonly string[] = [
  "Giải thích bước đang xem",
  "Khi nào thuật toán dừng tìm?",
  "Độ phức tạp của thuật toán là bao nhiêu?",
];

interface ISearchingRun<TEvent extends SearchingEvent> {
  readonly values: readonly number[];
  readonly target: number;
  readonly output: SearchOutput;
  readonly events: readonly TEvent[];
  readonly comparisons: readonly number[];
}

type SearchingAlgorithmDefinition<TEvent extends SearchingEvent> =
  IAlgorithmDefinition<
    ISearchInput,
    IExecutionResult<SearchOutput, TEvent, ISearchMetrics>
  >;

function createRun<TEvent extends SearchingEvent>(
  algorithm: SearchingAlgorithmDefinition<TEvent>,
  values: readonly number[],
  target: number,
): ISearchingRun<TEvent> {
  const { output, events } = algorithm.execute({ array: values, target });
  let running = 0;
  const comparisons = events.map((event) => {
    if (event.payload.type === "compare") {
      running += 1;
    }
    return running;
  });
  return { values, target, output, events, comparisons };
}

type SearchingVisualizerProps<TEvent extends SearchingEvent> = {
  algorithm: SearchingAlgorithmDefinition<TEvent>;
  pseudocode: IPseudocode<TEvent["payload"]>;
  sourceCode: SourceCode;
  getFrame: (event: TEvent) => ISearchingFrame;
  getVariables: (event: TEvent) => readonly IVariable[];
  legend: readonly ILegendItem[];
  normalize?: (values: readonly number[]) => readonly number[];
  inputHint?: string;
};

export function SearchingVisualizer<TEvent extends SearchingEvent>({
  algorithm,
  pseudocode,
  sourceCode,
  getFrame,
  getVariables,
  legend,
  normalize = (values) => values,
  inputHint,
}: SearchingVisualizerProps<TEvent>) {
  const [run, setRun] = useState(() =>
    createRun(algorithm, normalize(DEFAULT_ARRAY), DEFAULT_TARGET),
  );
  const controls = usePlayback(run.events.length);
  const { index } = controls.state;
  const event = run.events[index];
  const frame = getFrame(event);
  const metrics = [
    { label: "Key", value: run.target },
    { label: "So sánh", value: run.comparisons[index] },
    { label: "Còn lại", value: getRemainingCount(event.state) },
  ];

  const rerun = (values: readonly number[], target: number) => {
    const next = createRun(algorithm, values, target);
    setRun(next);
    controls.load(next.events.length);
  };

  return (
    <VisualizerFrame
      toolbar={
        <ArrayInputForm
          initialValues={run.values}
          maxLength={MAX_ARRAY_LENGTH}
          normalize={normalize}
          hint={inputHint}
          onChange={(values, source) =>
            rerun(
              values,
              source === "random" ? pickRandomTarget(values) : run.target,
            )
          }
        >
          <TargetInputForm
            value={run.target}
            onChange={(target) => rerun(run.values, target)}
            onRandom={() => rerun(run.values, pickRandomTarget(run.values))}
          />
        </ArrayInputForm>
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
          input: { array: run.values, target: run.target },
          events: run.events,
          index,
          pseudocode,
          metrics,
        }),
        suggestions: SEARCHING_ASSISTANT_SUGGESTIONS,
        onAsk: controls.pause,
      }}
    >
      <ArrayBars
        className="h-full"
        bracket={index === 0 ? undefined : frame.bracket}
        range={frame.range}
        captionRow
        bars={event.state.array.map((value, position) => ({
          id: position,
          value,
          tone: frame.tones[position],
          markers: frame.markers[position],
          caption: position === run.output ? "key" : undefined,
        }))}
      />
    </VisualizerFrame>
  );
}
