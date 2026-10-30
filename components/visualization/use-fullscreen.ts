import { type RefObject, useEffect, useState } from "react";

export interface IFullscreenControls {
  readonly isFullscreen: boolean;
  readonly toggle: () => void;
}

export function useFullscreen(
  target: RefObject<HTMLElement | null>,
): IFullscreenControls {
  const [isNative, setIsNative] = useState(false);

  /**
   * Safari trên iPhone không có Fullscreen API. Dùng CSS phủ lên khung toàn màn hình.
   */
  const [isEmulated, setIsEmulated] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      const element = document.fullscreenElement;
      setIsNative(element !== null && element === target.current);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [target]);

  useEffect(() => {
    if (!isEmulated) {
      return;
    }
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    // Khi ở chế độ toàn màn hình, cuộn trang thì phía sau vẫn cuộn theo.
    // Nên mình sẽ đặt overflow: hidden để khóa lại, hong cho cuộn.
    root.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        setIsEmulated(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEmulated]);

  const toggle = () => {
    if (isEmulated) {
      setIsEmulated(false);
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const element = target.current;
    if (!element) {
      return;
    }
    if (!document.fullscreenEnabled) {
      setIsEmulated(true);
      return;
    }
    element.requestFullscreen().catch(() => setIsEmulated(true));
  };

  return { isFullscreen: isNative || isEmulated, toggle };
}
