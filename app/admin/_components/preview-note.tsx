import { Info } from "lucide-react";

export function PreviewNote() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-text-muted">
      <Info aria-hidden="true" className="size-3.5 shrink-0" />
      Xem trước giao diện, chưa lưu dữ liệu.
    </p>
  );
}
