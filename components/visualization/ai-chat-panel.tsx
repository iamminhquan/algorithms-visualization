"use client";

import {
  Bot,
  CircleAlert,
  SendHorizontal,
  Sparkles,
  Square,
  SquarePen,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Select } from "@/components/ui/select";
import {
  ASSISTANT_PROVIDER_LABELS,
  ASSISTANT_PROVIDERS,
  formatStepLabel,
  type IAssistantContext,
  type IChatMessage,
  isAssistantProviderId,
  MAX_QUESTION_LENGTH,
} from "@/engine/assistant";
import { cn } from "@/lib/cn";
import { AssistantMarkdown } from "./assistant-markdown";
import { useAssistantChat } from "./use-assistant-chat";

export const DEFAULT_SUGGESTED_QUESTIONS: readonly string[] = [
  "Giải thích bước đang xem",
  "Độ phức tạp của thuật toán là bao nhiêu?",
  "Khi nào nên dùng thuật toán này?",
];

const STICK_TO_BOTTOM_THRESHOLD_PX = 48;

const ICON_BUTTON_CLASS =
  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:pointer-events-none disabled:opacity-40";

export interface IAiChatOptions {
  readonly context?: IAssistantContext;
  readonly suggestions?: readonly string[];
  readonly onAsk?: () => void;
}

type AiChatPanelProps = IAiChatOptions & {
  className?: string;
};

export function AiChatPanel({
  context,
  suggestions = DEFAULT_SUGGESTED_QUESTIONS,
  onAsk,
  className,
}: AiChatPanelProps) {
  const headingId = useId();
  const inputId = useId();
  const providerSelectId = useId();
  const chat = useAssistantChat();
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const lastMessage = chat.messages.at(-1);

  useEffect(() => {
    const log = logRef.current;
    const content = contentRef.current;
    if (log === null || content === null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) {
        log.scrollTop = log.scrollHeight;
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const ask = (question: string) => {
    if (question.trim() === "" || chat.isStreaming) {
      return;
    }
    stickToBottomRef.current = true;
    onAsk?.();
    chat.send(question, context);
    setDraft("");
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border-default bg-bg-surface",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-2.5">
        <Sparkles aria-hidden="true" className="size-4 text-accent-text" />
        <h2 id={headingId} className="text-sm font-medium text-text-primary">
          Trợ lý AI
        </h2>
        <label htmlFor={providerSelectId} className="sr-only">
          Mô hình AI
        </label>
        <Select
          id={providerSelectId}
          className="ml-auto w-30"
          value={chat.provider}
          onChange={(event) => {
            const provider = event.currentTarget.value;
            if (isAssistantProviderId(provider)) {
              chat.setProvider(provider);
            }
          }}
        >
          {ASSISTANT_PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {ASSISTANT_PROVIDER_LABELS[provider]}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => {
            chat.reset();
            setDraft("");
          }}
          disabled={chat.messages.length === 0}
          aria-label="Cuộc trò chuyện mới"
          title="Cuộc trò chuyện mới"
          className={cn(
            ICON_BUTTON_CLASS,
            "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
          )}
        >
          <SquarePen aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-label="Cuộc trò chuyện với trợ lý AI"
        aria-busy={chat.isStreaming}
        onScroll={(event) => {
          const log = event.currentTarget;
          stickToBottomRef.current =
            log.scrollHeight - log.scrollTop - log.clientHeight <
            STICK_TO_BOTTOM_THRESHOLD_PX;
        }}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div ref={contentRef} className="flex min-h-full flex-col gap-4 p-4">
          {chat.messages.length === 0 ? (
            <>
              <AssistantRow>
                <p className="rounded-xl rounded-tl-sm bg-bg-subtle px-3 py-2 text-sm leading-6 text-text-primary">
                  Xin chào! Mình giải thích được từng bước của thuật toán và trả
                  lời câu hỏi của bạn. Bạn chọn một câu gợi ý hoặc tự gõ câu hỏi
                  nhé.
                </p>
              </AssistantRow>
              <ul
                aria-label="Câu hỏi gợi ý"
                className="mt-auto flex flex-wrap gap-2"
              >
                {suggestions.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => ask(question)}
                      className="rounded-full border border-border-default px-3 py-1 text-left text-xs text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ol className="flex flex-col gap-4">
              {chat.messages.map((message) =>
                message.role === "user" ? (
                  <UserMessage key={message.id} message={message} />
                ) : (
                  <AssistantMessage
                    key={message.id}
                    message={message}
                    onRetry={message === lastMessage ? chat.retry : undefined}
                  />
                ),
              )}
            </ol>
          )}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
        className="flex items-center gap-2 border-t border-border-default p-3"
      >
        <label htmlFor={inputId} className="sr-only">
          Câu hỏi cho trợ lý AI
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          maxLength={MAX_QUESTION_LENGTH}
          autoComplete="off"
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder="Hỏi về thuật toán này…"
          className="h-9 min-w-0 flex-1 rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
        />
        {chat.isStreaming ? (
          <button
            type="button"
            onClick={chat.stop}
            aria-label="Dừng trả lời"
            title="Dừng trả lời"
            className={cn(
              ICON_BUTTON_CLASS,
              "border border-border-strong text-text-primary hover:bg-bg-subtle",
            )}
          >
            <Square aria-hidden="true" className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={draft.trim() === ""}
            aria-label="Gửi câu hỏi"
            title="Gửi câu hỏi"
            className={cn(
              ICON_BUTTON_CLASS,
              "bg-accent-default text-accent-on hover:bg-accent-hover",
            )}
          >
            <SendHorizontal aria-hidden="true" className="size-4" />
          </button>
        )}
      </form>
    </section>
  );
}

type AssistantRowProps = {
  children: ReactNode;
};

function AssistantRow({ children }: AssistantRowProps) {
  return (
    <div className="flex gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent-text"
      >
        <Bot className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
    </div>
  );
}

type UserMessageProps = {
  message: IChatMessage;
};

function UserMessage({ message }: UserMessageProps) {
  return (
    <li className="flex flex-col items-end gap-1">
      <p className="max-w-[85%] rounded-xl rounded-tr-sm bg-accent-default px-3 py-2 text-sm leading-6 break-words whitespace-pre-wrap text-accent-on">
        {message.content}
      </p>
      {message.context !== undefined && (
        <p className="text-xs text-text-muted">
          Hỏi ở {formatStepLabel(message.context).toLowerCase()}
        </p>
      )}
    </li>
  );
}

type AssistantMessageProps = {
  message: IChatMessage;
  onRetry?: () => void;
};

function getEmptyReplyText(message: IChatMessage): string | undefined {
  if (message.content !== "") {
    return undefined;
  }
  if (message.status === "stopped") {
    return "Đã dừng trước khi có câu trả lời.";
  }
  if (message.finish === "blocked") {
    return "Mô hình không trả lời câu hỏi này. Bạn thử hỏi theo cách khác nhé.";
  }
  return undefined;
}

function getNotes(message: IChatMessage): string[] {
  const notes: string[] = [];
  if (message.provider !== undefined) {
    const label = ASSISTANT_PROVIDER_LABELS[message.provider];
    notes.push(
      message.fallbackFrom === undefined
        ? `Trả lời bởi ${label}`
        : `Trả lời bởi ${label} vì ${ASSISTANT_PROVIDER_LABELS[message.fallbackFrom]} chưa sẵn sàng`,
    );
  }
  if (message.status === "stopped" && message.content !== "") {
    notes.push("Đã dừng giữa chừng");
  }
  if (message.finish === "truncated") {
    notes.push("Câu trả lời quá dài nên bị cắt bớt");
  }
  if (message.finish === "blocked" && message.content !== "") {
    notes.push("Mô hình đã dừng câu trả lời vì lý do an toàn");
  }
  return notes;
}

function AssistantMessage({ message, onRetry }: AssistantMessageProps) {
  const emptyReplyText = getEmptyReplyText(message);
  const notes = getNotes(message);
  const isThinking = message.status === "streaming" && message.content === "";

  return (
    <li>
      <AssistantRow>
        {isThinking && (
          <p className="w-fit animate-pulse rounded-xl rounded-tl-sm bg-bg-subtle px-3 py-2 text-sm leading-6 text-text-secondary motion-reduce:animate-none">
            Đang suy nghĩ…
          </p>
        )}
        {message.content !== "" && (
          <AssistantMarkdown
            content={message.content}
            className="rounded-xl rounded-tl-sm bg-bg-subtle px-3 py-2 text-sm leading-6 text-text-primary"
          />
        )}
        {emptyReplyText !== undefined && (
          <p className="rounded-xl rounded-tl-sm bg-bg-subtle px-3 py-2 text-sm leading-6 text-text-secondary">
            {emptyReplyText}
          </p>
        )}
        {message.status === "error" && (
          <div className="flex flex-col items-start gap-2 rounded-xl rounded-tl-sm border border-border-strong px-3 py-2 text-sm leading-6 text-text-primary">
            <p className="flex gap-2">
              <CircleAlert
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-text-secondary"
              />
              <span>{message.error}</span>
            </p>
            {onRetry !== undefined && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-border-strong px-3 py-1 text-xs font-medium text-text-primary transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
              >
                Thử lại
              </button>
            )}
          </div>
        )}
        {notes.length > 0 && (
          <p className="text-xs text-text-muted">{notes.join(" · ")}</p>
        )}
      </AssistantRow>
    </li>
  );
}
