"use client";

import { Upload } from "lucide-react";
import { useActionState, useState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { IImportActionState } from "../types";
import { INITIAL_IMPORT_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

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
  const buttonClassName = getButtonClassName("secondary", "sm");

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-2 self-center"
    >
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
        className={cn("cursor-pointer", buttonClassName)}
      >
        <Upload aria-hidden="true" className="size-4" />
        Chọn file
      </label>
      {fileName !== "" && (
        <span className="min-w-0 max-w-32 truncate text-sm text-text-secondary sm:max-w-48">
          {fileName}
        </span>
      )}
      <button
        type="submit"
        disabled={isPending || fileName === ""}
        className={getButtonClassName("primary", "sm")}
      >
        {isPending ? "Đang import..." : "Import"}
      </button>
      <FormMessage state={state} />
      {state.summary && (
        <div className="flex w-full basis-full flex-col gap-2 rounded-lg border border-border-default bg-bg-subtle p-3">
          <p className="text-sm text-text-primary">
            Tổng {state.summary.totalRows} dòng ·{" "}
            <span className="text-success-text">
              {state.summary.successRows} thành công
            </span>{" "}
            ·{" "}
            <span className="text-danger-text">
              {state.summary.failedRows} lỗi
            </span>
          </p>
          {state.summary.errors.length > 0 && (
            <ul className="flex max-h-52 flex-col gap-1 overflow-y-auto text-xs text-text-secondary">
              {state.summary.errors.slice(0, 20).map((error) => (
                <li key={`${error.row}-${error.code}-${error.email}`}>
                  Dòng {error.row}: {error.message}
                  {error.email ? ` (${error.email})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
