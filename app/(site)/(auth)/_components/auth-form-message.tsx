import { cn } from "@/lib/cn";

type AuthFormMessageProps = {
  message: string | undefined;
  tone?: "error" | "success";
};

export function AuthFormMessage({
  message,
  tone = "error",
}: AuthFormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "text-center text-sm",
        tone === "error" ? "text-danger-text" : "text-success-text",
      )}
    >
      {message}
    </p>
  );
}
