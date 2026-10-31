import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
import { CLASS_STATUSES, SAMPLE_CLASSES } from "../_components/sample-data";
import { ClassFormFields } from "./_components/class-form-fields";

export const metadata: Metadata = {
  title: "Lớp học",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Lớp học" },
  { label: "Giáo viên" },
  { label: "Học viên", align: "right" },
  { label: "Bài đã giao", align: "right" },
  { label: "Trạng thái" },
  { label: "Bắt đầu" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

export default function AdminClassesPage() {
  return (
    <>
      <PageHeader
        title="Lớp học"
        description="Giáo viên mở lớp, mời học viên bằng mã lớp và giao bài học kèm mô phỏng."
        breadcrumb={[{ label: "Lớp học" }]}
        isSampleData
        actions={
          <FormDialog
            title="Mở lớp học"
            trigger={
              <>
                <Plus aria-hidden="true" />
                Mở lớp học
              </>
            }
            triggerClassName={getButtonClassName("primary")}
            submitLabel="Mở lớp"
          >
            <ClassFormFields idPrefix="class-new" />
          </FormDialog>
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={SAMPLE_CLASSES.length}
        itemLabel="lớp học"
        searchPlaceholder="Tìm theo tên hoặc mã lớp"
        emptyMessage="Chưa có lớp học nào."
        filters={
          <Select
            aria-label="Lọc theo trạng thái"
            defaultValue=""
            className="w-full sm:w-44"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(CLASS_STATUSES).map(([status, option]) => (
              <option key={status} value={status}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      >
        {SAMPLE_CLASSES.map((sampleClass) => (
          <tr key={sampleClass.id} className={TABLE_ROW_CLASS_NAME}>
            <td className={TABLE_CELL_CLASS_NAME}>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">
                  {sampleClass.name}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {sampleClass.code}
                </span>
              </div>
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary",
              )}
            >
              {sampleClass.teacherName}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "text-right font-medium text-text-primary tabular-nums",
              )}
            >
              {formatNumber(sampleClass.studentCount)}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "text-right text-text-secondary tabular-nums",
              )}
            >
              {formatNumber(sampleClass.lessonCount)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <Badge tone={CLASS_STATUSES[sampleClass.status].tone}>
                {CLASS_STATUSES[sampleClass.status].label}
              </Badge>
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary tabular-nums",
              )}
            >
              {formatDate(sampleClass.startsAt)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <RowActions>
                <EditDialog entityLabel="lớp học" itemName={sampleClass.name}>
                  <ClassFormFields
                    idPrefix={`class-${sampleClass.id}`}
                    sampleClass={sampleClass}
                  />
                </EditDialog>
                <ConfirmDeleteDialog
                  entityLabel="lớp học"
                  itemName={sampleClass.name}
                />
              </RowActions>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
