export const COMPARISON_PARAMS = ["a", "b", "c", "d"] as const;

export const COMPARISON_LANE_COUNT = COMPARISON_PARAMS.length;

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

export function resolveComparisonLanes(
  available: readonly string[],
  requested: readonly (string | undefined)[],
): readonly string[] | undefined {
  if (available.length < 2) {
    return undefined;
  }
  const limit = Math.min(COMPARISON_LANE_COUNT, available.length);
  const lanes: string[] = [];
  for (const slug of requested) {
    if (lanes.length >= limit) {
      break;
    }
    if (
      slug !== undefined &&
      available.includes(slug) &&
      !lanes.includes(slug)
    ) {
      lanes.push(slug);
    }
  }
  for (const slug of available) {
    if (lanes.length >= limit) {
      break;
    }
    if (!lanes.includes(slug)) {
      lanes.push(slug);
    }
  }
  return lanes;
}
