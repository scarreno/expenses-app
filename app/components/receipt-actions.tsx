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

type Props = {
  addItem: () => void;
  handleSave: () => void;
  handleCancelPreview: () => void;
  saving: boolean;
};

export function ReceiptActions({
  addItem,
  handleSave,
  saving,
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
        Add item
      </Button>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner className="mr-2 size-4" />
            Saving...
          </>
        ) : (
          <>
            <IconDeviceFloppy className="mr-2 size-4" />
            Save receipt
          </>
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Discard receipt preview?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will delete the uploaded file and discard all extracted
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Keep reviewing
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleCancelPreview}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}