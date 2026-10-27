import type { SourceCode } from "@/engine/visualization";

export const BINARY_SEARCH_SOURCE_CODE: SourceCode = {
  cpp: [
    "#include <vector>",
    "",
    "int binarySearch(const std::vector<int>& a, int key) {",
    "    int low = 0;",
    "    int high = static_cast<int>(a.size()) - 1;",
    "    while (low <= high) {",
    "        int mid = low + (high - low) / 2;",
    "        if (a[mid] == key) {",
    "            return mid;",
    "        }",
    "        if (a[mid] < key) {",
    "            low = mid + 1;",
    "        } else {",
    "            high = mid - 1;",
    "        }",
    "    }",
    "    return -1;",
    "}",
  ],
};
