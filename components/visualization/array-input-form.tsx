import { CircleAlert, Shuffle } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
  createRandomArray,
  formatArrayInput,
  MIN_RANDOM_LENGTH,
  parseArrayInput,
} from "@/engine/visualization";

/**
 * Mảng mới đến từ đâu: người dùng tự nhập (`manual`) hay bấm nút sinh ngẫu nhiên (`random`).
 */
export type ArrayInputSource = "manual" | "random";

/**
 * Props của `ArrayInputForm`.
 *
 * `maxLength`: Số phần tử tối đa mà trình mô phỏng nhận, dùng cho cả ô nhập lẫn thanh trượt.
 * `normalize`: Biến đổi mảng trước khi áp dụng, ví dụ sắp xếp tăng dần cho tìm kiếm nhị phân;
 *   ô nhập hiện lại đúng mảng đã biến đổi.
 * `hint`: Câu hướng dẫn ngắn dưới ô nhập, bị thay bằng thông báo lỗi khi nhập sai.
 * `children`: Ô nhập phụ đặt giữa ô nhập mảng và phần sinh ngẫu nhiên, ví dụ giá trị cần tìm.
 *   Khung ngoài không phải `<form>` nên ô nhập phụ được có form riêng.
 */
type ArrayInputFormProps = {
  initialValues: readonly number[];
  maxLength: number;
  onChange: (values: readonly number[], source: ArrayInputSource) => void;
  normalize?: (values: readonly number[]) => readonly number[];
  hint?: string;
  children?: ReactNode;
};

export function ArrayInputForm({
  initialValues,
  maxLength,
  onChange,
  normalize = (values) => values,
  hint,
  children,
}: ArrayInputFormProps) {
  const textId = useId();
  const errorId = useId();
  const hintId = useId();
  const sizeId = useId();
  const [text, setText] = useState(() => formatArrayInput(initialValues));
  const [error, setError] = useState<string>();
  const [size, setSize] = useState(initialValues.length);

  const apply = (values: readonly number[], source: ArrayInputSource) => {
    const normalized = normalize(values);
    setText(formatArrayInput(normalized));
    setError(undefined);
    onChange(normalized, source);
  };

  let describedBy: string | undefined;
  if (error !== undefined) {
    describedBy = errorId;
  } else if (hint !== undefined) {
    describedBy = hintId;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const result = parseArrayInput(text, maxLength);
          if (result.type === "invalid") {
            setError(result.message);
            return;
          }
          apply(result.values, "manual");
          setSize(result.values.length);
        }}
        className="flex flex-1 flex-col gap-1.5 sm:min-w-64"
      >
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
            aria-describedby={describedBy}
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
        {error !== undefined ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-sm font-medium text-text-primary"
          >
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {error}
          </p>
        ) : (
          hint !== undefined && (
            <p id={hintId} className="text-sm text-text-secondary">
              {hint}
            </p>
          )
        )}
      </form>

      {children}

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
            max={maxLength}
            value={size}
            onChange={(event) => setSize(event.currentTarget.valueAsNumber)}
            className="h-2 w-full cursor-pointer accent-accent-default sm:w-40"
          />
          <button
            type="button"
            onClick={() => apply(createRandomArray(size, maxLength), "random")}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          >
            <Shuffle aria-hidden="true" className="size-4" />
            Ngẫu nhiên
          </button>
        </div>
      </div>
    </div>
  );
}
