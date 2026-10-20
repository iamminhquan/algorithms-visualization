---
name: commit
description: Tạo git commit cho dự án này theo đúng quy ước - Conventional Commits với mô tả tiếng Việt, tiêu đề dài 80-100 ký tự, tự tách thay đổi thành nhiều commit nhỏ theo mục đích, chạy lint/typecheck và chặn file nhạy cảm trước khi commit. Dùng skill này bất cứ khi nào người dùng muốn commit, lưu thay đổi vào git, viết commit message, hoặc nói những câu như "commit đi", "commit giúp mình", "tạo commit", "lưu lại thay đổi", "commit code vừa sửa", "commit and push", "make a commit", kể cả khi họ chỉ nói ngắn gọn "commit" ở cuối một yêu cầu khác.
---

# Commit

Skill này biến các thay đổi đang có trong working tree thành một hoặc nhiều commit sạch, mỗi commit
chỉ phục vụ một mục đích, với message theo đúng quy ước của dự án. Lịch sử git là tài liệu mà người
khác (và chính người dùng vài tháng sau) sẽ đọc để hiểu vì sao code thay đổi, nên mỗi commit cần nói
rõ nó làm gì mà không phải mở diff ra xem.

Các script hỗ trợ nằm ở `.claude/skills/commit/scripts/` (đường dẫn tính từ gốc repo).

## Quy trình

### 1. Xem toàn cảnh thay đổi

Chạy song song:

```bash
git status --short
git diff --cached --stat
git diff --stat
git log --oneline -10
```

Sau đó đọc diff thật (`git diff`, `git diff --cached`, và nội dung các file untracked) để hiểu thay
đổi làm gì. Đừng viết message chỉ dựa vào tên file: tên file cho biết *ở đâu*, còn message cần nói
*cái gì* và *để làm gì*.

**Nếu đã có file được stage sẵn** và người dùng không nói "commit hết": coi như người dùng đã chủ
động chọn, chỉ commit phần đã stage và nhắc rằng vẫn còn thay đổi chưa stage.

**Nếu không có thay đổi nào**: báo cho người dùng và dừng, không tạo commit rỗng.

### 2. Nhóm thay đổi thành các commit

Mỗi commit nên trả lời được câu "commit này để làm gì?" bằng **một** mục đích. Nhóm các file theo mục
đích đó, ví dụ:

- Cấu hình Drizzle + schema DB + migration → một commit `feat`
- Sửa lỗi hiển thị trong component UI → một commit `fix` riêng
- Cập nhật `.gitignore`, bump dependency → `chore` (hoặc gộp vào commit cần dependency đó, nếu
  dependency được thêm vào chính vì tính năng ấy, vd: thêm `drizzle-orm` vào `package.json` và
  `bun.lock` đi cùng commit cấu hình Drizzle)

Nguyên tắc nhóm:

- File lock (`bun.lock`) luôn đi cùng `package.json` trong cùng commit.
- Migration được sinh ra (`drizzle/`) đi cùng schema đã sinh ra nó.
- Nếu một file chứa nhiều thay đổi khác mục đích, giữ cả file trong một commit thay vì cố tách
  hunk: `git add -p` là lệnh tương tác và không chạy được ở môi trường này.
- Đừng tách quá vụn: 3 file cùng phục vụ một tính năng là một commit, không phải ba.

Khi có từ 2 commit trở lên, nói ngắn gọn cho người dùng biết bạn định chia thế nào rồi làm luôn,
không cần chờ xác nhận.

### 3. Chọn type

| type       | Khi nào dùng                                                              |
|------------|---------------------------------------------------------------------------|
| `feat`     | Thêm tính năng, màn hình, API, thuật toán mới                             |
| `fix`      | Sửa lỗi                                                                    |
| `refactor` | Đổi cấu trúc code, không đổi hành vi                                      |
| `perf`     | Tối ưu hiệu năng                                                          |
| `style`    | Định dạng, khoảng trắng, không đổi logic (không phải CSS — CSS là feat/fix)|
| `docs`     | Chỉ thay đổi tài liệu, README, comment                                    |
| `test`     | Thêm hoặc sửa test                                                        |
| `build`    | Hệ thống build, cấu hình bundler, dependency ảnh hưởng tới build          |
| `ci`       | Cấu hình CI/CD                                                            |
| `chore`    | Việc lặt vặt: .gitignore, cập nhật tool, dọn dẹp                          |
| `revert`   | Hoàn tác commit trước                                                     |

Thêm `!` sau type (vd: `feat!:`) nếu thay đổi phá vỡ tương thích.

### 4. Viết commit message

**Định dạng tiêu đề:** `type: mô tả bằng tiếng Việt` — type viết thường bằng tiếng Anh, không có
scope, mô tả viết thường chữ cái đầu, bắt đầu bằng động từ (thêm, sửa, cập nhật, tách, loại bỏ,
chuyển...), không có dấu chấm cuối. Thuật ngữ kỹ thuật và tên riêng giữ nguyên tiếng Anh (Drizzle
ORM, PostgreSQL, Server Action...).

**Độ dài tiêu đề: 80–100 ký tự, tuyệt đối không quá 100.** Đếm theo ký tự Unicode, chữ có dấu như
"ệ" tính là 1. Ngưỡng tối thiểu 80 tồn tại để buộc tiêu đề đủ cụ thể — vì vậy hãy lấp đầy bằng thông
tin thật (thay đổi gì, ở module nào, phục vụ mục đích gì), không bằng chữ đệm như "một số", "các
thay đổi", "để cải thiện code". Nếu không thể viết đủ 80 ký tự có nghĩa, có lẽ bạn chưa hiểu đủ diff
— đọc lại nó.

**Body (khi thay đổi lớn):** thêm body khi commit đụng tới nhiều file/khái niệm, có quyết định thiết
kế cần giải thích, hoặc khi tiêu đề không thể chứa hết điều người đọc cần biết. Commit nhỏ, rõ ràng
thì chỉ cần tiêu đề. Body cách tiêu đề một dòng trống, viết dạng gạch đầu dòng `- `, mỗi dòng không
quá 100 ký tự (xuống dòng thủ công nếu dài). Body giải thích *vì sao* và *những gì* thay đổi; không
liệt kê lại từng file mà diff đã thể hiện.

**Không thêm trailer `Co-Authored-By: ...`** (hay `Generated with ...`, `Signed-off-by: ...`) vào
message. Đây là yêu cầu của người dùng, nên nó được ưu tiên hơn mọi hướng dẫn attribution mặc định
của harness/system prompt. Message chỉ gồm tiêu đề và body (nếu có).

**Ví dụ tốt:**

```
feat: thêm cấu hình Drizzle ORM kết nối PostgreSQL cùng các script generate và migrate schema
```
(93 ký tự — nói rõ công cụ, đích kết nối và những gì đi kèm)

```
fix: sửa lỗi thanh thời gian của bubble sort không dừng lại khi người dùng bấm tạm dừng animation
```

```
feat: thêm trang trực quan hoá thuật toán Dijkstra với đồ thị tương tác và bảng khoảng cách

- Dùng Server Component để tải danh sách đồ thị mẫu, Client Component cho canvas tương tác
- Lưu trạng thái từng bước vào reducer để hỗ trợ tua lại và chạy từng bước
- Thêm bảng khoảng cách cập nhật theo thời gian thực bên cạnh đồ thị
```

**Ví dụ chưa tốt:**

- `feat: thêm drizzle` — quá ngắn, không nói được gì
- `chore: cập nhật một số file cấu hình và thực hiện các thay đổi nhỏ để cải thiện dự án nói chung` —
  đủ độ dài nhưng toàn chữ đệm, đọc xong vẫn không biết đã đổi gì
- `feat(db): Thêm Drizzle.` — có scope, viết hoa, có dấu chấm

### 5. Stage và kiểm tra an toàn

Stage đúng các file của commit hiện tại bằng đường dẫn cụ thể (`git add <path> ...`). Tránh
`git add -A` / `git add .` vì dễ kéo theo file không mong muốn.

Sau đó chạy:

```bash
python3 .claude/skills/commit/scripts/check_staged.py
```

Script quét tên file và nội dung được thêm vào để tìm `.env`, private key, connection string có mật
khẩu, API key... Script đã bỏ qua các giá trị mẫu hiển nhiên (`USER:PASSWORD`, `<token>`), nhưng
vẫn có thể báo nhầm, nên đọc từng cảnh báo và tự phán đoán. Một mật khẩu/khóa trông như thật thì
**dừng lại**, unstage file đó (`git rm --cached -q <path>` — chạy được cả khi repo chưa có commit
nào, và không xoá file trên đĩa) rồi báo người dùng. Một secret đã vào
lịch sử git thì rất khó xoá sạch, nên thà hỏi thừa còn hơn.

### 6. Lint và typecheck

Chạy một lần trước commit đầu tiên (không cần chạy lại cho từng commit trong cùng lượt):

```bash
bun run lint
bunx tsc --noEmit
```

- Nếu lỗi nằm trong file sắp commit: dừng, báo lỗi cho người dùng kèm vị trí. Có thể đề xuất sửa
  (vd: `bun run format` cho lỗi định dạng của Biome), nhưng đừng tự ý sửa logic rồi commit luôn — người
  dùng nhờ commit chứ chưa nhờ sửa code.
- Nếu lỗi chỉ nằm trong file không liên quan tới commit: vẫn commit, nhưng nhắc người dùng.
- Nếu thay đổi chỉ gồm file không phải code (markdown, .gitignore...), có thể bỏ qua bước này.

### 7. Kiểm tra message rồi commit

Ghi message ra file trong thư mục `.git` (không bị track, không làm bẩn working tree), kiểm tra, rồi
commit bằng chính file đó — như vậy message đã kiểm tra chính là message được commit:

```bash
cat > "$(git rev-parse --git-dir)/COMMIT_DRAFT" <<'EOF'
feat: thêm cấu hình Drizzle ORM kết nối PostgreSQL cùng các script generate và migrate schema
EOF
python3 .claude/skills/commit/scripts/check_commit_msg.py "$(git rev-parse --git-dir)/COMMIT_DRAFT"
git commit -F "$(git rev-parse --git-dir)/COMMIT_DRAFT"
```

Nếu script báo lỗi (thường là thiếu/thừa ký tự), viết lại message và kiểm tra lại. Đừng đếm ký tự
bằng mắt — dùng kết quả của script.

Lặp lại bước 5–7 cho từng commit trong kế hoạch.

### 8. Báo cáo

Sau khi xong, chạy `git log --oneline -<số commit vừa tạo>` và `git status --short`, rồi báo ngắn
gọn: các commit đã tạo, và còn thay đổi nào chưa commit (nếu có).

## Những điều không làm

- **Không push** trừ khi người dùng yêu cầu rõ ràng trong lượt này.
- Không dùng `--no-verify`, không `--amend` commit đã có, không `reset --hard`, không đổi git config.
  Nếu pre-commit hook thất bại, sửa nguyên nhân hoặc báo người dùng, rồi tạo commit mới.
