import type { ILearningActionState } from "../types";

type FormMessageProps = {
  state: ILearningActionState;
};

export function FormMessage({ state }: FormMessageProps) {
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
