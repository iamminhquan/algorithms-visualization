import { ArrowUp } from "lucide-react";
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

/**
 * Cột đang hoán đổi phóng to rồi thu lại trong lúc trượt, cùng thời gian với `SLIDE_TRANSITION`,
 * trông như tiến lại gần người xem rồi lùi về; kèm `z-10` để nó nằm đè lên cột bên cạnh thay vì
 * chui xuyên qua.
 */
const LIFT_KEYFRAMES = [1, 1.12, 1];
const LIFT_TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;

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
 * Khung nền bao các cột từ `from` tới `to` (theo vị trí, gồm cả hai đầu), ví dụ vùng `[low, high]`
 * còn đang tìm của tìm kiếm nhị phân. Khung trượt và co giãn mượt khi vùng đổi.
 */
export interface IBarRange {
  readonly from: number;
  readonly to: number;
}

/**
 * Một cột trên hình.
 *
 * `id`: Định danh của phần tử, không phải vị trí; giữ nguyên khi phần tử bị đổi chỗ để React
 *   (và hiệu ứng trượt) biết đây vẫn là cột cũ.
 * `markers`: Các huy hiệu của vị trí này, xếp chồng từ đỉnh cột đi lên. Huy hiệu thuộc về vị trí
 *   chứ không theo phần tử, nên đứng yên khi cột trượt.
 * `caption`: Chú thích ngắn dưới giá trị của cột, kèm mũi tên chỉ lên cột, ví dụ `key`.
 */
export interface IArrayBar {
  readonly id: number;
  readonly value: number;
  readonly tone: VisualTone;
  readonly markers?: readonly IBarMarker[];
  readonly caption?: string;
}

/**
 * Props của `ArrayBars`.
 *
 * `captionRow`: Luôn chừa hàng chú thích dưới các cột kể cả khi không cột nào có `caption`, để
 *   cột không đổi chiều cao khi chú thích xuất hiện hay biến mất.
 */
type ArrayBarsProps = {
  bars: readonly IArrayBar[];
  bracket?: IBarBracket;
  range?: IBarRange;
  captionRow?: boolean;
  className?: string;
};

/*
 * Khung vùng nhô ra hai bên cột ngoài cùng một chút để không dính sát mép cột. Đỉnh khung (`top-6`)
 * chừa chỗ cho hàng chỉ số đo mà `VisualizerFrame` đặt đè ở góc trên của hình, và vẫn cao hơn
 * ngoặc nằm trên cột cao nhất (ngoặc cách đỉnh vùng vẽ khoảng 1,6rem).
 */
const RANGE_PADDING_REM = 0.25;

/**
 * Vị trí ngang và bề rộng của khung bao cột `from` tới `to` trong dãy `count` cột cách nhau
 * `--bar-gap`, tính bằng CSS để khớp đúng với các cột co giãn theo khung.
 */
function getRangeStyle(range: IBarRange, count: number) {
  const column = `((100% - ${count - 1} * var(--bar-gap)) / ${count})`;
  const span = range.to - range.from + 1;
  return {
    left: `calc(${column} * ${range.from} + ${range.from} * var(--bar-gap) - ${RANGE_PADDING_REM}rem)`,
    width: `calc(${column} * ${span} + ${span - 1} * var(--bar-gap) + ${2 * RANGE_PADDING_REM}rem)`,
  };
}

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

export function ArrayBars({
  bars,
  bracket,
  range,
  captionRow = false,
  className,
}: ArrayBarsProps) {
  const heights = scaleBarHeights(bars.map((bar) => bar.value));
  const showValues = bars.length <= MAX_LABELED_BARS;
  const showCaptions =
    captionRow || bars.some((bar) => bar.caption !== undefined);
  const captions = bars.flatMap((bar, position) =>
    bar.caption === undefined ? [] : [`${bar.caption} ở vị trí ${position}`],
  );
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
          aria-label={[
            `Mảng gồm ${bars.length} phần tử: ${bars.map((bar) => bar.value).join(", ")}`,
            ...captions,
          ].join("; ")}
          className={cn(
            "relative [--bar-gap:0.125rem] sm:[--bar-gap:0.25rem]",
            className,
          )}
        >
          {range !== undefined && (
            <div
              aria-hidden="true"
              className="absolute top-6 -bottom-1 rounded-lg bg-state-pointer/10 ring-1 ring-state-pointer/40 ring-inset transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
              style={getRangeStyle(range, bars.length)}
            />
          )}
          <div className="relative flex h-full items-stretch gap-(--bar-gap)">
            {bars.map((bar, position) => (
              <m.div
                key={bar.id}
                layout="position"
                transition={SLIDE_TRANSITION}
                className={cn(
                  "relative min-w-0 flex-1",
                  bar.tone === "swap" && "z-10",
                )}
              >
                <m.div
                  animate={{ scale: bar.tone === "swap" ? LIFT_KEYFRAMES : 1 }}
                  transition={LIFT_TRANSITION}
                  className="flex h-full flex-col items-center gap-1.5"
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
                    <span
                      className={cn(
                        "h-4 font-mono text-xs leading-4 tabular-nums",
                        bar.tone === "discarded"
                          ? "text-text-muted"
                          : "text-text-secondary",
                      )}
                    >
                      {bar.value}
                    </span>
                  )}
                  {showCaptions && (
                    <span className="flex h-5 items-center gap-0.5 font-mono text-xs leading-none font-semibold whitespace-nowrap text-text-primary">
                      {bar.caption !== undefined && (
                        <>
                          <ArrowUp aria-hidden="true" className="size-3.5" />
                          {bar.caption}
                        </>
                      )}
                    </span>
                  )}
                </m.div>
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
                            className="flex h-5 items-center justify-center font-mono text-xs leading-none font-semibold text-text-primary"
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
              {showCaptions && <div className="h-5" />}
            </div>
          )}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
