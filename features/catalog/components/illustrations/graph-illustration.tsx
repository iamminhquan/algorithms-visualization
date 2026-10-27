const NODES = {
  a: { cx: 72, cy: 60, className: "fill-state-pointer" },
  b: { cx: 168, cy: 38, className: "fill-state-sorted" },
  c: { cx: 274, cy: 58, className: "fill-state-compare" },
  d: { cx: 300, cy: 146, className: "fill-state-default" },
  e: { cx: 200, cy: 160, className: "fill-state-default" },
  f: { cx: 92, cy: 150, className: "fill-state-sorted" },
  g: { cx: 168, cy: 102, className: "fill-state-default" },
} as const;

type NodeId = keyof typeof NODES;

const EDGES: readonly (readonly [NodeId, NodeId, boolean])[] = [
  ["a", "b", true],
  ["a", "f", true],
  ["b", "c", true],
  ["a", "g", false],
  ["b", "g", false],
  ["g", "e", false],
  ["f", "e", false],
  ["e", "d", false],
  ["c", "d", false],
];

export function GraphIllustration() {
  return (
    <svg
      viewBox="0 0 368 200"
      fill="none"
      className="size-full"
      aria-hidden="true"
    >
      {EDGES.map(([from, to, isVisited]) => (
        <path
          key={`${from}-${to}`}
          d={`M${NODES[from].cx} ${NODES[from].cy}L${NODES[to].cx} ${NODES[to].cy}`}
          strokeWidth={isVisited ? 3 : 2.5}
          strokeLinecap="round"
          className={
            isVisited ? "stroke-text-secondary" : "stroke-border-strong"
          }
        />
      ))}
      {Object.entries(NODES).map(([id, { cx, cy, className }]) => (
        <circle
          key={id}
          cx={cx}
          cy={cy}
          r={15}
          strokeWidth={3}
          className={`${className} stroke-bg-subtle`}
        />
      ))}
    </svg>
  );
}
