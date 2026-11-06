import { cn } from "@/lib/cn";

type ErrorScreenProps = {
  readonly code: string;
  readonly message: string;
  readonly className?: string;
};

export function ErrorScreen({ code, message, className }: ErrorScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center sm:flex-row sm:gap-6 sm:text-left",
        className,
      )}
    >
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
        {code}
      </h1>
      <span
        aria-hidden="true"
        className="h-px w-12 bg-border-default sm:h-12 sm:w-px"
      />
      <p className="text-base text-text-secondary sm:text-lg">{message}</p>
    </div>
  );
}
