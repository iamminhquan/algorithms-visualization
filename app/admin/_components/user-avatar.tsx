import { cn } from "@/lib/cn";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words.at(0)?.charAt(0) ?? "";
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

type UserAvatarProps = {
  name: string;
  className?: string;
};

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-text",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
