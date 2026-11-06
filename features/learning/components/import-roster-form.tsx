"use client";

import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  return (
    <form action={formAction} className="flex flex-col gap-4 px-5 py-5">
      <input type="hidden" name="classId" value={classId} />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`class-${classId}-roster-file`}
          className="text-sm font-medium text-text-primary"
        >
          File Excel danh sách sinh viên
        </label>
        <Input
          id={`class-${classId}-roster-file`}
          name="file"
          type="file"
          accept=".xlsx,.xls,.csv"
          required
        />
        <p className="text-xs text-text-muted">
          Cột bắt buộc: Email, MSSV. Cột không bắt buộc: Họ tên.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={getButtonClassName("primary")}
        >
          {isPending ? "Đang import..." : "Import danh sách"}
        </button>
        <FormMessage state={state} />
      </div>
      {state.summary && (
        <div className="flex flex-col gap-2 rounded-lg border border-border-default bg-bg-subtle p-3">
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
