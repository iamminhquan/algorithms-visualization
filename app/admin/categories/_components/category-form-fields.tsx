import { FormField, getFieldHintId } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";

const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

interface ICategoryFormValues {
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
}

type CategoryFormFieldsProps = {
  idPrefix: string;
  category?: ICategoryFormValues;
};

export function CategoryFormFields({
  idPrefix,
  category,
}: CategoryFormFieldsProps) {
  const slugId = `${idPrefix}-slug`;
  return (
    <>
      <FormField label="Tên danh mục" htmlFor={`${idPrefix}-name`}>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={category?.name}
          placeholder="Ví dụ: Thuật toán sắp xếp"
          required
        />
      </FormField>
      <FormField
        label="Đường dẫn (slug)"
        htmlFor={slugId}
        hint="Chữ thường không dấu, nối bằng gạch ngang. Dùng trong URL /visualization/…"
      >
        <Input
          id={slugId}
          name="slug"
          defaultValue={category?.slug}
          placeholder="sorting"
          pattern={SLUG_PATTERN}
          aria-describedby={getFieldHintId(slugId)}
          className="font-mono"
          required
        />
      </FormField>
      <FormField label="Mô tả" htmlFor={`${idPrefix}-description`}>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={category?.description ?? undefined}
          placeholder="Một câu giới thiệu hiện trên trang danh mục."
          rows={3}
        />
      </FormField>
    </>
  );
}
