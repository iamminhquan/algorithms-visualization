import type {
  IBarBracket,
  IBarMarker,
} from "@/components/visualization/array-bars";
import type { VisualTone } from "@/engine/visualization";
import type { BubbleSortEvent } from "./bubble-sort";
import type { SelectionSortEvent } from "./selection-sort";

export type SortingEvent = BubbleSortEvent | SelectionSortEvent;

export interface ISortingFrame {
  readonly tones: readonly VisualTone[];
  readonly markers: readonly (readonly IBarMarker[])[];
  readonly bracket?: IBarBracket;
}

export function getBaseFrame(event: SortingEvent): ISortingFrame {
  return {
    tones: getBarTones(event),
    markers: event.state.array.map(() => []),
  };
}

export function getBarTones(event: SortingEvent): readonly VisualTone[] {
  const tones: VisualTone[] = event.state.array.map(() => "default");
  for (const index of event.state.sortedIndices) {
    tones[index] = "sorted";
  }

  const { payload } = event;
  switch (payload.type) {
    case "compare":
    case "swap":
      for (const index of payload.indices) {
        tones[index] = payload.type;
      }
      break;
    case "mark-sorted":
    case "complete":
      break;
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
  return tones;
}

export function trackElementIds(
  length: number,
  events: readonly SortingEvent[],
): readonly (readonly number[])[] {
  const ids = Array.from({ length }, (_, index) => index);
  return events.map((event) => {
    if (event.payload.type === "swap") {
      const [i, j] = event.payload.indices;
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return Object.freeze([...ids]);
  });
}
