const NODE_XS = [51, 139, 227];

const CELL_XS = [48, 82, 116, 150, 184, 218, 252, 286];

const HIGHLIGHTED_CELL_XS = [116, 218];

export function DataStructureIllustration() {
  const lastNodeX = NODE_XS[NODE_XS.length - 1];

  return (
    <svg
      viewBox="0 0 368 200"
      fill="none"
      className="size-full"
      aria-hidden="true"
    >
      {NODE_XS.map((x) => (
        <g key={x}>
          <rect
            x={x}
            y={40}
            width={60}
            height={36}
            rx={4}
            className="fill-bg-surface"
          />
          <path
            d={`M${x + 40} 40H${x + 56}a4 4 0 0 1 4 4V72a4 4 0 0 1-4 4H${x + 40}Z`}
            className="fill-state-default"
          />
          <rect
            x={x}
            y={40}
            width={60}
            height={36}
            rx={4}
            strokeWidth={2}
            className="stroke-border-strong"
          />
          <path
            d={`M${x + 40} 40V76`}
            strokeWidth={2}
            className="stroke-border-strong"
          />
          <circle cx={x + 50} cy={58} r={3} className="fill-text-secondary" />
        </g>
      ))}
      <g
        className="stroke-text-secondary"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {NODE_XS.slice(0, -1).map((x) => (
          <g key={x}>
            <path d={`M${x + 50} 58H${x + 86}`} />
            <path d={`M${x + 80} 52L${x + 86} 58L${x + 80} 64`} />
          </g>
        ))}
        {lastNodeX !== undefined && (
          <>
            <path d={`M${lastNodeX + 50} 58H${lastNodeX + 80}`} />
            <path
              d={`M${lastNodeX + 82} 48V68M${lastNodeX + 88} 52V64M${lastNodeX + 94} 56V60`}
            />
          </>
        )}
      </g>
      {CELL_XS.map((x) => (
        <rect
          key={x}
          x={x}
          y={120}
          width={34}
          height={34}
          strokeWidth={2}
          className={
            HIGHLIGHTED_CELL_XS.includes(x)
              ? "fill-state-pointer stroke-border-strong"
              : "fill-bg-surface stroke-border-strong"
          }
        />
      ))}
    </svg>
  );
}
