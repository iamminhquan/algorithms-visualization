import { ErrorScreen } from "@/components/ui/error-screen";

export default function AdminNotFound() {
  return (
    <ErrorScreen
      code="404"
      message="Mục bạn tìm không tồn tại hoặc đã bị xoá."
      className="min-h-[50vh]"
    />
  );
}
