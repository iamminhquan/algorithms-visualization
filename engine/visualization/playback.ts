export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4] as const;

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/**
 * Thời gian giữa hai bước ở tốc độ 1×, tính bằng mili giây.
 */
export const BASE_STEP_INTERVAL_MS = 600;

export type PlaybackStatus = "paused" | "playing";

/**
 * Trạng thái phát của một vết thực thi.
 *
 * `index`: Chỉ số sự kiện đang hiển thị, luôn nằm trong `[0, total - 1]` (bằng 0 khi `total` là 0).
 * `total`: Số sự kiện của vết.
 * `status`: Đang phát hay đang dừng. Không có trạng thái "xong" riêng: đứng ở sự kiện cuối
 *   và đang dừng nghĩa là đã phát hết, xem `isAtEnd`.
 */
export interface IPlaybackState {
  readonly index: number;
  readonly total: number;
  readonly status: PlaybackStatus;
  readonly speed: PlaybackSpeed;
}

/**
 * Thao tác của người xem (và của bộ hẹn giờ, với `tick`) lên trạng thái phát.
 *
 * `play`: Phát tiếp; nếu đã ở sự kiện cuối thì phát lại từ đầu.
 * `seek`: Nhảy tới sự kiện `index` và dừng; chỉ số ngoài phạm vi bị kẹp về biên gần nhất.
 * `tick`: Bộ hẹn giờ báo tới lúc sang bước kế; bị bỏ qua khi đang dừng.
 * `load`: Nạp một vết mới có `total` sự kiện, quay về đầu và dừng, giữ nguyên tốc độ.
 */
export type PlaybackAction =
  | { readonly type: "play" }
  | { readonly type: "pause" }
  | { readonly type: "step-forward" }
  | { readonly type: "step-back" }
  | { readonly type: "seek"; readonly index: number }
  | { readonly type: "tick" }
  | { readonly type: "set-speed"; readonly speed: PlaybackSpeed }
  | { readonly type: "load"; readonly total: number };

/**
 * Tạo trạng thái ban đầu: đứng ở sự kiện đầu tiên và đang dừng.
 *
 * @param total Số sự kiện của vết.
 * @param speed Tốc độ ban đầu.
 * @returns Trạng thái phát mới.
 */
export function createPlaybackState(
  total: number,
  speed: PlaybackSpeed = 1,
): IPlaybackState {
  return { index: 0, total: normalizeTotal(total), status: "paused", speed };
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
      if (state.total <= 1) {
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
        index: clampIndex(state.index + 1, state.total),
        status: "paused",
      });
    case "step-back":
      return update(state, {
        index: clampIndex(state.index - 1, state.total),
        status: "paused",
      });
    case "seek":
      if (!Number.isFinite(action.index)) {
        return state;
      }
      return update(state, {
        index: clampIndex(Math.trunc(action.index), state.total),
        status: "paused",
      });
    case "tick": {
      if (state.status !== "playing") {
        return state;
      }
      const index = clampIndex(state.index + 1, state.total);
      return update(state, {
        index,
        status: index === lastIndex(state.total) ? "paused" : "playing",
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
  return state.index === lastIndex(state.total);
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
  const next = { ...state, ...changes };
  const unchanged =
    next.index === state.index &&
    next.status === state.status &&
    next.speed === state.speed;
  return unchanged ? state : next;
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
