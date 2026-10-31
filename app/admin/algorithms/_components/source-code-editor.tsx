import { CodeXml, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CODE_LANGUAGE_LABELS,
  CODE_LANGUAGES,
  type SourceCode,
} from "@/engine/visualization";
import { formatNumber } from "@/lib/format";
import { ConfirmDeleteDialog } from "../../_components/confirm-delete-dialog";
import { FormDialog } from "../../_components/form-dialog";
import { Panel } from "../../_components/panel";

const MAX_EDITOR_ROWS = 20;

const ADDABLE_LANGUAGES = ["Python", "Java", "JavaScript", "C#"] as const;

type SourceCodeEditorProps = {
  sourceCode?: SourceCode;
};

export function SourceCodeEditor({ sourceCode }: SourceCodeEditorProps) {
  const entries = CODE_LANGUAGES.flatMap((language) => {
    const lines = sourceCode?.[language];
    return lines ? [{ language, lines }] : [];
  });

  return (
    <Panel
      title="Mã nguồn"
      description="Hiện trong khung mã của trình mô phỏng, cạnh mã giả."
      actions={
        <FormDialog
          title="Thêm ngôn ngữ"
          description="Chọn ngôn ngữ rồi dán mã nguồn vào ô soạn thảo."
          trigger={
            <>
              <Plus aria-hidden="true" />
              Thêm ngôn ngữ
            </>
          }
          triggerClassName={getButtonClassName("secondary", "sm")}
          submitLabel="Thêm"
        >
          <FormField label="Ngôn ngữ" htmlFor="source-code-language">
            <Select
              id="source-code-language"
              name="language"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Chọn ngôn ngữ
              </option>
              {ADDABLE_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </Select>
          </FormField>
        </FormDialog>
      }
    >
      {entries.length === 0 ? (
        <div className="m-5 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-10 text-center text-sm text-text-secondary">
          <CodeXml aria-hidden="true" className="size-6 text-text-muted" />
          <p>Chưa có mã nguồn nào. Bấm “Thêm ngôn ngữ” để bắt đầu.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4 px-5 py-5">
          {entries.map(({ language, lines }) => {
            const label = CODE_LANGUAGE_LABELS[language];
            const editorId = `source-code-${language}`;
            return (
              <li
                key={language}
                className="overflow-hidden rounded-lg border border-border-default"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border-default bg-bg-subtle/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={editorId}
                      className="text-sm font-medium text-text-primary"
                    >
                      {label}
                    </label>
                    <Badge>{formatNumber(lines.length)} dòng</Badge>
                  </div>
                  <ConfirmDeleteDialog
                    entityLabel="mã nguồn"
                    itemName={label}
                  />
                </div>
                <Textarea
                  id={editorId}
                  name={`sourceCode.${language}`}
                  defaultValue={lines.join("\n")}
                  rows={Math.min(lines.length, MAX_EDITOR_ROWS)}
                  spellCheck={false}
                  wrap="off"
                  className="rounded-none border-0 bg-bg-page font-mono text-xs leading-5"
                />
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
