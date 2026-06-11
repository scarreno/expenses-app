import {
  IconDeviceFloppy,
  IconPlus,
} from "@tabler/icons-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  addItem: () => void;
  handleSave: () => void;
  handleCancelPreview: () => void;
  saving: boolean;
  dictionary: Dictionary;
};

export function ReceiptActions({
  addItem,
  handleSave,
  saving,
  dictionary,
  handleCancelPreview,
}: Props) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
      >
        <IconPlus className="mr-2 size-4" />
        {dictionary.receipt.actions.addItem}
      </Button>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner className="mr-2 size-4" />
            {dictionary.receipt.actions.savingReceipt}
          </>
        ) : (
          <>
            <IconDeviceFloppy className="mr-2 size-4" />
            {dictionary.receipt.actions.saveReceipt}
          </>
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
          >
            {dictionary.receipt.actions.cancel}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dictionary.receipt.dialogs.discardPreview.title}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {dictionary.receipt.dialogs.discardPreview.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              {dictionary.receipt.dialogs.discardPreview.actions.keepReviewing}
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleCancelPreview}>
              {dictionary.receipt.dialogs.discardPreview.actions.discard}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}