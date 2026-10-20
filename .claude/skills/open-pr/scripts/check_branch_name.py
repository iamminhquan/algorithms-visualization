#!/usr/bin/env python3
"""Kiểm tra tên nhánh theo quy ước của dự án.

Cách dùng:
    python3 check_branch_name.py <tên-nhánh>

Quy tắc:
- Dạng `<type>/<mo-ta>` với type thuộc danh sách prefix cho phép.
- Phần mô tả bằng tiếng Anh, kebab-case: chữ thường a-z, số, nối bằng một dấu gạch ngang.
- Không có ký tự có dấu / tiếng Việt, tổng độ dài không quá 60 ký tự.

Thoát với mã 0 nếu hợp lệ, 1 nếu có lỗi.
"""

import re
import sys

TYPES = ("feat", "fix", "refactor", "perf", "style", "docs", "test", "build", "ci", "chore", "revert")
MAX_LEN = 60
BRANCH_RE = re.compile(rf"^({'|'.join(TYPES)})/[a-z0-9]+(-[a-z0-9]+)*$")


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2

    name = sys.argv[1]
    errors = []
    prefix = name.split("/", 1)[0] if "/" in name else ""

    if prefix not in TYPES:
        errors.append(f"Thiếu prefix hợp lệ. Prefix phải là một trong: {', '.join(t + '/' for t in TYPES)}")
    if not name.isascii():
        errors.append("Tên nhánh có ký tự không phải ASCII (tiếng Việt có dấu?). Viết mô tả bằng tiếng Anh.")
    if not BRANCH_RE.match(name):
        errors.append("Phần sau prefix phải là kebab-case tiếng Anh: chữ thường, số, nối bằng '-' (vd: add-drizzle-config).")
    if len(name) > MAX_LEN:
        errors.append(f"Tên nhánh dài {len(name)} ký tự, tối đa {MAX_LEN}.")

    if errors:
        for e in errors:
            print(f"LỖI: {e}")
        return 1
    print(f"OK: tên nhánh hợp lệ ({len(name)} ký tự).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
