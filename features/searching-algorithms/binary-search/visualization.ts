import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import type { VisualTone } from "@/engine/visualization";
import {
  createPointerMarkers,
  getBaseFrame,
  type IPointer,
  type ISearchingFrame,
} from "../visualization";
import type { BinarySearchEvent } from "./types";

export const BINARY_SEARCH_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Trong vùng [low, high]" },
  { tone: "pivot", label: "mid: phần tử ở giữa" },
  { tone: "compare", label: "Đang so sánh với key" },
  { tone: "discarded", label: "Đã loại" },
  { tone: "found", label: "Tìm thấy" },
];

export function getBinarySearchFrame(
  event: BinarySearchEvent,
): ISearchingFrame {
  const { payload, state } = event;
  const { length } = state.array;
  const frame: ISearchingFrame = {
    ...getBaseFrame(state),
    range:
      state.low <= state.high ? { from: state.low, to: state.high } : undefined,
  };
  const bounds: readonly IPointer[] = [
    { label: "low", index: state.low },
    { label: "high", index: state.high },
  ];

  switch (payload.type) {
    case "init":
    case "narrow":
    case "not-found":
      return { ...frame, markers: createPointerMarkers(length, bounds) };
    case "pick-mid":
    case "compare": {
      const { mid } = payload;
      const isCompare = payload.type === "compare";
      const tones: VisualTone[] = [...frame.tones];
      tones[mid] = isCompare ? "compare" : "pivot";
      const markers = createPointerMarkers(length, [
        bounds[0],
        { label: "mid", index: mid },
        bounds[1],
      ]);
      if (!isCompare) {
        return { ...frame, tones, markers };
      }

      const value = state.array[mid];
      let symbol = "=";
      if (value < state.target) {
        symbol = "<";
      } else if (value > state.target) {
        symbol = ">";
      }
      return {
        ...frame,
        tones,
        markers,
        bracket: {
          from: mid,
          to: mid,
          label: `${value} ${symbol} ${state.target}`,
          tone: "compare",
        },
      };
    }
    case "found": {
      const { index } = payload;
      const tones: VisualTone[] = [...frame.tones];
      tones[index] = "found";
      return {
        ...frame,
        tones,
        markers: createPointerMarkers(length, [{ label: "mid", index }]),
        bracket: { from: index, to: index, label: "Tìm thấy", tone: "found" },
      };
    }
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}
