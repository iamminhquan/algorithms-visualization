import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import type { VisualTone } from "@/engine/visualization";
import {
  createPointerMarkers,
  getBaseFrame,
  type ISearchingFrame,
} from "../visualization";
import type { LinearSearchEvent } from "./types";

export const LINEAR_SEARCH_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa xét" },
  { tone: "compare", label: "i: đang so sánh với key" },
  { tone: "discarded", label: "Đã loại" },
  { tone: "found", label: "Tìm thấy" },
];

export function getLinearSearchFrame(
  event: LinearSearchEvent,
): ISearchingFrame {
  const frame = getBaseFrame(event.state);
  const { payload, state } = event;

  switch (payload.type) {
    case "compare":
    case "found": {
      const { index } = payload;
      const isFound = payload.type === "found";
      const value = state.array[index];
      const tones: VisualTone[] = [...frame.tones];
      tones[index] = isFound ? "found" : "compare";

      let label = "Tìm thấy";
      if (!isFound) {
        label = `${value} ${value === state.target ? "=" : "≠"} ${state.target}`;
      }
      return {
        tones,
        markers: createPointerMarkers(state.array.length, [
          { label: "i", index },
        ]),
        bracket: {
          from: index,
          to: index,
          label,
          tone: isFound ? "found" : "compare",
        },
      };
    }
    case "not-found":
      return frame;
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}
