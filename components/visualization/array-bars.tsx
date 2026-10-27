import { ArrowUp } from "lucide-react";
import { domMax, LazyMotion, MotionConfig, m } from "motion/react";
import { scaleBarHeights, type VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { TONE_BACKGROUND, TONE_BORDER } from "./tones";

const MAX_LABELED_BARS = 20;
const SLIDE_TRANSITION = { type: "spring", bounce: 0, duration: 0.3 } as const;
const LIFT_KEYFRAMES = [1, 1.12, 1];
const LIFT_TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;
const MARKER_HEIGHT_REM = 1.25;
const MARKER_GAP_REM = 0.125;
const HEADROOM_REM = 4.5;

export interface IBarMarker {
  readonly label: string;
  readonly tone: VisualTone;
}

export interface IBarBracket {
  readonly from: number;
  readonly to: number;
  readonly label: string;
  readonly tone: VisualTone;
}

export interface IBarRange {
  readonly from: number;
  readonly to: number;
}

export interface IArrayBar {
  readonly id: number;
  readonly value: number;
  readonly tone: VisualTone;
  readonly markers?: readonly IBarMarker[];
  readonly caption?: string;
}

type ArrayBarsProps = {
  bars: readonly IArrayBar[];
  bracket?: IBarBracket;
  range?: IBarRange;
  captionRow?: boolean;
  className?: string;
};

const RANGE_PADDING_REM = 0.25;

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
