import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { User } from "@/db/schema";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/limits";
import {
  USER_ROLES,
  USER_STATUSES,
  type UserStatus,
} from "../../_components/user-meta";

type UserFormFieldsProps = {
  idPrefix: string;
  user?: Pick<User, "name" | "email" | "role">;
  status?: UserStatus;
};

export function UserFormFields({
  idPrefix,
  user,
  status,
}: UserFormFieldsProps) {
  return (
    <>
      <FormField label="Họ và tên" htmlFor={`${idPrefix}-name`}>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={user?.name}
          placeholder="Nguyễn Văn A"
          autoComplete="off"
          required
        />
      </FormField>
      <FormField label="Email" htmlFor={`${idPrefix}-email`}>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          defaultValue={user?.email}
          placeholder="ban@example.com"
          autoComplete="off"
          readOnly={user !== undefined}
          required
        />
      </FormField>
      <FormField
        label={user === undefined ? "Mật khẩu" : "Mật khẩu mới"}
        htmlFor={`${idPrefix}-password`}
        hint={
          user === undefined
            ? `Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự. Người dùng dùng mật khẩu này để đăng nhập.`
            : `Để trống nếu không đổi mật khẩu. Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`
        }
      >
        <Input
          id={`${idPrefix}-password`}
          name="password"
          type="password"
          placeholder={
            user === undefined
              ? `Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`
              : "Nhập mật khẩu mới"
          }
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required={user === undefined}
        />
      </FormField>
      <FormField
        label="Nhập lại mật khẩu"
        htmlFor={`${idPrefix}-password-confirm`}
        hint={
          user === undefined
            ? undefined
            : "Chỉ nhập khi muốn đặt lại mật khẩu cho người dùng."
        }
      >
        <Input
          id={`${idPrefix}-password-confirm`}
          name="passwordConfirm"
          type="password"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required={user === undefined}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Vai trò" htmlFor={`${idPrefix}-role`}>
          <Select
            id={`${idPrefix}-role`}
            name="role"
            defaultValue={user?.role ?? "student"}
          >
            {Object.entries(USER_ROLES).map(([role, option]) => (
              <option key={role} value={role}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        {status !== undefined && (
          <FormField label="Trạng thái" htmlFor={`${idPrefix}-status`}>
            <Select
              id={`${idPrefix}-status`}
              name="status"
              defaultValue={status}
            >
              {Object.entries(USER_STATUSES).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        )}
      </div>
      {user !== undefined && (
        <p className="text-xs text-text-muted">
          Đổi trạng thái sang “Chờ kích hoạt” sẽ thu hồi trạng thái đã xác thực
          email của tài khoản.
        </p>
      )}
    </>
  );
}
