import { ArrayBars } from "@/components/visualization/array-bars";
import type { ISortingRun } from "../run";
import type { ISortingFrame, SortingEvent } from "../visualization";

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
  const event = run.events[index];
  const frame = getFrame(event);
  const ids = run.ids[index];

  return (
    <ArrayBars
      className={className}
      bracket={index === 0 ? undefined : frame.bracket}
      bars={event.state.array.map((value, position) => ({
        id: ids[position],
        value,
        tone: frame.tones[position],
        markers: frame.markers[position],
      }))}
    />
  );
}
