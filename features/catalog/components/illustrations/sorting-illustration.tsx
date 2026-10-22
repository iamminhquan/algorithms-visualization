const BAR_TOPS = [140, 120, 100, 80, 40, 90, 60, 30, 20, 10];

const SWAPPING_INDICES = [4, 5];

export function SortingIllustration() {
  return (
    <svg
      viewBox="0 0 368 200"
      fill="none"
      className="size-full"
      aria-hidden="true"
    >
      {BAR_TOPS.map((top, index) => (
        <rect
          key={top}
          x={49 + index * 28}
          y={top}
          width={18}
          height={170 - top}
          rx={3}
          className={
            SWAPPING_INDICES.includes(index)
              ? "fill-state-swap"
              : "fill-state-default"
          }
        />
      ))}
      <g
        className="stroke-text-secondary"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M170 32C172 8 196 8 198 80" />
        <path d="M192 71L198 81L204 71" />
      </g>
    </svg>
  );
}
