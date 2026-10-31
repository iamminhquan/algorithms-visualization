import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Logo } from "../../_components/logo";

export function AdminBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo showWordmark className="text-text-primary" />
      <Badge tone="accent">Quản trị</Badge>
    </div>
  );
}

type BackToSiteLinkProps = {
  onNavigate?: () => void;
};

export function BackToSiteLink({ onNavigate }: BackToSiteLinkProps) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
    >
      <ArrowLeft aria-hidden="true" className="size-4.5 shrink-0" />
      Về trang web
    </Link>
  );
}
