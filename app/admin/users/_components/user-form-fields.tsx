import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type ISampleUser,
  USER_ROLES,
  USER_STATUSES,
} from "../../_components/sample-data";

type UserFormFieldsProps = {
  idPrefix: string;
  user?: ISampleUser;
};

export function UserFormFields({ idPrefix, user }: UserFormFieldsProps) {
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
            defaultValue={user?.status ?? "invited"}
          >
            {Object.entries(USER_STATUSES).map(([status, option]) => (
              <option key={status} value={status}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </>
  );
}
