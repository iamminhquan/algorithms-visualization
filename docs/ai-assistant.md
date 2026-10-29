# Trợ lý AI trên trang mô phỏng

Tài liệu này mô tả toàn bộ tính năng chat với AI đã làm trên nhánh `feature/assistant`: kiến trúc, vai trò từng file, biến môi trường, cách chạy, cách test và những việc còn lại.

# 1. Tính năng

Khung "Trợ lý AI" nằm bên phải hình mô phỏng ở trang `/visualization/[category]/[algorithm]`.

- Người học hỏi bằng tiếng Việt, câu trả lời hiện dần từng chữ (stream).
- Chọn mô hình DeepSeek hoặc Gemini ngay trên khung chat. Nếu mô hình được chọn lỗi trước khi trả chữ, máy chủ tự chuyển sang mô hình còn lại và khung chat ghi rõ "Trả lời bởi Gemini vì DeepSeek chưa sẵn sàng".
- Mỗi câu hỏi gửi kèm ngữ cảnh của bước đang xem: đầu vào, thao tác của bước, trạng thái sau bước, chỉ số (số lần so sánh, hoán đổi...), mã giả và dòng đang chạy. Nhờ vậy câu "Giải thích bước đang xem" được trả lời đúng bước trên màn hình.
- Hỏi AI thì mô phỏng tự tạm dừng; dưới câu hỏi có nhãn "Hỏi ở bước x/y".
- Câu hỏi gợi ý riêng cho nhóm sắp xếp và nhóm tìm kiếm, bấm là gửi.
- Có nút dừng trả lời, nút thử lại khi lỗi, nút cuộc trò chuyện mới.
- Câu trả lời hiển thị Markdown đơn giản (in đậm, danh sách, `code`, khối code), đã chặn HTML thô, ảnh và link `javascript:`.
- Giới hạn 20 câu hỏi mỗi 10 phút cho mỗi IP, đếm bằng Redis.
- Chưa cấu hình API key thì khung chat báo "Trợ lý AI chưa được cấu hình trên máy chủ." thay vì treo.

# 2. Kiến trúc

```
Trình mô phỏng (client) ── biết event đang xem
  │  createStepContext() → IAssistantContext
  ▼
VisualizerFrame ── prop assistant
  ▼
AiChatPanel + useAssistantChat ── giữ hội thoại bằng chatReducer
  │  requestAssistantReply(): POST /api/assistant, đọc stream NDJSON
  ▼
app/api/assistant/route.ts (Route Handler, POST)
  ▼
handleAssistantRequest()
  1. đọc body (tối đa 64 KB) và kiểm tra (validate, validate-context)
  2. giới hạn số câu hỏi theo IP (rate-limit + Redis)
  3. tra tên, mô tả, độ phức tạp thuật toán trong DB (getAlgorithmCatalog)
  4. ghép prompt: system = quy tắc + thông tin thuật toán; câu hỏi cuối = khối ngữ cảnh + câu hỏi
  5. openProviderStream(): thử mô hình được chọn, lỗi trước khi có chữ thì thử mô hình còn lại
  ▼
DeepSeek (Anthropic SDK → https://api.deepseek.com/anthropic)
Gemini   (@google/genai → generativelanguage.googleapis.com)
```

Chiều phụ thuộc giữ đúng quy ước của dự án:

- `engine/assistant/` là TypeScript thuần (kiểu, giới hạn, giao thức stream, reducer hội thoại, dựng ngữ cảnh), dùng chung cho cả client lẫn server, không import React hay SDK nào.
- `features/assistant/` là phần máy chủ: kiểm tra dữ liệu, prompt, gọi SDK, giới hạn tần suất. Chỉ `server.ts` đọc biến môi trường và DB nên chỉ file này có `import "server-only"`; các file còn lại nhận cấu hình qua tham số nên test được bằng `bun test`.
- `components/visualization/` chứa khung chat dùng chung, không biết thuật toán cụ thể nào; ngữ cảnh do từng trình mô phỏng truyền vào.
- Các feature danh mục (`sorting-algorithms`, `searching-algorithms`) chỉ thêm import `engine/assistant` để dựng ngữ cảnh, vẫn không import lẫn nhau.

# 3. File nào làm gì

## `engine/assistant/`

| File                 | Nội dung                                                                                                            |
|----------------------|---------------------------------------------------------------------------------------------------------------------|
| `types.ts`           | `AssistantProviderId` (`deepseek`, `gemini`), tin nhắn, `IAssistantContext`, `IAssistantRequest`                    |
| `limits.ts`          | Mọi giới hạn: độ dài câu hỏi, số tin nhắn lịch sử, kích thước body, kích thước ngữ cảnh, số token đầu ra            |
| `stream-protocol.ts` | Sự kiện stream `start`/`text`/`done`/`error`, mã hoá và đọc NDJSON (ghép dòng bị cắt giữa các chunk), body lỗi JSON |
| `chat.ts`            | `chatReducer` thuần cho hội thoại (gửi, nhận chữ, dừng, lỗi, thử lại, đổi mô hình) và `buildChatHistory`            |
| `context.ts`         | `createStepContext` dựng ngữ cảnh từ vết thực thi và mã giả, `formatStepLabel`                                      |

## `features/assistant/`

| File                        | Nội dung                                                                                |
|-----------------------------|-----------------------------------------------------------------------------------------|
| `validate.ts`               | Kiểm tra body: mô hình, danh sách tin nhắn, độ dài, tin nhắn cuối phải là câu hỏi       |
| `validate-context.ts`       | Kiểm tra từng trường của ngữ cảnh, chỉ giữ trường đã biết                               |
| `guards.ts`                 | Hàm kiểm tra kiểu dùng chung (`isRecord`, `isNonNegativeInteger`, `isShortText`)        |
| `conversation.ts`           | Chuẩn hoá hội thoại: bỏ câu trả lời đứng đầu, gộp tin nhắn liên tiếp cùng vai trò       |
| `prompt.ts`                 | Quy tắc system prompt, thông tin thuật toán, định dạng khối ngữ cảnh, xoá thẻ trùng tên |
| `fallback.ts`               | Mở stream với mô hình được chọn, lỗi trước khi có chữ thì chuyển sang mô hình còn lại   |
| `handler.ts`                | `handleAssistantRequest`: toàn bộ luồng xử lý, trả JSON lỗi hoặc stream NDJSON          |
| `config.ts`                 | Đọc cấu hình từ biến môi trường (truyền vào dạng object nên test được)                  |
| `rate-limit.ts`             | Bộ giới hạn tần suất, bộ đếm trong bộ nhớ, lấy IP từ header, định dạng thời gian chờ    |
| `redis-rate-limit-store.ts` | Bộ đếm trên Redis (`INCR` + `PEXPIRE NX` + `PTTL`), lỗi nhanh khi Redis không chạy      |
| `server.ts`                 | `server-only`: ghép mọi thứ với `process.env`, Redis và DB thật                         |
| `providers/types.ts`        | Hợp đồng `IAssistantProvider`, `AssistantProviderError`, ánh xạ mã HTTP sang loại lỗi   |
| `providers/deepseek.ts`     | Gọi DeepSeek qua Anthropic SDK (`client.messages.stream`)                               |
| `providers/gemini.ts`       | Gọi Gemini qua `@google/genai` (`models.generateContentStream`)                         |
| `providers/index.ts`        | Chỉ tạo các mô hình đã có API key                                                       |

## Giao diện và route

| File                                              | Nội dung                                                                          |
|---------------------------------------------------|-----------------------------------------------------------------------------------|
| `app/api/assistant/route.ts`                      | Route Handler `POST`, chỉ gọi `handleAssistantRequest`                            |
| `components/visualization/ai-chat-panel.tsx`      | Khung chat (Client Component): chọn mô hình, danh sách tin nhắn, ô nhập, gợi ý    |
| `components/visualization/use-assistant-chat.ts`  | Hook nối reducer với client, giữ `AbortController` cho nút dừng                   |
| `components/visualization/assistant-client.ts`    | `requestAssistantReply`: gửi request, đọc stream, chuyển lỗi thành câu tiếng Việt |
| `components/visualization/assistant-markdown.tsx` | Hiển thị Markdown an toàn bằng `react-markdown`                                   |
| `components/visualization/visualizer-frame.tsx`   | Thêm prop `assistant` để truyền ngữ cảnh, gợi ý, hàm tạm dừng cho khung chat      |
| `features/*/components/*-visualizer.tsx`          | Dựng ngữ cảnh của bước đang xem và câu hỏi gợi ý theo danh mục                    |
| `scripts/mock-assistant-server.ts`                | Server giả lập DeepSeek và Gemini để chạy thử khi chưa có API key                 |

# 4. Giao thức `/api/assistant`

Request:

```json
{
  "provider": "deepseek",
  "messages": [
    { "role": "user", "content": "Bubble Sort là gì?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Giải thích bước đang xem" }
  ],
  "context": {
    "algorithmKey": "bubble-sort",
    "input": [38, 27, 43],
    "step": {
      "index": 1,
      "total": 9,
      "description": "Đang so sánh 38 và 27",
      "payload": { "type": "compare", "indices": [0, 1] },
      "state": { "array": [38, 27, 43], "sortedIndices": [] }
    },
    "pseudocode": ["lặp end từ n - 1 giảm về 1", "  lặp i từ 0 đến end - 1"],
    "activeLine": 1,
    "metrics": [{ "label": "So sánh", "value": 1 }]
  }
}
```

`context` có thể bỏ trống. `step.index` đếm từ 0, giao diện và prompt hiển thị từ 1.

Thành công: HTTP 200, `Content-Type: application/x-ndjson`, mỗi dòng là một sự kiện:

```
{"type":"start","provider":"gemini","fallbackFrom":"deepseek"}
{"type":"text","text":"Ở bước này "}
{"type":"text","text":"thuật toán so sánh..."}
{"type":"done","finish":"complete"}
```

`finish` là `complete`, `truncated` (chạm giới hạn token) hoặc `blocked` (mô hình từ chối). Đứt kết nối giữa chừng thì sự kiện cuối là `{"type":"error","code":"interrupted",...}`.

Lỗi trước khi stream trả JSON `{"error":{"code":"...","message":"..."}}`:

| HTTP | `code`                 | Khi nào                                                             |
|------|------------------------|---------------------------------------------------------------------|
| 400  | `invalid-request`      | JSON hỏng, sai cấu trúc, ngữ cảnh sai, thuật toán không có trong DB |
| 413  | `payload-too-large`    | Body lớn hơn 64 KB                                                  |
| 429  | `rate-limited`         | Quá 20 câu hỏi trong 10 phút, có header `Retry-After`               |
| 502  | `provider-unavailable` | Mọi mô hình đều lỗi                                                 |
| 503  | `provider-unavailable` | Mọi mô hình đều bị giới hạn tần suất phía nhà cung cấp              |
| 503  | `not-configured`       | Chưa có API key nào                                                 |

# 5. Prompt và ngữ cảnh

- System prompt gồm các quy tắc cố định (tiếng Việt, ngắn gọn, chỉ về thuật toán, không bịa số liệu, chỉ số mảng từ 0, bước từ 1, Markdown đơn giản), theo sau là tên, danh mục, mô tả và độ phức tạp của thuật toán đọc từ bảng `algorithms`. Không đọc được DB thì vẫn trả lời, chỉ thiếu phần thông tin thuật toán.
- Khối `<ngu_canh_mo_phong>` chỉ gắn vào câu hỏi mới nhất, câu hỏi nằm riêng trong `<cau_hoi>`. Các câu hỏi cũ trong lịch sử không mang ngữ cảnh để tiết kiệm token.
- Dòng mã giả đang chạy được đánh dấu `=>`, giữ nguyên thụt lề.
- Prompt nói rõ khối ngữ cảnh là dữ liệu, không phải chỉ dẫn. Thẻ trùng tên trong dữ liệu người dùng bị xoá, nên người dùng không chèn được chỉ dẫn giả vào khối ngữ cảnh.
- Phần đầu prompt (system) không đổi giữa các câu hỏi trên cùng một thuật toán. Nếu nhà cung cấp có cơ chế tự cache phần đầu prompt thì phần này dùng lại được; phần thay đổi (ngữ cảnh, câu hỏi) nằm ở cuối.
- Câu hỏi bị lỗi (không có câu trả lời) không được gửi lại trong lịch sử, để không bị trộn với câu hỏi sau.

# 6. Mô hình AI

**DeepSeek** dùng Anthropic SDK (`@anthropic-ai/sdk`) gọi tới endpoint tương thích Anthropic của DeepSeek (`https://api.deepseek.com/anthropic`). SDK 1.x gửi key qua `Authorization: Bearer`, code gửi thêm `x-api-key` cho chắc. Key luôn được truyền rõ ràng, nên SDK không tự lấy `ANTHROPIC_API_KEY` hay `ANTHROPIC_BASE_URL` có sẵn trên máy. Model mặc định `deepseek-v4-flash`, đổi bằng `DEEPSEEK_MODEL`.

**Gemini** dùng SDK chính thức `@google/genai`. Tại thời điểm làm, Google không cung cấp endpoint tương thích Anthropic. Muốn dùng Anthropic SDK cho Gemini thì phải dựng thêm một gateway trung gian (LiteLLM...), tức thêm một dịch vụ phải vận hành, nên dùng SDK của Google là đơn giản và ổn định hơn. Model mặc định ghim bản cố định `gemini-3.5-flash`, không dùng alias `gemini-flash-latest`: alias này trỏ tới bản Flash mới nhất, thường bị quá tải (trả 503 "high demand" hoặc treo tới hết thời gian chờ 60 giây rồi mới chuyển sang DeepSeek). Đổi bằng `GEMINI_MODEL`.

Cả hai đều dùng chung giao diện `IAssistantProvider`. Muốn thêm nhà cung cấp khác chỉ cần viết thêm một file trong `providers/`.

- Thời gian chờ mỗi request 60 giây. DeepSeek thử lại tối đa 1 lần với lỗi 408/409/429/5xx và lỗi kết nối (cơ chế của Anthropic SDK), Gemini không thử lại; phần chuyển mô hình lo việc dự phòng.
- Chuyển mô hình chỉ xảy ra trước khi có chữ đầu tiên. Đã stream được một phần rồi mới lỗi thì báo "Câu trả lời bị gián đoạn", không trộn câu trả lời của hai mô hình.
- Người dùng bấm dừng hoặc đóng trang thì request tới nhà cung cấp cũng bị huỷ, không tốn token chạy nền.

# 7. Giới hạn và an toàn

| Giới hạn                             | Giá trị      | Nơi khai báo           |
|--------------------------------------|--------------|------------------------|
| Độ dài một câu hỏi                   | 1000 ký tự   | `MAX_QUESTION_LENGTH`  |
| Độ dài một câu trả lời trong lịch sử | 8000 ký tự   | `MAX_ANSWER_LENGTH`    |
| Số tin nhắn lịch sử mỗi lần gửi      | 12           | `MAX_HISTORY_MESSAGES` |
| Kích thước body                      | 64 KB        | `MAX_REQUEST_BYTES`    |
| Kích thước ngữ cảnh                  | 16 000 ký tự | `MAX_CONTEXT_LENGTH`   |
| Token đầu ra mỗi câu trả lời         | 4096         | `MAX_OUTPUT_TOKENS`    |
| Số câu hỏi mỗi IP                    | 20 / 10 phút | `ASSISTANT_RATE_LIMIT` |

- API key chỉ đọc ở máy chủ (`server.ts` có `import "server-only"`), không có biến nào mang tiền tố `NEXT_PUBLIC_`.
- Bộ đếm tần suất dùng Redis khi có `REDIS_URL`. Redis lỗi hoặc sập thì sau tối đa 2 giây chuyển sang bộ đếm trong bộ nhớ của tiến trình và ghi log; Redis chạy lại thì tự kết nối lại. Không có nơi đếm nào chạy được thì cho qua thay vì chặn người dùng.
- IP lấy từ `x-forwarded-for` (phần đầu) rồi tới `x-real-ip`. Header này chỉ đáng tin khi app chạy sau một proxy tự ghi đè nó (Vercel, Nginx...); chạy thẳng ra Internet thì người dùng có thể giả header.
- Yêu cầu sai định dạng không bị tính lượt và không gọi mô hình.
- `react-markdown` chạy với `skipHtml`, bỏ thẻ `img`, mặc định đã lọc URL nguy hiểm; tiêu đề trong câu trả lời thành đoạn in đậm để không phá thứ tự heading của trang.

# 8. Biến môi trường

| Biến                      | Bắt buộc      | Ý nghĩa                                                                               |
|---------------------------|---------------|---------------------------------------------------------------------------------------|
| `DEEPSEEK_API_KEY`        | Một trong hai | API key DeepSeek                                                                      |
| `GEMINI_API_KEY`          | Một trong hai | API key Gemini (Google AI Studio)                                                     |
| `DEEPSEEK_MODEL`          | Không         | Mặc định `deepseek-v4-flash`                                                          |
| `GEMINI_MODEL`            | Không         | Mặc định `gemini-3.5-flash`                                                           |
| `DEEPSEEK_BASE_URL`       | Không         | Mặc định `https://api.deepseek.com/anthropic`; đổi khi dùng server giả lập hoặc proxy |
| `GEMINI_BASE_URL`         | Không         | Mặc định của SDK; đổi khi dùng server giả lập hoặc proxy                              |
| `REDIS_URL`               | Không         | Có thì đếm lượt hỏi bằng Redis, không có thì đếm trong bộ nhớ                         |
| `DATABASE_URL`            | Có (sẵn có)   | Để tra thông tin thuật toán cho system prompt                                         |
| `MOCK_ASSISTANT_PORT`     | Không         | Cổng của server giả lập, mặc định 4010                                                |
| `MOCK_ASSISTANT_DELAY_MS` | Không         | Độ trễ giữa các từ của server giả lập, mặc định 40                                    |
| `MOCK_ASSISTANT_FAIL`     | Không         | `deepseek` hoặc `gemini`: giả lập mô hình đó bị tắt                                   |

Đặt API key trong `.env.local` (đã nằm trong `.gitignore`), không commit key thật. Chỉ cần một key là trợ lý chạy được; có cả hai thì mô hình này dự phòng cho mô hình kia. Đổi biến môi trường xong phải khởi động lại server.

# 9. Cách chạy

Có API key thật:

```bash
docker compose up -d postgres redis
bun run dev
```

Với `.env.local` chứa `DATABASE_URL`, `DEEPSEEK_API_KEY` và/hoặc `GEMINI_API_KEY`, và `REDIS_URL=redis://:redis@localhost:6379` nếu muốn đếm lượt hỏi bằng Redis.

Chưa có API key, dùng server giả lập. Chạy ở một terminal:

```bash
bun run assistant:mock
```

Rồi chạy app ở terminal khác với các biến sau (giá trị key tuỳ ý vì server giả lập không kiểm tra):

```bash
DEEPSEEK_API_KEY=mock DEEPSEEK_BASE_URL=http://localhost:4010/anthropic GEMINI_API_KEY=mock GEMINI_BASE_URL=http://localhost:4010 bun run dev
```

Muốn xem cơ chế chuyển mô hình thì chạy `MOCK_ASSISTANT_FAIL=deepseek bun run assistant:mock`.

# 10. Cách test

```bash
bun test tests/assistant
```

| File test                              | Kiểm tra                                                                                                  |
|----------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `stream-protocol.test.ts`              | Mã hoá/đọc NDJSON, dòng bị cắt ở mọi vị trí giữa hai chunk, dòng hỏng                                     |
| `validate.test.ts`                     | Mọi trường hợp sai của body                                                                               |
| `validate-context.test.ts`             | Mọi trường hợp sai của ngữ cảnh, bỏ trường lạ                                                             |
| `context.test.ts`                      | Dựng ngữ cảnh từ Bubble Sort và Binary Search thật; ngữ cảnh lớn nhất vẫn hợp lệ                          |
| `prompt.test.ts`                       | Nội dung system prompt, khối ngữ cảnh, đánh dấu dòng mã giả, chặn chèn thẻ                                |
| `conversation.test.ts`, `chat.test.ts` | Chuẩn hoá hội thoại, reducer, lịch sử gửi lên                                                             |
| `fallback.test.ts`                     | Thứ tự thử mô hình, chuyển khi lỗi, dừng ngay khi bị huỷ                                                  |
| `handler.test.ts`                      | Mã HTTP, stream, chuyển mô hình, đứt giữa chừng, huỷ, ngữ cảnh, giới hạn tần suất                         |
| `client.test.ts`                       | Client đọc stream (cả khi byte UTF-8 bị cắt), lỗi HTTP, mất mạng, huỷ                                     |
| `deepseek-provider.test.ts`            | Anthropic SDK thật gọi vào server SSE giả: URL, header, body, lỗi 400–503, huỷ                            |
| `gemini-provider.test.ts`              | `@google/genai` thật gọi vào server SSE giả: URL, body, bỏ phần suy nghĩ, lý do kết thúc, lỗi             |
| `rate-limit.test.ts`                   | Đếm theo cửa sổ thời gian, thời gian chờ, chuyển sang bộ nhớ khi Redis lỗi                                |
| `redis-rate-limit-store.test.ts`       | Chạy `redis-server` thật: đếm, hết hạn, Redis sập rồi chạy lại; tự bỏ qua nếu máy không có `redis-server` |
| `markdown.test.ts`                     | Markdown được hiển thị, HTML thô, ảnh, `javascript:` bị chặn                                              |

Không test nào gọi DeepSeek hay Gemini thật, nên CI không cần API key. Job `check` của CI không có `redis-server`, nên test Redis thật bị bỏ qua ở đó; các test còn lại vẫn chạy.

Ngoài `bun test`, tính năng đã được kiểm tra thủ công bằng Playwright trên cả `next dev` và bản `next build` + `next start`, với Postgres, Redis và server giả lập chạy trong máy:

- Stream đầy đủ, nút dừng (máy chủ huỷ luôn request tới nhà cung cấp), thử lại, cuộc trò chuyện mới.
- DeepSeek lỗi thì tự chuyển sang Gemini; mọi mô hình lỗi thì báo lỗi; đứt giữa chừng thì báo gián đoạn.
- Ngữ cảnh gửi đi đúng bước đang hiện, đúng đầu vào, đúng dòng mã giả; system prompt có tên và độ phức tạp từ DB; hỏi thì mô phỏng tự dừng.
- Hỏi quá 20 lần thì nhận 429 và khung chat hiện thông báo; tắt Redis thì vẫn chạy nhờ bộ đếm trong bộ nhớ.
- Chưa có API key thì khung chat báo chưa cấu hình; gõ dấu cách trong ô chat không kích hoạt phím tắt phát/dừng; mobile không cuộn ngang; giao diện đúng ở cả nền sáng và nền tối.

# 11. Vì sao chưa dùng RabbitMQ

`docker-compose.yml` có sẵn RabbitMQ nhưng trợ lý AI không dùng, vì chưa có việc nào cần tới hàng đợi tin nhắn:

- Chat là luồng hỏi–đáp đồng bộ: người học đang chờ trên trang và câu trả lời được stream thẳng về trong cùng một request HTTP. Đẩy qua hàng đợi thì phải thêm một worker và một kênh đẩy kết quả ngược về trình duyệt (WebSocket hoặc SSE riêng), chậm hơn và phức tạp hơn mà người dùng không được gì thêm.
- Mỗi câu hỏi chỉ là một lần gọi mô hình kéo dài vài giây, không có việc nặng hay việc chạy nền nào để tách ra.
- Việc dự phòng khi mô hình lỗi đã có cơ chế chuyển sang mô hình còn lại, và giới hạn tần suất đã có Redis; hàng đợi không giải quyết thêm vấn đề nào ở đây.
- Thêm RabbitMQ đồng nghĩa với thêm một dịch vụ phải chạy, giám sát và xử lý khi sập, trong khi lợi ích bằng không.

RabbitMQ nên dùng khi có việc không cần trả kết quả ngay, ví dụ: sinh sẵn lời giải thích cho mọi bước của mọi thuật toán, ghi log hội thoại và thống kê token vào DB mà không làm chậm câu trả lời, hay gửi email. Lúc đó producer là route handler, consumer là một worker riêng.

# 12. Việc còn lại

1. **Cấu hình API key** cho DeepSeek và/hoặc Gemini trong `.env.local` (và trên môi trường deploy), rồi thử với key thật. Tên model mặc định (`deepseek-v4-flash`, `gemini-3.5-flash`) lấy theo tài liệu của nhà cung cấp lúc làm; nhà cung cấp đổi tên thì đặt `DEEPSEEK_MODEL` hoặc `GEMINI_MODEL`.
2. **Kiểm tra chất lượng câu trả lời thật**: soạn khoảng 20 câu hỏi mẫu cho mỗi thuật toán, chạy với từng mô hình và chỉnh quy tắc trong `features/assistant/prompt.ts` nếu cần.
3. **Merge nhánh**: `feature/assistant` mới được push lên GitHub, chưa merge vào `dev`. Theo quy trình của dự án thì merge `--no-ff` vào `dev` rồi mở PR `dev` → `main`.
4. **Sau khi có đăng nhập** (hiện `/login` và `/register` mới có giao diện):
   - Lưu hội thoại vào DB.
   - Giới hạn lượt hỏi theo người dùng thay vì theo IP.
   - Thêm nút 👍/👎 cho từng câu trả lời.
   - Ghi số token mỗi lần hỏi để có số liệu cho phần đánh giá trong báo cáo đồ án.
5. **Khi deploy nhiều instance**: bộ đếm trong bộ nhớ (lúc Redis sập) là riêng cho từng instance, nên giới hạn thực tế lỏng hơn. Chỉ tin `x-forwarded-for` khi chạy sau proxy.
6. **CI**: muốn chạy cả test Redis thật trên CI thì thêm service Redis cho job `check`.
7. Khi chạy `next dev`, mỗi lần hot reload module máy chủ có thể tạo thêm một kết nối Redis; chỉ ảnh hưởng môi trường dev.
