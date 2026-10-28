export function assertSortInput(
  input: readonly number[],
  maxLength: number,
): void {
  if (input.length > maxLength) {
    throw new RangeError(
      `Dữ liệu đầu vào có ${input.length} phần tử, vượt quá giới hạn ${maxLength}`,
    );
  }

  for (const [index, value] of input.entries()) {
    if (Number.isNaN(value)) {
      throw new RangeError(
        `Phần tử tại vị trí ${index} không phải là số (NaN)`,
      );
    }
  }
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, offset) => start + offset);
}
