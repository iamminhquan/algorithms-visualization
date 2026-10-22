const TREE_EDGES = [
  "M110 40L65 100",
  "M110 40L155 100",
  "M65 100L42 160",
  "M65 100L88 160",
  "M155 100L132 160",
  "M155 100L178 160",
];

const CHILD_NODES = [
  { cx: 65, cy: 100, r: 14 },
  { cx: 155, cy: 100, r: 14 },
  { cx: 42, cy: 160, r: 12 },
  { cx: 88, cy: 160, r: 12 },
  { cx: 132, cy: 160, r: 12 },
  { cx: 178, cy: 160, r: 12 },
];

const DP_COLUMNS = [0, 1, 2, 3, 4];

const DP_ROWS = [0, 1, 2, 3];

const DP_CELL_SIZE = 26;

function getDpCellClassName(row: number, column: number) {
  if (row === DP_ROWS.length - 1 && column === DP_COLUMNS.length - 1) {
    return "fill-state-sorted";
  }
  /*
   * Bảng được điền theo đường chéo: hàng `row` đã tính tới cột `row + 1`.
   */
  return column <= row + 1 ? "fill-state-default" : "fill-bg-surface";
}

export function CoreConceptsIllustration() {
  return (
    <svg
      viewBox="0 0 368 200"
      fill="none"
      className="size-full"
      aria-hidden="true"
    >
      <g className="stroke-border-strong" strokeWidth={2.5}>
        {TREE_EDGES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx={110} cy={40} r={16} className="fill-state-pointer" />
      {CHILD_NODES.map(({ cx, cy, r }) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          className="fill-state-default"
        />
      ))}
      {DP_ROWS.map((row) =>
        DP_COLUMNS.map((column) => (
          <rect
            key={`${row}-${column}`}
            x={214 + column * DP_CELL_SIZE}
            y={48 + row * DP_CELL_SIZE}
            width={DP_CELL_SIZE}
            height={DP_CELL_SIZE}
            strokeWidth={1.5}
            className={`${getDpCellClassName(row, column)} stroke-text-muted`}
          />
        )),
      )}
    </svg>
  );
}
