import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type ISampleClass,
  SAMPLE_TEACHERS,
} from "../../_components/sample-data";

type ClassFormFieldsProps = {
  idPrefix: string;
  sampleClass?: ISampleClass;
};

export function ClassFormFields({
  idPrefix,
  sampleClass,
}: ClassFormFieldsProps) {
  return (
    <>
      <FormField label="Tên lớp" htmlFor={`${idPrefix}-name`}>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={sampleClass?.name}
          placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật – K24"
          required
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Mã lớp" htmlFor={`${idPrefix}-code`}>
          <Input
            id={`${idPrefix}-code`}
            name="code"
            defaultValue={sampleClass?.code}
            placeholder="CTDL-K24"
            className="font-mono uppercase"
            required
          />
        </FormField>
        <FormField label="Giáo viên" htmlFor={`${idPrefix}-teacher`}>
          <Select
            id={`${idPrefix}-teacher`}
            name="teacher"
            defaultValue={sampleClass?.teacherName ?? ""}
            required
          >
            <option value="" disabled>
              Chọn giáo viên
            </option>
            {SAMPLE_TEACHERS.map((teacher) => (
              <option key={teacher.id} value={teacher.name}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Ngày bắt đầu" htmlFor={`${idPrefix}-starts-at`}>
          <Input
            id={`${idPrefix}-starts-at`}
            name="startsAt"
            type="date"
            defaultValue={sampleClass?.startsAt}
            required
          />
        </FormField>
      </div>
      <FormField label="Mô tả" htmlFor={`${idPrefix}-description`}>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          placeholder="Mục tiêu và lịch học của lớp."
          rows={3}
        />
      </FormField>
    </>
  );
}
