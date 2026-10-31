import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
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
  SAMPLE_USERS,
  USER_ROLES,
  USER_STATUSES,
} from "../_components/sample-data";
import { UserAvatar } from "../_components/user-avatar";
import { UserFormFields } from "./_components/user-form-fields";

export const metadata: Metadata = {
  title: "Người dùng",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Người dùng" },
  { label: "Vai trò" },
  { label: "Trạng thái" },
  { label: "Ngày tham gia" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Tài khoản quản trị, giáo viên và học viên. Vai trò quyết định ai được tạo lớp, giao bài và vào trang quản trị."
        breadcrumb={[{ label: "Người dùng" }]}
        isSampleData
        actions={
          <FormDialog
            title="Thêm người dùng"
            description="Người dùng nhận email mời và tự đặt mật khẩu khi kích hoạt."
            trigger={
              <>
                <UserPlus aria-hidden="true" />
                Thêm người dùng
              </>
            }
            triggerClassName={getButtonClassName("primary")}
            submitLabel="Gửi lời mời"
          >
            <UserFormFields idPrefix="user-new" />
          </FormDialog>
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={SAMPLE_USERS.length}
        itemLabel="người dùng"
        searchPlaceholder="Tìm theo tên hoặc email"
        emptyMessage="Chưa có người dùng nào."
        filters={
          <>
            <Select
              aria-label="Lọc theo vai trò"
              defaultValue=""
              className="w-full sm:w-40"
            >
              <option value="">Tất cả vai trò</option>
              {Object.entries(USER_ROLES).map(([role, option]) => (
                <option key={role} value={role}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Lọc theo trạng thái"
              defaultValue=""
              className="w-full sm:w-44"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(USER_STATUSES).map(([status, option]) => (
                <option key={status} value={status}>
                  {option.label}
                </option>
              ))}
            </Select>
          </>
        }
      >
        {SAMPLE_USERS.map((user) => (
          <tr key={user.id} className={TABLE_ROW_CLASS_NAME}>
            <td className={TABLE_CELL_CLASS_NAME}>
              <div className="flex items-center gap-3">
                <UserAvatar name={user.name} />
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {user.name}
                  </span>
                  <span className="text-xs text-text-muted">{user.email}</span>
                </div>
              </div>
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <Badge tone={USER_ROLES[user.role].tone}>
                {USER_ROLES[user.role].label}
              </Badge>
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <Badge tone={USER_STATUSES[user.status].tone}>
                {USER_STATUSES[user.status].label}
              </Badge>
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary tabular-nums",
              )}
            >
              {formatDate(user.joinedAt)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <RowActions>
                <EditDialog entityLabel="người dùng" itemName={user.name}>
                  <UserFormFields idPrefix={`user-${user.id}`} user={user} />
                </EditDialog>
                <ConfirmDeleteDialog
                  entityLabel="người dùng"
                  itemName={user.name}
                />
              </RowActions>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
