#!/usr/bin/env python3
"""Kiểm tra body PR theo quy ước của dự án.

Cách dùng:
    python3 check_pr_body.py <file-body.md> [--ui]

Quy tắc:
- Có mục `## Tóm tắt` với ít nhất một gạch đầu dòng.
- Nếu truyền `--ui` (PR có thay đổi giao diện): phải có mục `## Ảnh chụp màn hình`.
- Không có dòng attribution ("Generated with Claude Code", "Co-Authored-By:"...).

Thoát với mã 0 nếu hợp lệ, 1 nếu có lỗi.
"""

import re
import sys

ATTRIBUTION_RE = re.compile(r"(?im)^.*(generated with \[?claude|co-authored-by:|🤖).*$")


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        return 2
    has_ui = "--ui" in sys.argv[1:]
    body = open(args[0], encoding="utf-8").read()

    errors = []
    summary = re.search(r"(?ms)^## Tóm tắt\s*\n(.*?)(?=^## |\Z)", body)
    if not summary:
        errors.append("Thiếu mục `## Tóm tắt`.")
    elif not re.search(r"(?m)^- \S", summary.group(1)):
        errors.append("Mục `## Tóm tắt` cần ít nhất một gạch đầu dòng `- ...`.")
    if has_ui and not re.search(r"(?m)^## Ảnh chụp màn hình", body):
        errors.append("PR có thay đổi UI nhưng thiếu mục `## Ảnh chụp màn hình`.")
    for m in ATTRIBUTION_RE.finditer(body):
        errors.append(f"Có dòng attribution, dự án không dùng: {m.group(0).strip()}")

    if errors:
        for e in errors:
            print(f"LỖI: {e}")
        return 1
    print("OK: body PR hợp lệ.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
