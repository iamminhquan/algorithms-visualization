"use client";

import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/cn";

type ClassCodeCardProps = {
  code: string;
  joinUrl: string;
  className?: string;
};

const QR_SIZE = 108;
const QR_FG_COLOR = "#0f172a";

export function ClassCodeCard({
  code,
  joinUrl,
  className,
}: ClassCodeCardProps) {
  const qrRef = useRef<SVGSVGElement>(null);

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
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">
              Mã lớp
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xl font-semibold tracking-wide text-text-primary">
                {code}
              </span>
              <CopyButton value={code} label="Sao chép mã lớp" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Liên kết tham gia
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1">
              <code className="min-w-0 flex-1 font-mono text-xs leading-5 break-all text-text-secondary">
                {joinUrl}
              </code>
              <CopyButton
                value={joinUrl}
                label="Sao chép liên kết tham gia"
                className="shrink-0"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-1">
          <div className="rounded-lg border border-border-default bg-white p-2">
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
          <button
            type="button"
            onClick={handleDownload}
            className={getButtonClassName("ghost", "sm")}
          >
            <Download aria-hidden="true" />
            Tải mã QR
          </button>
        </div>
      </div>
    </div>
  );
}
