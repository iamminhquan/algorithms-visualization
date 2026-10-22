import { useEffect, useReducer } from "react";
import {
  createPlaybackState,
  getStepInterval,
  type IPlaybackState,
  type PlaybackSpeed,
  playbackReducer,
} from "@/engine/visualization";

/**
 * Trạng thái phát cùng các thao tác điều khiển, trả về từ `usePlayback`.
 */
export interface IPlaybackControls {
  readonly state: IPlaybackState;
  readonly play: () => void;
  readonly pause: () => void;
  readonly stepForward: () => void;
  readonly stepBack: () => void;
  readonly seek: (index: number) => void;
  readonly setSpeed: (speed: PlaybackSpeed) => void;
  readonly load: (total: number) => void;
}

/**
 * Điều khiển phát một vết thực thi, tự sang bước kế khi đang phát.
 * Hook chỉ đọc `initialTotal` ở lần render đầu; khi vết đổi (người dùng đổi input), gọi `load`
 * trong cùng event handler đặt vết mới, để hai thay đổi được render cùng một lần.
 *
 * @param initialTotal Số sự kiện của vết ban đầu.
 * @returns Trạng thái phát và các thao tác điều khiển.
 */
export function usePlayback(initialTotal: number): IPlaybackControls {
  const [state, dispatch] = useReducer(
    playbackReducer,
    initialTotal,
    createPlaybackState,
  );

  useEffect(() => {
    if (state.status !== "playing") {
      return;
    }
    /*
     * Tới sự kiện cuối thì reducer tự chuyển sang "paused", effect chạy lại và dừng bộ hẹn giờ.
     */
    const timer = setInterval(
      () => dispatch({ type: "tick" }),
      getStepInterval(state.speed),
    );
    return () => clearInterval(timer);
  }, [state.status, state.speed]);

  return {
    state,
    play: () => dispatch({ type: "play" }),
    pause: () => dispatch({ type: "pause" }),
    stepForward: () => dispatch({ type: "step-forward" }),
    stepBack: () => dispatch({ type: "step-back" }),
    seek: (index) => dispatch({ type: "seek", index }),
    setSpeed: (speed) => dispatch({ type: "set-speed", speed }),
    load: (total) => dispatch({ type: "load", total }),
  };
}
