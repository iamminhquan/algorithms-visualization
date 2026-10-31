const NEARLY_SORTED_FIRST_SWAP = 1;
const NEARLY_SORTED_SWAP_STRIDE = 4;

export function sortAscending(values: readonly number[]): readonly number[] {
  return [...values].sort((a, b) => a - b);
}

export function sortDescending(values: readonly number[]): readonly number[] {
  return [...values].sort((a, b) => b - a);
}

export function nearlySorted(values: readonly number[]): readonly number[] {
  const result = [...sortAscending(values)];
  for (
    let index = NEARLY_SORTED_FIRST_SWAP;
    index + 1 < result.length;
    index += NEARLY_SORTED_SWAP_STRIDE
  ) {
    const current = result[index];
    const next = result[index + 1];
    if (current === undefined || next === undefined) {
      continue;
    }
    result[index] = next;
    result[index + 1] = current;
  }
  return result;
}
