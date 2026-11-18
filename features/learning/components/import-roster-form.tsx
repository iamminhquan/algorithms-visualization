"use client";

import { Upload } from "lucide-react";
import { useActionState, useState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { IImportActionState } from "../types";
import { INITIAL_IMPORT_ACTION_STATE } from "../types";

type ImportRosterFormProps = {
  action: (
    state: IImportActionState,
    formData: FormData,
  ) => Promise<IImportActionState>;
  classId: number;
};

export function ImportRosterForm({ action, classId }: ImportRosterFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_IMPORT_ACTION_STATE,
  );
  const [fileName, setFileName] = useState("");
  const summary = state.summary;
  const hasErrors = summary !== undefined && summary.failedRows > 0;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="classId" value={classId} />
        <input
          id={`class-${classId}-roster-file`}
          name="file"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
        <label
          htmlFor={`class-${classId}-roster-file`}
          className={cn(
            "cursor-pointer",
            getButtonClassName("secondary", "sm"),
          )}
        >
          <Upload aria-hidden="true" />
          Chọn file
        </label>
        <span className="max-w-44 truncate text-sm text-text-secondary">
          {fileName === "" ? (
            <span className="text-text-muted">Chưa chọn file</span>
          ) : (
            fileName
          )}
        </span>
        <button
          type="submit"
          disabled={isPending || fileName === ""}
          className={getButtonClassName("primary", "sm")}
        >
          {isPending ? "Đang import..." : "Import"}
        </button>
        {summary && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
              hasErrors
                ? "bg-warning-subtle text-warning-text"
                : "bg-success-subtle text-success-text",
            )}
          >
            {summary.successRows}/{summary.totalRows} thành công
            {hasErrors ? ` · ${summary.failedRows} lỗi` : ""}
          </span>
        )}
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-danger-text">
          {state.error}
        </p>
      )}
      {summary && hasErrors && (
        <details className="rounded-lg border border-border-default bg-bg-subtle px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-text-primary select-none">
            Chi tiết {summary.failedRows} dòng lỗi
          </summary>
          <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto text-xs text-text-secondary">
            {summary.errors.map((error) => (
              <li key={`${error.row}-${error.code}-${error.email}`}>
                Dòng {error.row}: {error.message}
                {error.email ? ` (${error.email})` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </form>
  );
}
