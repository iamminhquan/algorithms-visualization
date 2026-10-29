import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AssistantMarkdown } from "@/components/visualization/assistant-markdown";

function render(content: string): string {
  return renderToStaticMarkup(createElement(AssistantMarkdown, { content }));
}

describe("AssistantMarkdown", () => {
  test("hiển thị in đậm, danh sách và code", () => {
    const html = render(
      "Mảng **đã sắp xếp**.\n\n- Ý một có `a[i]`\n- Ý hai\n\n```cpp\nswap(a, b);\n```",
    );
    expect(html).toContain('<strong class="font-semibold">đã sắp xếp</strong>');
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain(">a[i]</code>");
    expect(html).toContain("<pre");
    expect(html).toContain("swap(a, b);");
  });

  test("không render HTML thô do mô hình trả về", () => {
    const html = render(
      'Xin chào <script>alert(1)</script><b onclick="x">hi</b>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("<b");
  });

  test("không hiển thị ảnh trong câu trả lời", () => {
    const html = render("![sơ đồ](https://example.com/a.png)");
    expect(html).not.toContain("<img");
  });

  test("link mở tab mới, không cho chạy javascript:", () => {
    const safe = render("[tài liệu](https://example.com)");
    expect(safe).toContain('href="https://example.com"');
    expect(safe).toContain('target="_blank"');
    expect(safe).toContain('rel="noreferrer"');
    const unsafe = render("[bấm](javascript:alert(1))");
    expect(unsafe).not.toContain("javascript:");
  });

  test("tiêu đề thành đoạn in đậm để không phá thứ tự heading của trang", () => {
    const html = render("# Tiêu đề\n\n## Mục");
    expect(html).not.toMatch(/<h[1-6]/);
    expect(html).toContain(
      '<p class="font-semibold text-text-primary">Tiêu đề</p>',
    );
  });

  test("Markdown dở dang khi đang stream vẫn render được", () => {
    expect(() => render("Đang **in đậm dở\n\n- mục")).not.toThrow();
    expect(() => render("```cpp\nint a")).not.toThrow();
  });
});
