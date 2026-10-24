/**
 * Vai trò của một phần tử trên hình mô phỏng ở bước đang xem. Mỗi tone ứng với một token
 * `state-*` trong `app/globals.css`; feature chỉ chọn tone, còn màu cụ thể do tầng UI quyết định.
 *
 * `default`: Phần tử không tham gia thao tác nào ở bước này.
 * `pivot`: Phần tử làm mốc, ví dụ chốt của Quick Sort.
 * `pointer`: Vị trí một con trỏ đang chỉ tới, ví dụ `low`/`high` của tìm kiếm nhị phân.
 * `sorted`: Phần tử đã nằm ở vị trí cuối cùng.
 * `discarded`: Phần tử đã bị loại khỏi vùng đang xét, ví dụ nửa mảng bị bỏ của tìm kiếm nhị phân.
 * `found`: Phần tử khớp với giá trị cần tìm.
 */
export type VisualTone =
  | "default"
  | "compare"
  | "swap"
  | "pivot"
  | "pointer"
  | "sorted"
  | "discarded"
  | "found";
