#!/usr/bin/env python3
"""Quét các file đang được stage để tìm file/nội dung nhạy cảm.

Cách dùng (chạy trong repo, sau khi `git add`):
    python3 check_staged.py

Thoát với mã 0 nếu không phát hiện gì, 1 nếu có cảnh báo.
Đây là lưới an toàn bằng heuristic: nó có thể báo nhầm (vd: giá trị mẫu trong .env.example)
và có thể bỏ sót. Đọc cảnh báo và tự phán đoán, đừng tin mù quáng.
"""

import re
import subprocess
import sys
from fnmatch import fnmatch

# File không nên commit, kể cả khi đã bị ép `git add -f`.
SENSITIVE_NAMES = [
    ".env", ".env.*", "*.pem", "*.key", "*.p12", "*.pfx", "id_rsa*", "id_ed25519*",
    "*.keystore", "credentials*.json", "service-account*.json", ".npmrc", ".pypirc",
]
SAFE_NAMES = [".env.example", ".env.sample", ".env.template"]

# Mẫu nội dung trông giống bí mật thật.
SECRET_PATTERNS = {
    "connection string có mật khẩu": re.compile(r"\b(postgres(ql)?|mysql|mongodb(\+srv)?|redis)://[^:\s/]+:[^@\s]{3,}@"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "private key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "API key dạng sk-/ghp_/xox": re.compile(r"\b(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|xox[abpr]-[A-Za-z0-9-]{10,})"),
    "gán secret/password/token": re.compile(
        r"(?i)\b(secret|password|passwd|api_?key|access_?token|auth_?token)\b\s*[:=]\s*['\"]?[A-Za-z0-9/+_\-]{12,}"
    ),
}

# Giá trị mẫu hiển nhiên (USER:PASSWORD, <token>, xxx, changeme...) thì bỏ qua.
PLACEHOLDER_RE = re.compile(
    r"(?i)(://[A-Z_]+:[A-Z_]+@|<[^>]+>|\$\{[^}]+\}|x{4,}|changeme|your[_-]?(secret|password|key|token))"
)


def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def main() -> int:
    files = [f for f in git("diff", "--cached", "--name-only", "--diff-filter=ACMR").splitlines() if f]
    if not files:
        print("Không có file nào đang được stage.")
        return 0

    warnings = []
    for path in files:
        base = path.rsplit("/", 1)[-1]
        if any(fnmatch(base, p) for p in SENSITIVE_NAMES) and base not in SAFE_NAMES:
            warnings.append(f"{path}: tên file thuộc loại nhạy cảm, không nên commit.")

    # Chỉ quét các dòng được thêm vào trong diff đã stage.
    current = None
    for line in git("diff", "--cached", "-U0", "--no-color").splitlines():
        if line.startswith("+++ b/"):
            current = line[6:]
        elif line.startswith("+") and not line.startswith("+++"):
            if PLACEHOLDER_RE.search(line):
                continue
            for label, pattern in SECRET_PATTERNS.items():
                if pattern.search(line):
                    warnings.append(f"{current}: có thể chứa {label}: {line[1:80].strip()}")

    if warnings:
        print("CẢNH BÁO: phát hiện nội dung có thể nhạy cảm trong các file đã stage:")
        for w in warnings:
            print(f"  - {w}")
        return 1
    print(f"OK: đã quét {len(files)} file đã stage, không phát hiện nội dung nhạy cảm.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
