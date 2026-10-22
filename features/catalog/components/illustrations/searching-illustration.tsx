const BAR_TOPS = [150, 135, 120, 105, 90, 75, 60, 45, 30, 15];

const POINTER_INDEX = 6;

export function SearchingIllustration() {
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
            index === POINTER_INDEX
              ? "fill-state-pointer"
              : "fill-state-default"
          }
        />
      ))}
      <circle
        cx={226}
        cy={62}
        r={30}
        strokeWidth={6}
        className="fill-bg-surface/55 stroke-text-secondary"
      />
      <path
        d="M248 84L278 114"
        strokeWidth={10}
        strokeLinecap="round"
        className="stroke-text-secondary"
      />
    </svg>
  );
}
