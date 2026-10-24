import { domMax, LazyMotion, MotionConfig, m } from "motion/react";
import { scaleBarHeights, type VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { TONE_BACKGROUND, TONE_BORDER } from "./tones";

/**
 * Mảng dài hơn thì cột quá hẹp để ghi giá trị bên dưới.
 */
const MAX_LABELED_BARS = 20;

/**
 * Lò xo không nảy: khi người xem bấm bước kế lúc cột còn đang trượt, cột đổi hướng mượt từ vị trí
 * hiện tại thay vì nhảy về đích rồi mới trượt tiếp.
 */
const SLIDE_TRANSITION = { type: "spring", bounce: 0, duration: 0.3 } as const;

/*
 * Các hằng dưới đây tính bằng rem và phải khớp với class Tailwind tương ứng
 * (`h-5` = 1,25rem, `gap-0.5` = 0.125rem) vì ngoặc cần biết huy hiệu cao bao nhiêu để nằm phía trên.
 */
const MARKER_HEIGHT_REM = 1.25;
const MARKER_GAP_REM = 0.125;

/**
 * Chỗ trống phía trên cột cao nhất cho huy hiệu và ngoặc, đủ cho 2 huy hiệu chồng nhau (2,625rem)
 * cộng một ngoặc (nhãn `h-4`, khoảng cách và chân ngoặc `h-1.5`, tổng 1,5rem). Luôn chừa sẵn
 * thay vì tính theo bước, để cột không đổi chiều cao khi chú thích xuất hiện.
 */
const HEADROOM_REM = 4.5;

/**
 * Nhãn nhỏ đặt ngay trên đỉnh cột, ví dụ con trỏ `i`, `j` hay giá trị nhỏ nhất `min`.
 */
export interface IBarMarker {
  readonly label: string;
  readonly tone: VisualTone;
}

/**
 * Cặp ngoặc vuông phủ các cột từ `from` tới `to` (theo vị trí, gồm cả hai đầu), kèm nhãn ngắn
 * phía trên, ví dụ kết quả so sánh `98 > 74` hoặc `Hoán đổi`.
 */
export interface IBarBracket {
  readonly from: number;
  readonly to: number;
  readonly label: string;
  readonly tone: VisualTone;
}

/**
 * Một cột trên hình.
 *
 * `id`: Định danh của phần tử, không phải vị trí; giữ nguyên khi phần tử bị đổi chỗ để React
 *   (và hiệu ứng trượt) biết đây vẫn là cột cũ.
 * `markers`: Các huy hiệu của vị trí này, xếp chồng từ đỉnh cột đi lên. Huy hiệu thuộc về vị trí
 *   chứ không theo phần tử, nên đứng yên khi cột trượt.
 */
export interface IArrayBar {
  readonly id: number;
  readonly value: number;
  readonly tone: VisualTone;
  readonly markers?: readonly IBarMarker[];
}

type ArrayBarsProps = {
  bars: readonly IArrayBar[];
  bracket?: IBarBracket;
  className?: string;
};

function getMarkerStackRem(count: number): number {
  return count === 0
    ? 0
    : count * MARKER_HEIGHT_REM + (count - 1) * MARKER_GAP_REM;
}

/**
 * Khoảng cách từ đáy vùng vẽ tới đỉnh của cột có chiều cao `percent`, kèm `extraRem` phía trên.
 */
function getBarTop(percent: number, extraRem = 0): string {
  return `calc((100% - ${HEADROOM_REM}rem) * ${percent / 100} + ${extraRem}rem)`;
}

export function ArrayBars({ bars, bracket, className }: ArrayBarsProps) {
  const heights = scaleBarHeights(bars.map((bar) => bar.value));
  const showValues = bars.length <= MAX_LABELED_BARS;
  const hasAnnotations =
    bracket !== undefined || bars.some((bar) => bar.markers?.length);

  let bracketBottom: string | undefined;
  if (bracket !== undefined) {
    const span = bars.slice(bracket.from, bracket.to + 1);
    const tallest = Math.max(...heights.slice(bracket.from, bracket.to + 1), 0);
    const tallestStack = Math.max(
      ...span.map((bar) => getMarkerStackRem(bar.markers?.length ?? 0)),
      0,
    );
    bracketBottom = getBarTop(tallest, tallestStack + MARKER_GAP_REM);
  }

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
          className={cn(
            "relative [--bar-gap:0.125rem] sm:[--bar-gap:0.25rem]",
            className,
          )}
        >
          <div className="flex h-full items-stretch gap-(--bar-gap)">
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
                    style={{
                      height: `calc((100% - ${HEADROOM_REM}rem) * ${heights[position] / 100})`,
                    }}
                  />
                </div>
                {showValues && (
                  <span className="h-4 font-mono text-xs leading-4 text-text-secondary tabular-nums">
                    {bar.value}
                  </span>
                )}
              </m.div>
            ))}
          </div>
          {hasAnnotations && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col gap-1.5"
            >
              <div
                className="grid flex-1 gap-x-(--bar-gap)"
                style={{
                  gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))`,
                }}
              >
                {bars.map((bar, position) =>
                  bar.markers?.length ? (
                    <div
                      key={bar.id}
                      className="relative row-start-1"
                      style={{ gridColumnStart: position + 1 }}
                    >
                      <div
                        className="absolute inset-x-0 flex flex-col-reverse items-center gap-0.5 transition-[bottom] duration-300 ease-out motion-reduce:transition-none"
                        style={{
                          bottom: getBarTop(heights[position], MARKER_GAP_REM),
                        }}
                      >
                        {bar.markers.map((marker) => (
                          <span
                            key={marker.label}
                            className={cn(
                              "flex h-5 min-w-5 items-center justify-center rounded-sm border-2 bg-bg-surface px-0.5 font-mono text-xs leading-none font-semibold text-text-primary",
                              TONE_BORDER[marker.tone],
                            )}
                          >
                            {marker.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
                {bracket !== undefined && (
                  <div
                    className="relative row-start-1"
                    style={{
                      gridColumn: `${bracket.from + 1} / ${bracket.to + 2}`,
                    }}
                  >
                    <div
                      className="absolute inset-x-0 flex flex-col items-center gap-0.5 transition-[bottom] duration-300 ease-out motion-reduce:transition-none"
                      style={{ bottom: bracketBottom }}
                    >
                      <span className="font-mono text-xs leading-4 whitespace-nowrap text-text-primary tabular-nums">
                        {bracket.label}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-full rounded-t-sm border-x-2 border-t-2",
                          TONE_BORDER[bracket.tone],
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
              {showValues && <div className="h-4" />}
            </div>
          )}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
