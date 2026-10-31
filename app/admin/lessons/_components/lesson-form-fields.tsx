import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type ISampleLesson,
  LESSON_STATUSES,
  LESSON_TRACKS,
} from "../../_components/sample-data";

type LessonFormFieldsProps = {
  idPrefix: string;
  algorithmNames: readonly string[];
  lesson?: ISampleLesson;
};

export function LessonFormFields({
  idPrefix,
  algorithmNames,
  lesson,
}: LessonFormFieldsProps) {
  return (
    <>
      <FormField label="Tiêu đề" htmlFor={`${idPrefix}-title`}>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={lesson?.title}
          placeholder="Ví dụ: Sắp xếp nổi bọt từng bước"
          required
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Lộ trình" htmlFor={`${idPrefix}-track`}>
          <Select
            id={`${idPrefix}-track`}
            name="track"
            defaultValue={lesson?.track ?? LESSON_TRACKS[0]}
          >
            {LESSON_TRACKS.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Mô phỏng đi kèm" htmlFor={`${idPrefix}-algorithm`}>
          <Select
            id={`${idPrefix}-algorithm`}
            name="algorithm"
            defaultValue={lesson?.algorithmName ?? ""}
          >
            <option value="">Không có</option>
            {algorithmNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Thời lượng (phút)" htmlFor={`${idPrefix}-duration`}>
          <Input
            id={`${idPrefix}-duration`}
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={lesson?.durationMinutes ?? 15}
            required
          />
        </FormField>
        <FormField label="Trạng thái" htmlFor={`${idPrefix}-status`}>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            defaultValue={lesson?.status ?? "draft"}
          >
            {Object.entries(LESSON_STATUSES).map(([status, option]) => (
              <option key={status} value={status}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Nội dung" htmlFor={`${idPrefix}-content`}>
        <Textarea
          id={`${idPrefix}-content`}
          name="content"
          placeholder="Giải thích ý tưởng bằng lời trước khi người học mở mô phỏng."
          rows={5}
        />
      </FormField>
    </>
  );
}
