import { ArrayBars } from "@/components/visualization/array-bars";
import { getEventIndex } from "@/engine/visualization";
import type { ISortingRun } from "../run";
import {
  getReadyFrame,
  type ISortingFrame,
  type SortingEvent,
} from "../visualization";

type SortingStageProps = {
  run: ISortingRun;
  index: number;
  getFrame: (event: SortingEvent) => ISortingFrame;
  className?: string;
};

export function SortingStage({
  run,
  index,
  getFrame,
  className,
}: SortingStageProps) {
  const eventIndex = getEventIndex(index);
  const event = run.events[eventIndex];
  const frame =
    event === undefined ? getReadyFrame(run.values.length) : getFrame(event);
  const values = event?.state.array ?? run.values;
  const ids = run.ids[eventIndex] ?? run.values.map((_, position) => position);

  return (
    <ArrayBars
      className={className}
      bracket={frame.bracket}
      range={frame.range}
      bars={values.map((value, position) => ({
        id: ids[position],
        value,
        tone: frame.tones[position],
        markers: frame.markers[position],
      }))}
    />
  );
}
