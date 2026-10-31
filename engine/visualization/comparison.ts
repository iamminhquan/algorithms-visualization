export const COMPARISON_PARAMS = { left: "a", right: "b" } as const;

/**
 * Tổng số bước của thanh tua chung.
 */
export function getComparisonTotal(laneTotals: readonly number[]): number {
  return Math.max(0, ...laneTotals);
}

export function getLaneIndex(sharedIndex: number, laneTotal: number): number {
  return Math.min(Math.max(0, sharedIndex), Math.max(0, laneTotal - 1));
}

export function isLaneFinished(
  sharedIndex: number,
  laneTotal: number,
): boolean {
  return laneTotal > 0 && sharedIndex >= laneTotal - 1;
}

export function resolveComparisonPair(
  available: readonly string[],
  left: string | undefined,
  right: string | undefined,
): readonly [string, string] | undefined {
  if (available.length < 2) {
    return undefined;
  }
  const resolvedLeft =
    left !== undefined && available.includes(left) ? left : available[0];
  const resolvedRight =
    right !== undefined && right !== resolvedLeft && available.includes(right)
      ? right
      : available.find((slug) => slug !== resolvedLeft);
  if (resolvedLeft === undefined || resolvedRight === undefined) {
    return undefined;
  }
  return [resolvedLeft, resolvedRight];
}
