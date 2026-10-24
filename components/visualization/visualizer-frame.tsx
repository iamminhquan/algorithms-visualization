import type { ReactNode } from "react";
import type { VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { TONE_BACKGROUND } from "./tones";

/**
 * Một mục trong chú giải màu, giải thích tone mà hình mô phỏng đang dùng.
 */
export interface ILegendItem {
  readonly tone: VisualTone;
  readonly label: string;
}

export interface IMetricItem {
  readonly label: string;
  readonly value: number | string;
}

/**
 * Props của `VisualizerFrame`.
 *
 * `children`: Hình mô phỏng; khung đã cho sẵn chiều cao, nên hình chỉ cần lấp đầy (`h-full`).
 * `description`: Câu giải thích bước đang xem, chỉ dành cho trình đọc màn hình (đọc lại mỗi khi đổi),
 *   nên hình phải tự thể hiện được bước đó bằng huy hiệu và ngoặc.
 * `toolbar`: Phần nhập dữ liệu, đặt phía trên hình.
 * `aside`: Phần đặt cạnh hình trên màn hình rộng, ví dụ mã giả. Trên màn hình hẹp nó xuống dưới
 *   thanh điều khiển, để nút phát luôn nằm ngay dưới hình.
 */
type VisualizerFrameProps = {
  children: ReactNode;
  description: string;
  controls: ReactNode;
  toolbar?: ReactNode;
  aside?: ReactNode;
  legend?: readonly ILegendItem[];
  metrics?: readonly IMetricItem[];
  className?: string;
};

/**
 * Bố cục chung của mọi trình mô phỏng: thanh nhập dữ liệu, hình vẽ kèm câu mô tả bước,
 * thanh điều khiển phát, rồi chú giải màu và các chỉ số đo.
 */
export function VisualizerFrame({
  children,
  description,
  controls,
  toolbar,
  aside,
  legend = [],
  metrics = [],
  className,
}: VisualizerFrameProps) {
  return (
    <section
      aria-label="Mô phỏng"
      className={cn("flex flex-col gap-4", className)}
    >
      {toolbar}
      <div
        className={cn(
          "grid gap-4",
          aside !== undefined && "lg:grid-cols-[minmax(0,1fr)_20rem]",
        )}
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6">
          <div className="h-64 sm:h-80">{children}</div>
          <p aria-live="polite" className="sr-only">
            {description}
          </p>
        </div>
        {aside !== undefined && (
          <div className="order-last lg:order-none">{aside}</div>
        )}
        <div className={cn(aside !== undefined && "lg:col-span-2")}>
          {controls}
        </div>
      </div>
      {(legend.length > 0 || metrics.length > 0) && (
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          {legend.length > 0 && (
            <ul
              aria-label="Chú giải màu"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary"
            >
              {legend.map((item) => (
                <li key={item.tone} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-3 rounded-sm",
                      TONE_BACKGROUND[item.tone],
                    )}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
          {metrics.length > 0 && (
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex gap-1.5">
                  <dt className="text-text-secondary">{metric.label}</dt>
                  <dd className="font-mono text-text-primary tabular-nums">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </section>
  );
}

export function VisualizerSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <div className="h-51 rounded-xl bg-bg-subtle sm:h-31" />
      <div className="h-72 rounded-xl bg-bg-subtle sm:h-92" />
      <div className="h-28 rounded-xl bg-bg-subtle sm:h-16" />
    </div>
  );
}
