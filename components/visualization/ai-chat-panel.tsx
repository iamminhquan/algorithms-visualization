import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const SUGGESTED_QUESTIONS = [
  "Giải thích bước đang xem",
  "Vì sao hai phần tử này đổi chỗ?",
  "Độ phức tạp của thuật toán là bao nhiêu?",
] as const;

type AiChatPanelProps = {
  className?: string;
};

export function AiChatPanel({ className }: AiChatPanelProps) {
  const headingId = useId();
  const inputId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border-default bg-bg-surface",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-3">
        <Sparkles aria-hidden="true" className="size-4 text-accent-text" />
        <h2 id={headingId} className="text-sm font-medium text-text-primary">
          Trợ lý AI
        </h2>
        <span className="ml-auto rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent-text">
          Sắp ra mắt
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent-text"
          >
            <Bot className="size-4" />
          </span>
          <p className="rounded-xl rounded-tl-sm bg-bg-subtle px-3 py-2 text-sm leading-6 text-text-primary">
            Xin chào! Mình sẽ giải thích từng bước của thuật toán và trả lời câu
            hỏi của bạn. Tính năng này đang được phát triển.
          </p>
        </div>
        <ul aria-label="Câu hỏi gợi ý" className="mt-auto flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <li key={question}>
              <button
                type="button"
                disabled
                className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary disabled:pointer-events-none disabled:opacity-60"
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form className="flex items-center gap-2 border-t border-border-default p-3">
        <label htmlFor={inputId} className="sr-only">
          Câu hỏi cho trợ lý AI
        </label>
        <input
          id={inputId}
          type="text"
          disabled
          placeholder="Hỏi về thuật toán này…"
          className="h-9 min-w-0 flex-1 rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled
          aria-label="Gửi câu hỏi"
          title="Gửi câu hỏi"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-default text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:pointer-events-none disabled:opacity-40"
        >
          <SendHorizontal aria-hidden="true" className="size-4" />
        </button>
      </form>
    </section>
  );
}
