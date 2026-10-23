import { useState } from "react";
import { ArrayBars } from "@/components/visualization/array-bars";
import { PlaybackControls } from "@/components/visualization/playback-controls";
import { PseudocodePanel } from "@/components/visualization/pseudocode-panel";
import { usePlayback } from "@/components/visualization/use-playback";
import {
  type ILegendItem,
  VisualizerFrame,
} from "@/components/visualization/visualizer-frame";
import {
  countPayloadTypes,
  type IPseudocode,
  type PayloadTypeCounts,
} from "@/engine/visualization";
import { DEFAULT_ARRAY } from "../array-input";
import type { SortingAlgorithm } from "../index";
import {
  getBarTones,
  type SortingEvent,
  trackElementIds,
} from "../visualization";
import { ArrayInputForm } from "./array-input-form";

const SORTING_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa sắp xếp" },
  { tone: "compare", label: "Đang so sánh" },
  { tone: "swap", label: "Đang hoán đổi" },
  { tone: "sorted", label: "Đã đúng vị trí" },
];

/**
 * Mọi thứ cần để vẽ một lần chạy, tính một lần khi input đổi thay vì ở mỗi lần render.
 *
 * `ids`: Định danh phần tử ở từng vị trí sau mỗi sự kiện, xem `trackElementIds`.
 * `counts`: Số lần so sánh, hoán đổi dồn tới mỗi sự kiện.
 */
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

type SortingVisualizerProps = {
  algorithm: SortingAlgorithm;
  pseudocode: IPseudocode<SortingEvent["payload"]>;
};

/**
 * Trình mô phỏng dùng chung cho các thuật toán sắp xếp, vì chúng có cùng dạng bước và ảnh chụp.
 */
export function SortingVisualizer({
  algorithm,
  pseudocode,
}: SortingVisualizerProps) {
  const [run, setRun] = useState(() => createRun(algorithm, DEFAULT_ARRAY));
  const controls = usePlayback(run.events.length);
  const { index } = controls.state;
  const event = run.events[index];
  const tones = getBarTones(event);
  const ids = run.ids[index];
  const counts = run.counts[index];

  return (
    <VisualizerFrame
      toolbar={
        <ArrayInputForm
          initialValues={run.values}
          onChange={(values) => {
            const next = createRun(algorithm, values);
            setRun(next);
            controls.load(next.events.length);
          }}
        />
      }
      description={event.description}
      aside={
        <PseudocodePanel
          lines={pseudocode.lines}
          activeLine={pseudocode.getActiveLine(event.payload)}
        />
      }
      controls={<PlaybackControls controls={controls} />}
      legend={SORTING_LEGEND}
      metrics={[
        { label: "Số phần tử", value: run.values.length },
        { label: "So sánh", value: counts.compare },
        { label: "Hoán đổi", value: counts.swap },
      ]}
    >
      <ArrayBars
        className="h-full"
        bars={event.state.array.map((value, position) => ({
          id: ids[position],
          value,
          tone: tones[position],
        }))}
      />
    </VisualizerFrame>
  );
}
