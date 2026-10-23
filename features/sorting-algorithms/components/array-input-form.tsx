import { CircleAlert, Shuffle } from "lucide-react";
import { useId, useState } from "react";
import {
  createRandomArray,
  formatArrayInput,
  MAX_ARRAY_LENGTH,
  MIN_RANDOM_LENGTH,
  parseArrayInput,
} from "../array-input";

type ArrayInputFormProps = {
  initialValues: readonly number[];
  onChange: (values: readonly number[]) => void;
};

export function ArrayInputForm({
  initialValues,
  onChange,
}: ArrayInputFormProps) {
  const textId = useId();
  const errorId = useId();
  const sizeId = useId();
  const [text, setText] = useState(() => formatArrayInput(initialValues));
  const [error, setError] = useState<string>();
  const [size, setSize] = useState(initialValues.length);

  const apply = (values: readonly number[]) => {
    setText(formatArrayInput(values));
    setError(undefined);
    onChange(values);
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const result = parseArrayInput(text);
        if (result.type === "invalid") {
          setError(result.message);
          return;
        }
        apply(result.values);
        setSize(result.values.length);
      }}
      className="flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:flex-row sm:items-start sm:gap-6"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label
          htmlFor={textId}
          className="text-sm font-medium text-text-primary"
        >
          Dữ liệu đầu vào
        </label>
        <div className="flex gap-2">
          <input
            id={textId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            aria-invalid={error !== undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder="Ví dụ: 5 3 8 1"
            className="h-10 min-w-0 flex-1 rounded-lg border border-border-strong bg-bg-surface px-3 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent-default"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-accent-default px-4 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          >
            Áp dụng
          </button>
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-sm font-medium text-text-primary"
          >
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={sizeId}
          className="text-sm font-medium text-text-primary"
        >
          Số phần tử: <span className="font-mono tabular-nums">{size}</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            id={sizeId}
            type="range"
            min={MIN_RANDOM_LENGTH}
            max={MAX_ARRAY_LENGTH}
            value={size}
            onChange={(event) => setSize(event.currentTarget.valueAsNumber)}
            className="h-2 w-full cursor-pointer accent-accent-default sm:w-40"
          />
          <button
            type="button"
            onClick={() => apply(createRandomArray(size))}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          >
            <Shuffle aria-hidden="true" className="size-4" />
            Ngẫu nhiên
          </button>
        </div>
      </div>
    </form>
  );
}
