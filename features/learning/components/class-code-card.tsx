"use client";

import { Check, ChevronDown, Download, Link2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { getButtonClassName } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/cn";

type ClassCodeCardProps = {
  code: string;
  joinUrl: string;
};

type ClassShareMode = "link" | "qr";

const SHARE_MODES = [
  { mode: "link", label: "Liên kết tham gia", icon: Link2 },
  { mode: "qr", label: "Mã QR", icon: QrCode },
] as const satisfies ReadonlyArray<{
  mode: ClassShareMode;
  label: string;
  icon: typeof Link2;
}>;

const QR_SIZE = 128;
const QR_FG_COLOR = "#0f172a";
const FOCUS_RING_CLASS_NAME =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";

export function ClassCodeCard({ code, joinUrl }: ClassCodeCardProps) {
  const [mode, setMode] = useState<ClassShareMode | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const qrRef = useRef<SVGSVGElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  const getItems = () =>
    Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-menu-item]",
      ) ?? [],
    );

  function openWithFocus() {
    const items = getItems();
    items.at(0)?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      openWithFocus();
    }
  }

  function handleContainerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const items = getItems();
    const active = document.activeElement;
    const index =
      active instanceof HTMLButtonElement ? items.indexOf(active) : -1;
    if (index === -1) {
      return;
    }
    const nextIndex = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (nextIndex !== undefined) {
      event.preventDefault();
      items[(nextIndex + items.length) % items.length].focus();
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  }

  function handleModeSelect(selectedMode: ClassShareMode) {
    setMode((current) => (current === selectedMode ? null : selectedMode));
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleDownload() {
    const svg = qrRef.current;
    if (!svg) {
      return;
    }
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lop-${code.toLowerCase()}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-secondary">Mã lớp</span>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: chỉ gom sự kiện của nút và các mục bên trong, bản thân thẻ div không tương tác. */}
        <div
          ref={containerRef}
          className="relative"
          onKeyDown={handleContainerKeyDown}
          onBlur={handleBlur}
        >
          <button
            ref={triggerRef}
            type="button"
            aria-label="Chọn cách chia sẻ lớp học"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-haspopup="menu"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              getButtonClassName("ghost", "icon", "-mr-1"),
              isOpen && "bg-bg-subtle text-text-primary",
            )}
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 transition-transform duration-200 motion-reduce:transition-none",
                isOpen && "rotate-180",
              )}
            />
          </button>
          {isOpen && (
            <div
              id={panelId}
              role="menu"
              className="absolute top-full right-0 z-30 mt-1 flex flex-col gap-0.5 rounded-xl border border-border-default bg-bg-surface p-1.5 shadow-lg shadow-text-primary/5"
            >
              {SHARE_MODES.map((shareMode) => {
                const Icon = shareMode.icon;
                const isSelected = mode === shareMode.mode;
                return (
                  <button
                    key={shareMode.mode}
                    type="button"
                    role="menuitem"
                    data-menu-item
                    onClick={() => handleModeSelect(shareMode.mode)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-bg-subtle focus-visible:bg-bg-subtle",
                      FOCUS_RING_CLASS_NAME,
                      isSelected && "bg-accent-subtle text-accent-text",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="flex-1 whitespace-nowrap">
                      {shareMode.label}
                    </span>
                    {isSelected && (
                      <Check aria-hidden="true" className="size-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-lg font-semibold text-text-primary">
          {code}
        </span>
        <CopyButton value={code} label="Sao chép mã lớp" />
      </div>
      {mode === "link" && (
        <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1.5">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary">
            {joinUrl}
          </code>
          <CopyButton value={joinUrl} label="Sao chép liên kết tham gia" />
        </div>
      )}
      {mode === "qr" && (
        <div className="flex flex-col gap-2">
          <div className="mx-auto rounded-lg border border-border-default bg-white p-2">
            <QRCodeSVG
              ref={qrRef}
              value={joinUrl}
              title={`Liên kết tham gia lớp ${code}`}
              size={QR_SIZE}
              fgColor={QR_FG_COLOR}
              bgColor="#ffffff"
              marginSize={2}
            />
          </div>
          <div className="flex items-center justify-center gap-1">
            <CopyButton value={joinUrl} label="Sao chép liên kết tham gia" />
            <button
              type="button"
              aria-label="Tải mã QR (SVG)"
              title="Tải mã QR (SVG)"
              onClick={handleDownload}
              className={getButtonClassName("ghost", "icon")}
            >
              <Download aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
