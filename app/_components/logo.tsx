import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_NAME } from "@/lib/site";

/*
 * Bốn cột chưa sắp xếp trong ô vuông bo góc; cột cao nhất tô màu "đang so sánh" như trên hình mô phỏng.
 * Giữ cùng hình với `app/icon.svg`.
 */
const MARK_BARS = [
  { x: 6, height: 13, isHighlighted: false },
  { x: 12, height: 21, isHighlighted: true },
  { x: 18, height: 8, isHighlighted: false },
  { x: 24, height: 17, isHighlighted: false },
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
          className={
            bar.isHighlighted ? "fill-state-compare" : "fill-accent-on"
          }
        />
      ))}
    </svg>
  );
}

type LogoProps = {
  className?: string;
};

/**
 * Biểu tượng của site, không kèm chữ; link có `aria-label` nên người dùng trình đọc màn hình
 * vẫn nghe đủ tên.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} – Trang chủ`}
      className={cn(
        "inline-flex items-center rounded-md transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        className,
      )}
    >
      <LogoMark />
    </Link>
  );
}
