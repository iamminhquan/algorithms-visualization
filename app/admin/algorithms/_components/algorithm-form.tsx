import Link from "next/link";
import { Button, getButtonClassName } from "@/components/ui/button";
import { FormField, getFieldHintId } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SourceCode } from "@/engine/visualization";
import { ADMIN_ROUTES } from "../../_components/admin-routes";
import { Panel } from "../../_components/panel";
import { PreviewNote } from "../../_components/preview-note";
import { SourceCodeEditor } from "./source-code-editor";

const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

interface IAlgorithmFormValues {
  readonly key: string;
  readonly name: string;
  readonly slug: string;
  readonly categoryId: number;
  readonly description: string | null;
  readonly timeComplexity: string | null;
  readonly spaceComplexity: string | null;
}

interface ICategoryOption {
  readonly id: number;
  readonly name: string;
}

type AlgorithmFormProps = {
  categories: readonly ICategoryOption[];
  algorithm?: IAlgorithmFormValues;
  sourceCode?: SourceCode;
};

export function AlgorithmForm({
  categories,
  algorithm,
  sourceCode,
}: AlgorithmFormProps) {
  const isEditing = algorithm !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Thông tin chung"
        description="Tên, đường dẫn và danh mục hiển thị trên trang web."
      >
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <FormField label="Tên thuật toán" htmlFor="algorithm-name">
            <Input
              id="algorithm-name"
              name="name"
              defaultValue={algorithm?.name}
              placeholder="Ví dụ: Insertion Sort"
              required
            />
          </FormField>
          <FormField label="Danh mục" htmlFor="algorithm-category">
            <Select
              id="algorithm-category"
              name="categoryId"
              defaultValue={algorithm?.categoryId ?? ""}
              required
            >
              <option value="" disabled>
                Chọn danh mục
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Đường dẫn (slug)"
            htmlFor="algorithm-slug"
            hint="Chữ thường không dấu, nối bằng gạch ngang. Dùng trong URL."
          >
            <Input
              id="algorithm-slug"
              name="slug"
              defaultValue={algorithm?.slug}
              placeholder="insertion-sort"
              pattern={SLUG_PATTERN}
              aria-describedby={getFieldHintId("algorithm-slug")}
              className="font-mono"
              required
            />
          </FormField>
          <FormField
            label="Key"
            htmlFor="algorithm-key"
            hint={
              isEditing
                ? "Key nối với cài đặt trong code nên không đổi được."
                : "Phải trùng metadata.key của cài đặt trong code và không đổi được sau khi tạo."
            }
          >
            <Input
              id="algorithm-key"
              name="key"
              defaultValue={algorithm?.key}
              placeholder="insertion-sort"
              pattern={SLUG_PATTERN}
              readOnly={isEditing}
              aria-describedby={getFieldHintId("algorithm-key")}
              className="font-mono"
              required
            />
          </FormField>
          <FormField
            label="Mô tả"
            htmlFor="algorithm-description"
            className="sm:col-span-2"
          >
            <Textarea
              id="algorithm-description"
              name="description"
              defaultValue={algorithm?.description ?? undefined}
              placeholder="Một đoạn ngắn hiện dưới tiêu đề trang thuật toán."
              rows={3}
            />
          </FormField>
        </div>
      </Panel>

      <Panel
        title="Độ phức tạp"
        description="Ghi theo ký hiệu Big-O cho trường hợp xấu nhất."
      >
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <FormField label="Thời gian" htmlFor="algorithm-time-complexity">
            <Input
              id="algorithm-time-complexity"
              name="timeComplexity"
              defaultValue={algorithm?.timeComplexity ?? undefined}
              placeholder="O(n²)"
              className="font-mono"
            />
          </FormField>
          <FormField label="Bộ nhớ" htmlFor="algorithm-space-complexity">
            <Input
              id="algorithm-space-complexity"
              name="spaceComplexity"
              defaultValue={algorithm?.spaceComplexity ?? undefined}
              placeholder="O(1)"
              className="font-mono"
            />
          </FormField>
        </div>
      </Panel>

      <SourceCodeEditor sourceCode={sourceCode} />

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-border-default bg-bg-page/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
        <PreviewNote />
        <div className="flex justify-end gap-2">
          <Link
            href={ADMIN_ROUTES.algorithms}
            className={getButtonClassName("secondary")}
          >
            Huỷ
          </Link>
          <Button>{isEditing ? "Lưu thay đổi" : "Thêm thuật toán"}</Button>
        </div>
      </div>
    </div>
  );
}
