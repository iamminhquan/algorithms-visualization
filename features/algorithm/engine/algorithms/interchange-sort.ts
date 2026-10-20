import type { SortingAlgorithm } from "../types";

export const interchangeSort: SortingAlgorithm = {
  slug: "sap-xep-doi-cho-truc-tiep",
  name: "Sắp xếp đổi chỗ trực tiếp (Interchange Sort)",
  sort(array) {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (array.compare(i, j) > 0) {
          array.swap(i, j);
        }
      }
      array.markSorted(i);
    }
  },
};
