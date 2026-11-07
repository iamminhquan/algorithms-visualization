import type { IUserActionState } from "@/features/auth/user-types";

type UserActionMessageProps = {
  state: IUserActionState;
};

export function UserActionMessage({ state }: UserActionMessageProps) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm leading-5 text-danger-text">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <output className="text-sm leading-5 text-success-text">
        {state.success}
      </output>
    );
  }
  return null;
}
