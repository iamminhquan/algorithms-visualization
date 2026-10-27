import type { ISearchInput } from "./types";

export function assertSearchInput(input: ISearchInput): void {
  if (Number.isNaN(input.target)) {
    throw new RangeError("Giá trị cần tìm không phải là số (NaN)");
  }
  for (const [index, value] of input.array.entries()) {
    if (Number.isNaN(value)) {
      throw new RangeError(
        `Phần tử tại vị trí ${index} không phải là số (NaN)`,
      );
    }
  }
}
