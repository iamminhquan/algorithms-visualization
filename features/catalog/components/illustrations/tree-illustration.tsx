const NODES = [
  { id: 0, cx: 184, cy: 36, parent: null },
  { id: 1, cx: 112, cy: 92, parent: 0 },
  { id: 2, cx: 256, cy: 92, parent: 0 },
  { id: 3, cx: 72, cy: 152, parent: 1 },
  { id: 4, cx: 152, cy: 152, parent: 1 },
  { id: 5, cx: 216, cy: 152, parent: 2 },
  { id: 6, cx: 296, cy: 152, parent: 2 },
] as const;

const SEARCH_PATH: readonly number[] = [0, 1, 4];

const FOUND_NODE = SEARCH_PATH[SEARCH_PATH.length - 1];

function getNodeClassName(id: number) {
  if (id === FOUND_NODE) {
    return "fill-state-found";
  }
  return SEARCH_PATH.includes(id) ? "fill-state-compare" : "fill-state-default";
}

export function TreeIllustration() {
  return (
    <svg
      viewBox="0 0 368 200"
      fill="none"
      className="size-full"
      aria-hidden="true"
    >
      {NODES.map((node) => {
        if (node.parent === null) {
          return null;
        }
        const parent = NODES[node.parent];
        const isOnPath =
          SEARCH_PATH.includes(node.id) && SEARCH_PATH.includes(parent.id);
        return (
          <path
            key={node.id}
            d={`M${parent.cx} ${parent.cy}L${node.cx} ${node.cy}`}
            strokeWidth={isOnPath ? 3 : 2.5}
            strokeLinecap="round"
            className={
              isOnPath ? "stroke-text-secondary" : "stroke-border-strong"
            }
          />
        );
      })}
      {NODES.map((node) => (
        <circle
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          r={node.parent === null ? 18 : 16}
          className={getNodeClassName(node.id)}
        />
      ))}
    </svg>
  );
}
