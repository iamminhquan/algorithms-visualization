export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4] as const;
export const DEFAULT_PLAYBACK_SPEED: PlaybackSpeed = 0.5;
export const BASE_STEP_INTERVAL_MS = 600;

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
export type PlaybackStatus = "paused" | "playing";

export type PlaybackAction =
  | { readonly type: "play" }
  | { readonly type: "pause" }
  | { readonly type: "step-forward" }
  | { readonly type: "step-back" }
  | { readonly type: "seek"; readonly index: number }
  | { readonly type: "tick" }
  | { readonly type: "set-speed"; readonly speed: PlaybackSpeed }
  | { readonly type: "load"; readonly total: number };

export interface IPlaybackState {
  readonly index: number;
  readonly totalEvents: number;
  readonly status: PlaybackStatus;
  readonly speed: PlaybackSpeed;
}

export function createPlaybackState(
  totalEvents: number,
  speed: PlaybackSpeed = DEFAULT_PLAYBACK_SPEED,
): IPlaybackState {
  return {
    index: 0,
    totalEvents: normalizeTotal(totalEvents),
    status: "paused",
    speed,
  };
}

/**
 * Hàm thuần chuyển trạng thái phát theo một thao tác, dùng được với `useReducer`.
 */
export function playbackReducer(
  state: IPlaybackState,
  action: PlaybackAction,
): IPlaybackState {
  switch (action.type) {
    case "play":
      if (state.totalEvents <= 1) {
        return state;
      }
      return update(state, {
        index: isAtEnd(state) ? 0 : state.index,
        status: "playing",
      });
    case "pause":
      return update(state, { status: "paused" });
    case "step-forward":
      return update(state, {
        index: clampIndex(state.index + 1, state.totalEvents),
        status: "paused",
      });
    case "step-back":
      return update(state, {
        index: clampIndex(state.index - 1, state.totalEvents),
        status: "paused",
      });
    case "seek":
      if (!Number.isFinite(action.index)) {
        return state;
      }
      return update(state, {
        index: clampIndex(Math.trunc(action.index), state.totalEvents),
        status: "paused",
      });
    case "tick": {
      if (state.status !== "playing") {
        return state;
      }
      const index = clampIndex(state.index + 1, state.totalEvents);
      return update(state, {
        index,
        status: index === lastIndex(state.totalEvents) ? "paused" : "playing",
      });
    }
    case "set-speed":
      return update(state, { speed: action.speed });
    case "load":
      return createPlaybackState(action.total, state.speed);
    default: {
      const unreachable: never = action;
      throw new Error(`Thao tác không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}

export function isAtEnd(state: IPlaybackState): boolean {
  return state.index === lastIndex(state.totalEvents);
}

export function getStepInterval(speed: PlaybackSpeed): number {
  return BASE_STEP_INTERVAL_MS / speed;
}

/**
 * Kiểm tra nếu sự kiện không đổi thì trả về sự state cũ, tránh React re-render.
 */
function update(
  state: IPlaybackState,
  changes: Partial<IPlaybackState>,
): IPlaybackState {
  const nextState = { ...state, ...changes };
  const unchanged =
    nextState.index === state.index &&
    nextState.status === state.status &&
    nextState.speed === state.speed;
  return unchanged ? state : nextState;
}

function normalizeTotal(total: number): number {
  return Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0;
}

function lastIndex(total: number): number {
  return Math.max(0, total - 1);
}

function clampIndex(index: number, total: number): number {
  return Math.min(Math.max(index, 0), lastIndex(total));
}
