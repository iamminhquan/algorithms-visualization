import { Pencil, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getUserCatalog } from "@/features/auth/queries";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/features/auth/user-actions";
import { getUserStatus } from "@/features/auth/user-types";
import { requireAdminUser } from "@/features/learning/auth";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { AdminPageSkeleton } from "../_components/admin-page-skeleton";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../_components/data-table";
import { PageHeader } from "../_components/page-header";
import { RowActions } from "../_components/row-actions";
import { UserAvatar } from "../_components/user-avatar";
import { USER_ROLES, USER_STATUSES } from "../_components/user-meta";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import { UserFormDialog } from "./_components/user-form-dialog";

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
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}

async function AdminUsersContent() {
  const actor = await requireAdminUser();
  const users = await getUserCatalog();

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Tài khoản quản trị, giảng viên và học viên. Vai trò quyết định ai được tạo lớp, giao bài và vào trang quản trị."
        breadcrumb={[{ label: "Người dùng" }]}
        actions={
          <UserFormDialog
            action={createUserAction}
            mode="invite"
            trigger={
              <>
                <UserPlus aria-hidden="true" />
                Thêm người dùng
              </>
            }
            triggerClassName={getButtonClassName("primary")}
            idPrefix="user-new"
          />
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={users.length}
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
        {users.map((user) => {
          const status = getUserStatus(user);
          const role = USER_ROLES[user.role];
          const isSelf = user.id === actor.id;

          return (
            <tr key={user.id} className={TABLE_ROW_CLASS_NAME}>
              <td className={TABLE_CELL_CLASS_NAME}>
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} />
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">
                      {user.name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs font-normal text-text-muted">
                          (bạn)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-text-muted">
                      {user.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className={TABLE_CELL_CLASS_NAME}>
                <Badge tone={role.tone}>{role.label}</Badge>
              </td>
              <td className={TABLE_CELL_CLASS_NAME}>
                <Badge tone={USER_STATUSES[status].tone}>
                  {USER_STATUSES[status].label}
                </Badge>
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "whitespace-nowrap text-text-secondary tabular-nums",
                )}
              >
                {formatDate(user.createdAt)}
              </td>
              <td className={TABLE_CELL_CLASS_NAME}>
                <RowActions>
                  <UserFormDialog
                    action={updateUserAction}
                    mode="edit"
                    trigger={<Pencil aria-hidden="true" />}
                    triggerLabel={`Sửa người dùng ${user.name}`}
                    triggerClassName={getButtonClassName("ghost", "icon")}
                    idPrefix={`user-${user.id}`}
                    user={user}
                    status={status}
                  />
                  {!isSelf && (
                    <DeleteUserDialog
                      action={deleteUserAction}
                      userId={user.id}
                      userName={user.name}
                    />
                  )}
                </RowActions>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
