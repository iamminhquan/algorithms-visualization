import { useEffect, useReducer } from "react";
import {
  createPlaybackState,
  getStepCount,
  getStepInterval,
  type IPlaybackState,
  isAtEnd,
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

export function useEventPlayback(eventCount: number): IPlaybackControls {
  const controls = usePlayback(getStepCount(eventCount));

  const play = () => {
    if (controls.state.totalEvents <= 2) {
      controls.play();
      return;
    }
    if (controls.state.index === 0 || isAtEnd(controls.state)) {
      controls.seek(1);
    }
    controls.play();
  };

  return {
    ...controls,
    play,
    load: (total) => controls.load(getStepCount(total)),
  };
}
