export interface IVariable {
  readonly name: string;
  readonly value: number | undefined;
}

export function elementAt(
  array: readonly number[],
  index: number | undefined,
): number | undefined {
  if (index === undefined || index < 0 || index >= array.length) {
    return undefined;
  }
  return array[index];
}
