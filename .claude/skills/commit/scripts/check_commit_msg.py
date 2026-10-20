#!/usr/bin/env python3
"""Kiểm tra commit message theo quy ước của dự án.

Cách dùng:
    python3 check_commit_msg.py <file-chứa-message>
    echo "feat: ..." | python3 check_commit_msg.py -

Quy tắc:
- Dòng tiêu đề: `type: mô tả`, type thuộc danh sách cho phép.
- Dòng tiêu đề dài từ 80 đến 100 ký tự (đếm theo ký tự Unicode, không phải byte).
- Nếu có body: dòng thứ 2 phải để trống, mỗi dòng body không quá 100 ký tự.
- Không có trailer attribution (Co-Authored-By:, Signed-off-by:, "Generated with ...").

Thoát với mã 0 nếu hợp lệ, 1 nếu có lỗi (in ra từng lỗi kèm gợi ý).
"""

import re
import sys
import unicodedata

TYPES = ("feat", "fix", "refactor", "perf", "style", "docs", "test", "build", "ci", "chore", "revert")
SUBJECT_MIN = 80
SUBJECT_MAX = 100
BODY_MAX = 100

SUBJECT_RE = re.compile(rf"^({'|'.join(TYPES)})(!)?: \S.*$")
ATTRIBUTION_RE = re.compile(r"(?i)^\s*(co-authored-by:|signed-off-by:|.*generated with \[?claude)")


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2

    raw = sys.stdin.read() if sys.argv[1] == "-" else open(sys.argv[1], encoding="utf-8").read()
    # NFC để "ệ" gõ kiểu tổ hợp (e + dấu) vẫn được tính là 1 ký tự.
    text = unicodedata.normalize("NFC", raw)
    # Bỏ các dòng comment mà git sẽ tự loại bỏ.
    lines = [line for line in text.rstrip("\n").split("\n") if not line.startswith("#")]

    errors = []
    if not lines or not lines[0].strip():
        print("LỖI: message trống.")
        return 1

    subject = lines[0]
    n = len(subject)
    if not SUBJECT_RE.match(subject):
        errors.append(
            f"Tiêu đề phải có dạng `type: mô tả` với type ∈ {{{', '.join(TYPES)}}} "
            "(viết thường, một dấu cách sau dấu hai chấm)."
        )
    if subject != subject.strip():
        errors.append("Tiêu đề có khoảng trắng thừa ở đầu hoặc cuối.")
    if subject.rstrip().endswith("."):
        errors.append("Tiêu đề không kết thúc bằng dấu chấm.")
    if n < SUBJECT_MIN:
        errors.append(
            f"Tiêu đề có {n} ký tự, thiếu {SUBJECT_MIN - n} so với tối thiểu {SUBJECT_MIN}. "
            "Thêm thông tin cụ thể (thay đổi gì, ở đâu, để làm gì), không thêm chữ đệm."
        )
    if n > SUBJECT_MAX:
        errors.append(
            f"Tiêu đề có {n} ký tự, vượt {n - SUBJECT_MAX} so với tối đa {SUBJECT_MAX}. "
            "Rút gọn hoặc chuyển chi tiết xuống body."
        )

    if len(lines) > 1:
        if lines[1].strip():
            errors.append("Dòng thứ 2 phải để trống để tách tiêu đề với body.")
        for i, line in enumerate(lines[2:], start=3):
            if ATTRIBUTION_RE.match(line):
                errors.append(f"Dòng {i} là trailer attribution, dự án không dùng: {line.strip()}")
            if len(line) > BODY_MAX:
                errors.append(f"Dòng {i} có {len(line)} ký tự, vượt tối đa {BODY_MAX}: {line[:40]}...")

    print(f"Tiêu đề: {n} ký tự (yêu cầu {SUBJECT_MIN}-{SUBJECT_MAX})")
    if errors:
        for e in errors:
            print(f"LỖI: {e}")
        return 1
    print("OK: commit message hợp lệ.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
