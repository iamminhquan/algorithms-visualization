import { Trash2 } from "lucide-react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PreviewNote } from "./preview-note";

type ConfirmDeleteDialogProps = {
  entityLabel: string;
  itemName: string;
  blockedReason?: string;
};

export function ConfirmDeleteDialog({
  entityLabel,
  itemName,
  blockedReason,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      title={
        blockedReason ? `Không thể xoá ${entityLabel}` : `Xoá ${entityLabel}?`
      }
      trigger={<Trash2 aria-hidden="true" />}
      triggerLabel={`Xoá ${entityLabel} ${itemName}`}
      triggerClassName={getButtonClassName(
        "ghost",
        "icon",
        "hover:bg-danger-subtle hover:text-danger-text",
      )}
      size="sm"
    >
      <form method="dialog" className="flex flex-col">
        <p className="px-5 py-5 text-sm leading-6 text-text-secondary">
          {blockedReason ?? (
            <>
              Bạn có chắc muốn xoá {entityLabel}{" "}
              <strong className="font-semibold text-text-primary">
                “{itemName}”
              </strong>
              ? Thao tác này không thể hoàn tác.
            </>
          )}
        </p>
        <div className="flex flex-col gap-3 border-t border-border-default px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <PreviewNote />
          <div className="flex justify-end gap-2">
            {blockedReason ? (
              <button type="submit" className={getButtonClassName("secondary")}>
                Đã hiểu
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  value="cancel"
                  className={getButtonClassName("secondary")}
                >
                  Huỷ
                </button>
                <button type="submit" className={getButtonClassName("danger")}>
                  Xoá
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
