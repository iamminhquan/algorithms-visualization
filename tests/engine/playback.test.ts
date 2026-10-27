import { describe, expect, test } from "bun:test";
import {
  BASE_STEP_INTERVAL_MS,
  createPlaybackState,
  DEFAULT_PLAYBACK_SPEED,
  getStepInterval,
  type IPlaybackState,
  isAtEnd,
  type PlaybackAction,
  playbackReducer,
} from "@/engine/visualization";

function applyAll(
  state: IPlaybackState,
  actions: readonly PlaybackAction[],
): IPlaybackState {
  return actions.reduce(playbackReducer, state);
}

describe("createPlaybackState", () => {
  test("bắt đầu ở sự kiện đầu tiên, đang dừng, tốc độ 0.5×", () => {
    expect(createPlaybackState(5)).toEqual({
      index: 0,
      totalEvents: 5,
      status: "paused",
      speed: 0.5,
    });
  });

  test("số sự kiện âm hoặc không hữu hạn được coi là 0", () => {
    expect(createPlaybackState(-3).totalEvents).toBe(0);
    expect(createPlaybackState(Number.NaN).totalEvents).toBe(0);
    expect(createPlaybackState(2.7).totalEvents).toBe(2);
  });
});

describe("playbackReducer", () => {
  test("tick khi đang phát thì sang bước kế, tới sự kiện cuối thì tự dừng", () => {
    const playing = playbackReducer(createPlaybackState(3), { type: "play" });
    expect(playing.status).toBe("playing");

    const second = playbackReducer(playing, { type: "tick" });
    expect(second).toMatchObject({ index: 1, status: "playing" });

    const last = playbackReducer(second, { type: "tick" });
    expect(last).toMatchObject({ index: 2, status: "paused" });
    expect(isAtEnd(last)).toBe(true);
  });

  test("tick khi đang dừng không làm đổi trạng thái", () => {
    const paused = createPlaybackState(3);
    expect(playbackReducer(paused, { type: "tick" })).toBe(paused);
  });

  test("bấm phát ở sự kiện cuối thì phát lại từ đầu", () => {
    const atEnd = playbackReducer(createPlaybackState(4), {
      type: "seek",
      index: 3,
    });
    expect(playbackReducer(atEnd, { type: "play" })).toMatchObject({
      index: 0,
      status: "playing",
    });
  });

  test("vết có không quá một sự kiện thì không phát được", () => {
    for (const total of [0, 1]) {
      const state = createPlaybackState(total);
      expect(playbackReducer(state, { type: "play" })).toBe(state);
    }
  });

  test("tới, lui và tua bị kẹp trong phạm vi của vết và luôn dừng phát", () => {
    const playing = playbackReducer(createPlaybackState(3), { type: "play" });

    expect(playbackReducer(playing, { type: "step-back" })).toMatchObject({
      index: 0,
      status: "paused",
    });
    expect(
      applyAll(playing, [
        { type: "step-forward" },
        { type: "step-forward" },
        { type: "step-forward" },
      ]),
    ).toMatchObject({ index: 2, status: "paused" });
    expect(playbackReducer(playing, { type: "seek", index: 99 })).toMatchObject(
      { index: 2, status: "paused" },
    );
    expect(playbackReducer(playing, { type: "seek", index: -4 })).toMatchObject(
      { index: 0, status: "paused" },
    );
    expect(playbackReducer(playing, { type: "seek", index: 1.8 }).index).toBe(
      1,
    );
  });

  test("tua tới chỉ số không hữu hạn thì bỏ qua", () => {
    const state = createPlaybackState(3);
    expect(playbackReducer(state, { type: "seek", index: Number.NaN })).toBe(
      state,
    );
  });

  test("thao tác không làm đổi gì thì trả về đúng tham chiếu cũ", () => {
    const state = createPlaybackState(3);
    expect(playbackReducer(state, { type: "pause" })).toBe(state);
    expect(playbackReducer(state, { type: "step-back" })).toBe(state);
    expect(
      playbackReducer(state, {
        type: "set-speed",
        speed: DEFAULT_PLAYBACK_SPEED,
      }),
    ).toBe(state);
  });

  test("nạp vết mới thì về đầu, dừng phát và giữ tốc độ đang chọn", () => {
    const state = applyAll(createPlaybackState(5), [
      { type: "set-speed", speed: 2 },
      { type: "seek", index: 3 },
      { type: "play" },
      { type: "load", total: 8 },
    ]);
    expect(state).toEqual({
      index: 0,
      totalEvents: 8,
      status: "paused",
      speed: 2,
    });
  });

  test("vết rỗng giữ chỉ số ở 0 với mọi thao tác", () => {
    const state = applyAll(createPlaybackState(0), [
      { type: "step-forward" },
      { type: "seek", index: 5 },
      { type: "step-back" },
    ]);
    expect(state.index).toBe(0);
    expect(isAtEnd(state)).toBe(true);
  });
});

describe("getStepInterval", () => {
  test("tốc độ càng cao thì thời gian giữa hai bước càng ngắn", () => {
    expect(getStepInterval(1)).toBe(BASE_STEP_INTERVAL_MS);
    expect(getStepInterval(2)).toBe(BASE_STEP_INTERVAL_MS / 2);
    expect(getStepInterval(0.5)).toBe(BASE_STEP_INTERVAL_MS * 2);
  });
});
