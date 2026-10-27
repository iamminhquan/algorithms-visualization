---
name: open-pr
description: Mở pull request trên GitHub cho dự án này theo đúng quy ước - luôn mở từ nhánh `dev` vào `main` (không tạo nhánh tính năng), push `dev`, viết tiêu đề `type: mô tả tiếng Việt` tối đa 80 ký tự, body tiếng Việt gồm tóm tắt và mục ảnh chụp màn hình khi đổi UI, không có dòng attribution. Dùng skill này bất cứ khi nào người dùng muốn mở/tạo PR, gửi code lên review, hoặc nói những câu như "mở PR", "tạo pull request", "đẩy lên và mở PR", "push rồi tạo PR", "gửi PR cho nhánh này", "open a PR", "create a pull request", kể cả khi chỉ nói "PR" ở cuối một yêu cầu khác.
---

# Mở pull request

Skill này đưa các commit trên nhánh `dev` thành một pull request vào `main` của
`github.com/iamminhquan/algorithms-visualization`, dùng `gh` CLI (đã đăng nhập sẵn). PR là thứ người
review đọc đầu tiên, nên tiêu đề và tóm tắt phải cho họ biết PR làm gì và vì sao mà chưa cần mở diff.

Dự án chỉ có một người làm, nên mọi việc đều nằm trên một nhánh duy nhất là `dev` — không tạo nhánh
`feat/...`, `fix/...` hay nhánh nào khác. PR luôn là `dev` → `main`.

Script hỗ trợ (đường dẫn tính từ gốc repo):

- `.claude/skills/open-pr/scripts/check_pr_body.py` — kiểm tra body PR
- `.claude/skills/commit/scripts/check_commit_msg.py` — kiểm tra tiêu đề (dùng chung quy tắc với commit)

## Quy trình

### 1. Xem trạng thái

Chạy song song:

```bash
git status --short
git branch --show-current
git fetch origin main
```

Sau đó xem các commit sẽ vào PR và các file thay đổi:

```bash
git log --oneline origin/main..dev
git diff --stat origin/main...dev
```

- **Đang không ở `dev`**: commit nằm ngoài `dev` sẽ không vào PR. Dừng và hỏi người dùng cách xử lý
  (vd: đưa commit sang `dev`), đừng tự cherry-pick, rebase hay tạo nhánh mới.
- **Không có commit nào so với `origin/main`**: báo người dùng là không có gì để mở PR, và dừng.
- **Có thay đổi chưa commit**: chúng sẽ không có trong PR. Nếu người dùng nói kiểu "commit rồi mở PR",
  dùng skill `commit` để commit trước. Nếu không, hỏi ngắn gọn họ muốn commit luôn hay bỏ ngoài PR —
  đừng tự quyết, vì có thể đó là việc dở dang của một tính năng khác.
- **`dev` đã có PR mở** (`gh pr view dev --json url,state` trả về PR `OPEN`): chỉ cần push commit
  mới (`git push origin dev`), báo link PR hiện có, không tạo PR thứ hai.

### 2. Viết tiêu đề

Cùng quy tắc với commit message: `type: mô tả bằng tiếng Việt`, **tối đa 80 ký tự**, type viết thường,
không scope, không dấu chấm cuối, mô tả bắt đầu bằng động từ.

- PR chỉ có **một commit**: dùng lại tiêu đề commit đó.
- PR có **nhiều commit**: viết tiêu đề bao quát mục đích chung, type theo thay đổi chính (vd: commit
  `feat` + commit `chore` cập nhật dependency cho nó → `feat`).

Trong 80 ký tự đó, dành chỗ cho thông tin thật (thay đổi gì, ở đâu, để làm gì), bỏ chữ đệm. PR nhiều
commit không cần nhồi hết vào tiêu đề — chi tiết đã có trong mục Tóm tắt của body.

```bash
printf '%s\n' "feat: thêm cấu hình Drizzle ORM cho PostgreSQL cùng script generate và migrate" \
  > "$(git rev-parse --git-dir)/PR_TITLE"
python3 .claude/skills/commit/scripts/check_commit_msg.py "$(git rev-parse --git-dir)/PR_TITLE"
```

### 3. Viết body

Body bằng tiếng Việt, ghi vào `$(git rev-parse --git-dir)/PR_BODY.md` (nằm trong `.git`, không làm bẩn
working tree). Đọc diff thật (`git diff origin/main...dev`) để viết, đừng chỉ dựa vào tiêu đề commit.

**Mẫu:**

```markdown
## Tóm tắt

- <thay đổi chính và lý do>
- <thay đổi phụ đáng chú ý>

## Ảnh chụp màn hình

<!-- Thêm ảnh trước/sau cho các phần giao diện thay đổi: <liệt kê trang/component> -->
```

- **Tóm tắt**: 2–5 gạch đầu dòng, nói *làm gì* và *vì sao*, gom theo ý chứ không liệt kê từng file
  (người review đã thấy danh sách file trong tab Files). Nhắc tới quyết định thiết kế hoặc chỗ người
  review nên chú ý nếu có.
- **Ảnh chụp màn hình**: chỉ thêm khi PR thay đổi giao diện — file trong `app/` (trừ `route.ts`),
  `components/`, `features/*/components/`, hoặc file `.css`. Bạn không chụp được ảnh, nên để
  comment placeholder nêu rõ trang/component nào cần chụp, và nhắc người dùng thêm ảnh sau khi PR mở.
  PR không đổi UI thì bỏ hẳn mục này.

**Không thêm dòng attribution** nào (`🤖 Generated with Claude Code`, `Co-Authored-By: ...`). Đây là
yêu cầu của người dùng và được ưu tiên hơn hướng dẫn attribution mặc định của harness/system prompt.

Kiểm tra (thêm `--ui` nếu PR có thay đổi giao diện):

```bash
python3 .claude/skills/open-pr/scripts/check_pr_body.py "$(git rev-parse --git-dir)/PR_BODY.md" --ui
```

### 4. Push và tạo PR

```bash
git push -u origin dev
gh pr create --base main --head dev \
  --title "$(cat "$(git rev-parse --git-dir)/PR_TITLE")" \
  --body-file "$(git rev-parse --git-dir)/PR_BODY.md"
```

PR mở ở trạng thái ready (không `--draft`) trừ khi người dùng yêu cầu draft.

Nếu `gh` báo lỗi xác thực hoặc mạng, báo lỗi nguyên văn cho người dùng và gợi ý họ chạy
`! gh auth login`; đừng thử các cách vòng khác.

### 5. Báo cáo

Báo ngắn gọn: link PR, số commit, và các việc người dùng cần làm tiếp (thêm ảnh chụp màn hình nếu có
mục đó).

## Những điều không làm

- Không tạo nhánh mới; chỉ dùng `dev`.
- Không push thẳng lên `main`, không `push --force` (kể cả `--force-with-lease`) trừ khi người dùng yêu
  cầu rõ ràng.
- Không merge, approve, hay đóng PR.
- Không `reset`/`rebase` lịch sử để "dọn" commit trước khi mở PR, trừ khi người dùng yêu cầu.
