import { domMax, LazyMotion, MotionConfig, m } from "motion/react";
import { scaleBarHeights, type VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { TONE_BACKGROUND } from "./tones";

/**
 * Mảng dài hơn thì cột quá hẹp để ghi giá trị bên dưới.
 */
const MAX_LABELED_BARS = 20;

/**
 * Lò xo không nảy: khi người xem bấm bước kế lúc cột còn đang trượt, cột đổi hướng mượt từ vị trí
 * hiện tại thay vì nhảy về đích rồi mới trượt tiếp.
 */
const SLIDE_TRANSITION = { type: "spring", bounce: 0, duration: 0.3 } as const;

/**
 * Một cột trên hình.
 *
 * `id`: Định danh của phần tử, không phải vị trí; giữ nguyên khi phần tử bị đổi chỗ để React
 *   (và hiệu ứng trượt) biết đây vẫn là cột cũ.
 */
export interface IArrayBar {
  readonly id: number;
  readonly value: number;
  readonly tone: VisualTone;
}

type ArrayBarsProps = {
  bars: readonly IArrayBar[];
  className?: string;
};

export function ArrayBars({ bars, className }: ArrayBarsProps) {
  const heights = scaleBarHeights(bars.map((bar) => bar.value));
  const showValues = bars.length <= MAX_LABELED_BARS;

  /*
   * `reducedMotion="user"` tắt hiệu ứng trượt khi người dùng bật giảm chuyển động trong hệ điều hành.
   * `LazyMotion` + `m` chỉ nạp phần layout animation cần dùng thay vì toàn bộ `motion`.
   */
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <div
          role="img"
          aria-label={`Mảng gồm ${bars.length} phần tử: ${bars.map((bar) => bar.value).join(", ")}`}
          className={cn("flex items-stretch gap-0.5 sm:gap-1", className)}
        >
          {bars.map((bar, position) => (
            <m.div
              key={bar.id}
              layout="position"
              transition={SLIDE_TRANSITION}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="relative w-full flex-1">
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 rounded-t-md transition-[height,background-color] duration-300 ease-out motion-reduce:transition-none",
                    TONE_BACKGROUND[bar.tone],
                  )}
                  style={{ height: `${heights[position]}%` }}
                />
              </div>
              {showValues && (
                <span className="font-mono text-xs text-text-secondary tabular-nums">
                  {bar.value}
                </span>
              )}
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
