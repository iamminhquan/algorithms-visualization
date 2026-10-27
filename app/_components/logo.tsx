import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_NAME } from "@/lib/site";

const MARK_BARS = [
  {
    x: 6,
    height: 13,
    isHighlighted: false,
    sortClassName: "group-hover/logo:translate-x-[6px]",
  },
  {
    x: 12,
    height: 21,
    isHighlighted: true,
    sortClassName: "delay-75 group-hover/logo:translate-x-[12px]",
  },
  {
    x: 18,
    height: 8,
    isHighlighted: false,
    sortClassName: "delay-[25ms] group-hover/logo:-translate-x-[12px]",
  },
  {
    x: 24,
    height: 17,
    isHighlighted: false,
    sortClassName: "delay-50 group-hover/logo:-translate-x-[6px]",
  },
] as const;

const MARK_BASELINE = 27;

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="size-9 shrink-0"
      focusable="false"
    >
      <rect width="32" height="32" rx="8" className="fill-accent-default" />
      {MARK_BARS.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x - 2}
          y={MARK_BASELINE - bar.height}
          width="4"
          height={bar.height}
          rx="1.5"
          className={cn(
            "transition-[translate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:group-hover/logo:translate-x-0",
            bar.sortClassName,
            bar.isHighlighted ? "fill-state-compare" : "fill-accent-on",
          )}
        />
      ))}
    </svg>
  );
}

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} – Trang chủ`}
      className={cn(
        "group/logo inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        className,
      )}
    >
      <LogoMark />
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight">AlgoViz</span>
      )}
    </Link>
  );
}
