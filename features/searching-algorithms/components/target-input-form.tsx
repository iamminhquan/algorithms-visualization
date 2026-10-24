import { CircleAlert, Shuffle } from "lucide-react";
import { useId, useState } from "react";
import { parseIntegerInput } from "@/engine/visualization";

/**
 * Props của `TargetInputForm`.
 *
 * `value`: Giá trị cần tìm đang dùng; đổi từ bên ngoài (ví dụ khi sinh mảng ngẫu nhiên) thì ô
 *   nhập hiện lại giá trị mới.
 * `onRandom`: Bấm nút chọn ngẫu nhiên; nơi gọi tự chọn giá trị vì nó biết mảng hiện tại.
 */
type TargetInputFormProps = {
  value: number;
  onChange: (target: number) => void;
  onRandom: () => void;
};

export function TargetInputForm({
  value,
  onChange,
  onRandom,
}: TargetInputFormProps) {
  const inputId = useId();
  const errorId = useId();
  const [text, setText] = useState(() => String(value));
  const [error, setError] = useState<string>();
  const [shownValue, setShownValue] = useState(value);

  /*
   * Đồng bộ ô nhập ngay trong lúc render thay vì dùng effect, để không có lần vẽ nào hiện giá trị cũ.
   */
  if (value !== shownValue) {
    setShownValue(value);
    setText(String(value));
    setError(undefined);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const result = parseIntegerInput(text);
        if (result.type === "invalid") {
          setError(result.message);
          return;
        }
        setError(undefined);
        setText(String(result.value));
        onChange(result.value);
      }}
      className="flex flex-col gap-1.5"
    >
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-primary"
      >
        Số cần tìm
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          aria-invalid={error !== undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-10 w-20 min-w-0 rounded-lg border border-border-strong bg-bg-surface px-3 font-mono text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-default"
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded-lg bg-accent-default px-4 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
        >
          Tìm
        </button>
        <button
          type="button"
          onClick={onRandom}
          aria-label="Chọn số cần tìm ngẫu nhiên"
          title="Chọn số cần tìm ngẫu nhiên"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-bg-surface text-text-primary transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
        >
          <Shuffle aria-hidden="true" className="size-4" />
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
    </form>
  );
}
