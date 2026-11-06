import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { User } from "@/db/schema";
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
          required
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
        <FormField label="Trạng thái" htmlFor={`${idPrefix}-status`}>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            defaultValue={status ?? "invited"}
          >
            {Object.entries(USER_STATUSES).map(([value, option]) => (
              <option key={value} value={value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </>
  );
}
