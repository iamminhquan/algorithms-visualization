import type { SourceCode } from "@/engine/visualization";

export const LINEAR_SEARCH_SOURCE_CODE: SourceCode = {
  cpp: [
    "#include <vector>",
    "",
    "int linearSearch(const std::vector<int>& a, int key) {",
    "    int n = static_cast<int>(a.size());",
    "    for (int i = 0; i < n; i++) {",
    "        if (a[i] == key) {",
    "            return i;",
    "        }",
    "    }",
    "    return -1;",
    "}",
  ],
};
