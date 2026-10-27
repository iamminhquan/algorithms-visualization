export const MIN_BAR_HEIGHT_PERCENT = 8;

export function scaleBarHeights(values: readonly number[]): readonly number[] {
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  const span = high - low;
  if (span === 0) {
    return values.map(() => MIN_BAR_HEIGHT_PERCENT);
  }
  return values.map(
    (value) =>
      MIN_BAR_HEIGHT_PERCENT +
      ((value - low) / span) * (100 - MIN_BAR_HEIGHT_PERCENT),
  );
}
