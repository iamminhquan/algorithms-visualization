import Markdown, { type Components } from "react-markdown";
import { cn } from "@/lib/cn";

const DISALLOWED_ELEMENTS = ["img"] as const;

const HEADING_CLASS = "font-semibold text-text-primary";

const COMPONENTS: Components = {
  p: ({ children }) => <p>{children}</p>,
  h1: ({ children }) => <p className={HEADING_CLASS}>{children}</p>,
  h2: ({ children }) => <p className={HEADING_CLASS}>{children}</p>,
  h3: ({ children }) => <p className={HEADING_CLASS}>{children}</p>,
  h4: ({ children }) => <p className={HEADING_CLASS}>{children}</p>,
  h5: ({ children }) => <p className={HEADING_CLASS}>{children}</p>,
  h6: ({ children }) => <p className={HEADING_CLASS}>{children}</p>,
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-1 pl-5">{children}</ul>
  ),
  ol: ({ children, start }) => (
    <ol start={start} className="flex list-decimal flex-col gap-1 pl-5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border-strong pl-3 text-text-secondary">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-accent-text underline underline-offset-2 hover:text-accent-hover"
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => (
    <code
      className={cn(
        "rounded bg-bg-surface px-1 py-0.5 font-mono text-[0.85em]",
        className,
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg bg-bg-surface p-3 font-mono text-xs leading-5 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-border-default" />,
};

type AssistantMarkdownProps = {
  content: string;
  className?: string;
};

export function AssistantMarkdown({
  content,
  className,
}: AssistantMarkdownProps) {
  return (
    <div className={cn("flex flex-col gap-2 break-words", className)}>
      <Markdown
        components={COMPONENTS}
        disallowedElements={DISALLOWED_ELEMENTS}
        unwrapDisallowed
        skipHtml
      >
        {content}
      </Markdown>
    </div>
  );
}
