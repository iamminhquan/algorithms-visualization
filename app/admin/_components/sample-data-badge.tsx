import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SampleDataBadge() {
  return (
    <Badge
      tone="warning"
      title="Chưa có bảng trong cơ sở dữ liệu, số liệu chỉ để minh hoạ giao diện."
    >
      <FlaskConical aria-hidden="true" />
      Dữ liệu mẫu
    </Badge>
  );
}
