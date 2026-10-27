import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { type ComponentProps, useId } from "react";
import { isAtEnd, PLAYBACK_SPEEDS } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import type { IPlaybackControls } from "./use-playback";
import {
  PLAYBACK_SHORTCUTS,
  usePlaybackShortcuts,
} from "./use-playback-shortcuts";

type PlaybackControlsProps = {
  controls: IPlaybackControls;
  className?: string;
};

export function PlaybackControls({
  controls,
  className,
}: PlaybackControlsProps) {
  const sliderId = useId();
  const speedId = useId();
  const { state } = controls;
  usePlaybackShortcuts(controls);
  const lastIndex = Math.max(state.totalEvents - 1, 0);
  const atStart = state.index === 0;
  const atEnd = isAtEnd(state);
  const playing = state.status === "playing";
  const step = state.totalEvents === 0 ? 0 : state.index + 1;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border-default bg-bg-surface p-3",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <ControlButton
          icon={ChevronLeft}
          label="Bước trước"
          aria-keyshortcuts={PLAYBACK_SHORTCUTS.stepBack}
          disabled={atStart}
          onClick={controls.stepBack}
        />
        {playing ? (
          <ControlButton
            icon={Pause}
            label="Tạm dừng"
            aria-keyshortcuts={PLAYBACK_SHORTCUTS.toggle}
            variant="primary"
            onClick={controls.pause}
          />
        ) : (
          <ControlButton
            icon={atEnd && state.totalEvents > 1 ? RotateCcw : Play}
            label={atEnd && state.totalEvents > 1 ? "Phát lại" : "Phát"}
            aria-keyshortcuts={PLAYBACK_SHORTCUTS.toggle}
            variant="primary"
            disabled={state.totalEvents <= 1}
            onClick={controls.play}
          />
        )}
        <ControlButton
          icon={ChevronRight}
          label="Bước sau"
          aria-keyshortcuts={PLAYBACK_SHORTCUTS.stepForward}
          disabled={atEnd}
          onClick={controls.stepForward}
        />
      </div>

      <div className="flex min-w-48 flex-1 items-center gap-3">
        <label htmlFor={sliderId} className="sr-only">
          Tua tới bước
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={lastIndex}
          value={state.index}
          disabled={state.totalEvents <= 1}
          aria-valuetext={`Bước ${step} trên ${state.totalEvents}`}
          onChange={(event) => controls.seek(event.currentTarget.valueAsNumber)}
          className="h-2 flex-1 cursor-pointer accent-accent-default disabled:cursor-not-allowed"
        />
        <span className="shrink-0 font-mono text-sm text-text-secondary tabular-nums">
          {step}/{state.totalEvents}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={speedId} className="text-sm text-text-secondary">
          Tốc độ
        </label>
        <div className="relative">
          <select
            id={speedId}
            value={state.speed}
            onChange={(event) => {
              const speed = PLAYBACK_SPEEDS.find(
                (option) => option === Number(event.currentTarget.value),
              );
              if (speed !== undefined) {
                controls.setSpeed(speed);
              }
            }}
            className="h-9 cursor-pointer appearance-none rounded-lg border border-border-strong bg-bg-surface pr-8 pl-3 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          >
            {PLAYBACK_SPEEDS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-text-secondary"
          />
        </div>
      </div>
    </div>
  );
}

const variants = {
  primary: "bg-accent-default text-accent-on hover:bg-accent-hover",
  ghost: "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
};

type ControlButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: LucideIcon;
  label: string;
  variant?: keyof typeof variants;
};

function ControlButton({
  icon: Icon,
  label,
  variant = "ghost",
  type = "button",
  className,
  ...props
}: ControlButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-10 items-center justify-center rounded-lg transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}
