type AuthSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  isPending: boolean;
};

export function AuthSubmitButton({
  label,
  pendingLabel,
  isPending,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-accent-default px-5 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:pointer-events-none disabled:opacity-60"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
