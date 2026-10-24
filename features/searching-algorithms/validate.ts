import type { ISearchInput } from "./types";

/**
 * Kiểm tra đầu vào chung của mọi thuật toán tìm kiếm.
 *
 * @param input Đầu vào cần kiểm tra.
 * @throws {RangeError} Khi `target` hoặc một phần tử của mảng là NaN.
 */
export function assertSearchInput(input: ISearchInput): void {
  /*
   * `NaN === NaN` là sai nên tìm NaN luôn ra "không tìm thấy", còn phần tử NaN làm hỏng
   * phép so sánh lớn hơn, nhỏ hơn của tìm kiếm nhị phân mà không báo lỗi.
   */
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
