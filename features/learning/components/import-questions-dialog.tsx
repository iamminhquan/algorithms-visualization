"use client";

import { Download, Upload } from "lucide-react";
import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { IQuestionImportActionState } from "../types";
import { INITIAL_QUESTION_IMPORT_STATE } from "../types";
import { FormMessage } from "./form-message";

/** File mẫu nằm trong `public/samples`, dùng chung cho cả nút tải và script seed. */
export const SAMPLE_QUESTION_CSV_PATH = "/samples/cau-hoi-mau.csv";

type ImportQuestionsDialogProps = {
  action: (
    state: IQuestionImportActionState,
    formData: FormData,
  ) => Promise<IQuestionImportActionState>;
  /** Khi có giá trị, mỗi câu hỏi được gắn luôn vào bài kiểm tra nháp này. */
  examId?: number;
};

export function ImportQuestionsDialog({
  action,
  examId,
}: ImportQuestionsDialogProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_QUESTION_IMPORT_STATE,
  );
  const idPrefix =
    examId === undefined ? "questions-import" : `exam-${examId}-import`;
  const summary = state.summary;

  return (
    <Dialog
      title={
        examId === undefined
          ? "Import câu hỏi từ Excel/CSV"
          : "Import câu hỏi vào bài kiểm tra"
      }
      description={
        examId === undefined
          ? "Mỗi dòng trong file là một câu hỏi, được thêm vào ngân hàng của bạn."
          : "Mỗi dòng là một câu hỏi, được thêm vào ngân hàng và gắn vào đề nháp với điểm trong file."
      }
      trigger={
        <>
          <Upload aria-hidden="true" />
          Import câu hỏi
        </>
      }
      triggerClassName={getButtonClassName("secondary", "sm")}
      size="lg"
    >
      <form action={formAction} className="flex flex-col gap-4 px-5 py-5">
        {examId !== undefined && (
          <input type="hidden" name="examId" value={examId} />
        )}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${idPrefix}-file`}
            className="text-sm font-medium text-text-primary"
          >
            File Excel hoặc CSV
          </label>
          <Input
            id={`${idPrefix}-file`}
            name="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            required
          />
          <p className="text-xs text-text-muted">
            Cột bắt buộc: <span className="font-medium">Nội dung</span>. Cột
            không bắt buộc: Loại, Lựa chọn, Đáp án đúng, Đáp án chấp nhận, Cách
            so khớp, Nhiều đáp án, Điểm. Phân tách lựa chọn và đáp án bằng dấu{" "}
            <code className="font-mono">|</code>.
          </p>
          <a
            href={SAMPLE_QUESTION_CSV_PATH}
            download
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent-text hover:underline"
          >
            <Download aria-hidden="true" className="size-4" />
            Tải file mẫu
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className={getButtonClassName("primary")}
          >
            {isPending ? "Đang import..." : "Import câu hỏi"}
          </button>
          <FormMessage state={state} />
        </div>
        {summary && (
          <div className="flex flex-col gap-2 rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-sm text-text-primary">
              Tổng {summary.totalRows} dòng ·{" "}
              <span className="text-success-text">
                {summary.successRows} thành công
              </span>{" "}
              ·{" "}
              <span className="text-danger-text">{summary.failedRows} lỗi</span>
            </p>
            {summary.errors.length > 0 && (
              <ul className="flex max-h-52 flex-col gap-1 overflow-y-auto text-xs text-text-secondary">
                {summary.errors.slice(0, 20).map((error) => (
                  <li key={`${error.row}-${error.code}`}>
                    Dòng {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </Dialog>
  );
}
