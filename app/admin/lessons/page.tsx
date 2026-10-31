import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getAlgorithmCatalog } from "@/features/catalog/queries";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber } from "@/lib/format";
import { ConfirmDeleteDialog } from "../_components/confirm-delete-dialog";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../_components/data-table";
import { EditDialog, FormDialog } from "../_components/form-dialog";
import { PageHeader } from "../_components/page-header";
import { RowActions } from "../_components/row-actions";
import {
  LESSON_STATUSES,
  LESSON_TRACKS,
  SAMPLE_LESSONS,
} from "../_components/sample-data";
import { LessonFormFields } from "./_components/lesson-form-fields";

export const metadata: Metadata = {
  title: "Bài học",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Bài học" },
  { label: "Mô phỏng đi kèm" },
  { label: "Thời lượng", align: "right" },
  { label: "Trạng thái" },
  { label: "Cập nhật" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

export default async function AdminLessonsPage() {
  const algorithmNames = (await getAlgorithmCatalog()).map(
    (algorithm) => algorithm.name,
  );

  return (
    <>
      <PageHeader
        title="Bài học"
        description="Bài học thuộc các lộ trình ở trang Học tập, mỗi bài có thể gắn với một trình mô phỏng."
        breadcrumb={[{ label: "Bài học" }]}
        isSampleData
        actions={
          <FormDialog
            title="Thêm bài học"
            trigger={
              <>
                <Plus aria-hidden="true" />
                Thêm bài học
              </>
            }
            triggerClassName={getButtonClassName("primary")}
            submitLabel="Thêm bài học"
          >
            <LessonFormFields
              idPrefix="lesson-new"
              algorithmNames={algorithmNames}
            />
          </FormDialog>
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={SAMPLE_LESSONS.length}
        itemLabel="bài học"
        searchPlaceholder="Tìm theo tiêu đề"
        emptyMessage="Chưa có bài học nào."
        filters={
          <>
            <Select
              aria-label="Lọc theo lộ trình"
              defaultValue=""
              className="w-full sm:w-52"
            >
              <option value="">Tất cả lộ trình</option>
              {LESSON_TRACKS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Lọc theo trạng thái"
              defaultValue=""
              className="w-full sm:w-40"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(LESSON_STATUSES).map(([status, option]) => (
                <option key={status} value={status}>
                  {option.label}
                </option>
              ))}
            </Select>
          </>
        }
      >
        {SAMPLE_LESSONS.map((lesson) => (
          <tr key={lesson.id} className={TABLE_ROW_CLASS_NAME}>
            <td className={TABLE_CELL_CLASS_NAME}>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">
                  {lesson.title}
                </span>
                <span className="text-xs text-text-muted">{lesson.track}</span>
              </div>
            </td>
            <td className={cn(TABLE_CELL_CLASS_NAME, "text-text-secondary")}>
              {lesson.algorithmName ?? "—"}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "text-right whitespace-nowrap text-text-secondary tabular-nums",
              )}
            >
              {formatNumber(lesson.durationMinutes)} phút
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <Badge tone={LESSON_STATUSES[lesson.status].tone}>
                {LESSON_STATUSES[lesson.status].label}
              </Badge>
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary tabular-nums",
              )}
            >
              {formatDate(lesson.updatedAt)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <RowActions>
                <EditDialog entityLabel="bài học" itemName={lesson.title}>
                  <LessonFormFields
                    idPrefix={`lesson-${lesson.id}`}
                    algorithmNames={algorithmNames}
                    lesson={lesson}
                  />
                </EditDialog>
                <ConfirmDeleteDialog
                  entityLabel="bài học"
                  itemName={lesson.title}
                />
              </RowActions>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
