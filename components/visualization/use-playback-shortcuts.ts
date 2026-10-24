import { useEffect, useEffectEvent } from "react";
import type { IPlaybackControls } from "./use-playback";

/**
 * Phím tắt điều khiển phát, ghi theo cú pháp của thuộc tính `aria-keyshortcuts`.
 */
export const PLAYBACK_SHORTCUTS = {
  toggle: "Space",
  stepBack: "ArrowLeft",
  stepForward: "ArrowRight",
} as const;

/**
 * Phần tử tự xử lý phím khi đang được focus (gõ chữ, kéo thanh trượt, chọn tốc độ), nên phím tắt
 * phải nhường cho chúng.
 */
const TEXT_ENTRY_SELECTOR =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/**
 * Nút và link dùng Space để kích hoạt chính nó; nếu phím tắt cũng xử lý thì bị bấm hai lần.
 */
const SPACE_ACTIVATED_SELECTOR = "button, a[href], summary, [role='button']";

/**
 * Gắn phím tắt trên toàn trang: Space phát/dừng, ←/→ lùi/tới một bước.
 * Bỏ qua khi người dùng đang nhập liệu hoặc giữ Ctrl/Alt/Meta để không chặn phím tắt của trình duyệt.
 *
 * @param controls Bộ điều khiển trả về từ `usePlayback`.
 */
export function usePlaybackShortcuts(controls: IPlaybackControls): void {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(TEXT_ENTRY_SELECTOR)) {
      return;
    }

    switch (event.key) {
      case " ":
        if (target?.closest(SPACE_ACTIVATED_SELECTOR)) {
          return;
        }
        if (controls.state.status === "playing") {
          controls.pause();
        } else {
          controls.play();
        }
        break;
      case "ArrowLeft":
        controls.stepBack();
        break;
      case "ArrowRight":
        controls.stepForward();
        break;
      default:
        return;
    }
    event.preventDefault();
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
