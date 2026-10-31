import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PreviewNote } from "./preview-note";

type FormDialogProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  triggerClassName: string;
  triggerLabel?: string;
  submitLabel: string;
  children: ReactNode;
};

export function FormDialog({
  submitLabel,
  children,
  ...dialogProps
}: FormDialogProps) {
  return (
    <Dialog {...dialogProps}>
      <form method="dialog" className="flex flex-col">
        <div className="flex flex-col gap-4 px-5 py-5">{children}</div>
        <div className="flex flex-col gap-3 border-t border-border-default px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <PreviewNote />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              formNoValidate
              value="cancel"
              className={getButtonClassName("secondary")}
            >
              Huỷ
            </button>
            <button type="submit" className={getButtonClassName("primary")}>
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

type EditDialogProps = {
  entityLabel: string;
  itemName: string;
  children: ReactNode;
};

export function EditDialog({
  entityLabel,
  itemName,
  children,
}: EditDialogProps) {
  return (
    <FormDialog
      title={`Sửa ${entityLabel}`}
      description={itemName}
      trigger={<Pencil aria-hidden="true" />}
      triggerLabel={`Sửa ${entityLabel} ${itemName}`}
      triggerClassName={getButtonClassName("ghost", "icon")}
      submitLabel="Lưu thay đổi"
    >
      {children}
    </FormDialog>
  );
}
