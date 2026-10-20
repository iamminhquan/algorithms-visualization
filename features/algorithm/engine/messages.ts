export const initMessage = (n: number): string =>
  `Bắt đầu với mảng gồm ${n} phần tử`;

export const compareMessage = (
  a: readonly number[],
  i: number,
  j: number,
): string => `So sánh a[${i}] = ${a[i]} và a[${j}] = ${a[j]}`;

// `a` là mảng trước khi đổi chỗ.
export const swapMessage = (
  a: readonly number[],
  i: number,
  j: number,
): string => `Hoán đổi a[${i}] và a[${j}] (${a[i]} ↔ ${a[j]})`;

export const markSortedMessage = (a: readonly number[], i: number): string =>
  `a[${i}] = ${a[i]} đã nằm đúng vị trí`;

export const doneMessage = (comparisons: number, swaps: number): string =>
  `Hoàn tất: ${comparisons} lần so sánh, ${swaps} lần hoán đổi`;
