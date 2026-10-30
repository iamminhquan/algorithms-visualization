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
import { createStepContext } from "@/engine/assistant";
import {
  countPayloadTypes,
  DEFAULT_ARRAY,
  type IPseudocode,
  type IVariable,
  type PayloadTypeCounts,
  type SourceCode,
} from "@/engine/visualization";
import { MAX_ARRAY_LENGTH } from "../array-input";
import type { SortingAlgorithm } from "../index";
import {
  type ISortingFrame,
  type SortingEvent,
  trackElementIds,
} from "../visualization";

/**
 * Mọi thứ cần để vẽ một lần chạy, tính một lần khi input đổi thay vì ở mỗi lần render.
 *
 * `ids`: Định danh phần tử ở từng vị trí sau mỗi sự kiện, xem `trackElementIds`.
 * `counts`: Số lần so sánh, hoán đổi dồn tới mỗi sự kiện.
 */
const SORTING_ASSISTANT_SUGGESTIONS: readonly string[] = [
  "Giải thích bước đang xem",
  "Vì sao hai phần tử này đổi chỗ?",
  "Độ phức tạp của thuật toán là bao nhiêu?",
];

interface ISortingRun {
  readonly values: readonly number[];
  readonly events: readonly SortingEvent[];
  readonly ids: readonly (readonly number[])[];
  readonly counts: readonly PayloadTypeCounts<"compare" | "swap">[];
}

function createRun(
  algorithm: SortingAlgorithm,
  values: readonly number[],
): ISortingRun {
  const { events } = algorithm.execute(values);
  return {
    values,
    events,
    ids: trackElementIds(values.length, events),
    counts: countPayloadTypes(events, ["compare", "swap"]),
  };
}

/**
 * Props của `SortingVisualizer`.
 *
 * `getFrame`: Biến một sự kiện thành hình cần vẽ (tone, huy hiệu, ngoặc); mỗi thuật toán tự khai báo.
 * `legend`: Chú giải màu và huy hiệu riêng của thuật toán.
 */
type SortingVisualizerProps = {
  algorithm: SortingAlgorithm;
  pseudocode: IPseudocode<SortingEvent["payload"]>;
  sourceCode: SourceCode;
  getFrame: (event: SortingEvent) => ISortingFrame;
  getVariables: (event: SortingEvent) => readonly IVariable[];
  legend: readonly ILegendItem[];
};

/**
 * Trình mô phỏng dùng chung cho các thuật toán sắp xếp, vì chúng có cùng dạng bước và ảnh chụp.
 */
// review
export function SortingVisualizer({
  algorithm,
  pseudocode,
  sourceCode,
  getFrame,
  getVariables,
  legend,
}: SortingVisualizerProps) {
  const [run, setRun] = useState(() => createRun(algorithm, DEFAULT_ARRAY));
  const controls = usePlayback(run.events.length);
  const { index } = controls.state;
  const event = run.events[index];
  const frame = getFrame(event);
  const ids = run.ids[index];
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
            const next = createRun(algorithm, values);
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
      <ArrayBars
        className="h-full"
        bracket={index === 0 ? undefined : frame.bracket}
        bars={event.state.array.map((value, position) => ({
          id: ids[position],
          value,
          tone: frame.tones[position],
          markers: frame.markers[position],
        }))}
      />
    </VisualizerFrame>
  );
}
