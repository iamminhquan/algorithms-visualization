import type { SourceCode } from "@/engine/visualization";

export const LINEAR_SEARCH_SOURCE_CODE: SourceCode = {
  cpp: [
    "#include <iostream>",
    "",
    "int linear_search(const int a[], int n, int key) {",
    "    for (int i = 0; i < n; i++) {",
    "        if (a[i] == key) {",
    "            return i;",
    "        }",
    "    }",
    "    return -1;",
    "}",
    "",
    "int main() {",
    "    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64};",
    "    int n = static_cast<int>(sizeof(a) / sizeof(a[0]));",
    "    int key = 19;",
    "    int index = linear_search(a, n, key);",
    "    if (index != -1) {",
    '        std::cout << "Found " << key << " at index " << index << \'\\n\';',
    "    } else {",
    "        std::cout << key << \" not found\" << '\\n';",
    "    }",
    "    return 0;",
    "}",
  ],
};
