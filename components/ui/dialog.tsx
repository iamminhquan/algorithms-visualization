"use client";

import { X } from "lucide-react";
import { type ReactNode, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { getButtonClassName } from "./button";

const SIZE_CLASS_NAMES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

type DialogProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  triggerClassName: string;
  triggerLabel?: string;
  size?: keyof typeof SIZE_CLASS_NAMES;
  children: ReactNode;
};

export function Dialog({
  title,
  description,
  trigger,
  triggerClassName,
  triggerLabel,
  size = "md",
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: bấm ra nền là cách đóng thêm cho chuột, bàn phím đã có Esc của dialog. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClose={(event) => {
          for (const form of event.currentTarget.querySelectorAll("form")) {
            form.reset();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
        className={cn(
          "fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] scale-95 overflow-y-auto overscroll-contain rounded-2xl border border-border-default bg-bg-surface p-0 text-left text-text-primary opacity-0 shadow-xl transition-[opacity,scale,display,overlay] duration-200 transition-discrete backdrop:bg-bg-page/60 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:duration-200 backdrop:transition-discrete open:scale-100 open:opacity-100 open:backdrop:opacity-100 motion-reduce:transition-none starting:open:scale-95 starting:open:opacity-0 starting:open:backdrop:opacity-0",
          SIZE_CLASS_NAMES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-default px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={close}
            className={getButtonClassName("ghost", "icon", "-mr-1.5")}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
