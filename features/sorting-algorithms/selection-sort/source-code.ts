import type { SourceCode } from "@/engine/visualization";

export const SELECTION_SORT_SOURCE_CODE: SourceCode = {
  cpp: [
    "#include <utility>",
    "#include <vector>",
    "",
    "void selectionSort(std::vector<int>& a) {",
    "    int n = static_cast<int>(a.size());",
    "    for (int i = 0; i < n - 1; i++) {",
    "        int min = i;",
    "        for (int j = i + 1; j < n; j++) {",
    "            if (a[j] < a[min]) {",
    "                min = j;",
    "            }",
    "        }",
    "        if (min != i) {",
    "            std::swap(a[i], a[min]);",
    "        }",
    "    }",
    "}",
  ],
};
