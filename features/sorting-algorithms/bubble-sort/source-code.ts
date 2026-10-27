import type { SourceCode } from "@/engine/visualization";

export const BUBBLE_SORT_SOURCE_CODE: SourceCode = {
  cpp: [
    "#include <utility>",
    "#include <vector>",
    "",
    "void bubbleSort(std::vector<int>& a) {",
    "    int n = static_cast<int>(a.size());",
    "    for (int end = n - 1; end >= 1; end--) {",
    "        bool swapped = false;",
    "        for (int i = 0; i < end; i++) {",
    "            if (a[i] > a[i + 1]) {",
    "                std::swap(a[i], a[i + 1]);",
    "                swapped = true;",
    "            }",
    "        }",
    "        if (!swapped) {",
    "            break;",
    "        }",
    "    }",
    "}",
  ],
};
