"use client";

import { useRouter } from "next/navigation";
import { IconCircleDashedMinus } from "@tabler/icons-react";
import { toast } from "sonner";

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
  receiptId: string;
  dictionary: Dictionary;
};

export function DeleteReceiptButton({ receiptId, dictionary }: Props) {
  const router = useRouter();

  async function handleDeleteReceipt() {
    try {
      const response = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(dictionary.receipt.notifications.deleteFailed);
      }

      toast.success(dictionary.receipt.notifications.deleted);

      router.push("/receipts");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(dictionary.receipt.notifications.deleteFailed);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-red-900/60 text-red-400 hover:bg-red-950 hover:text-red-200"
        >
          <IconCircleDashedMinus className="mr-2 size-4" />
          {dictionary.receipt.dialogs.delete.title}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dictionary.receipt.dialogs.delete.actions.confirm}</AlertDialogTitle>
          <AlertDialogDescription>
            {dictionary.receipt.dialogs.delete.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{dictionary.receipt.dialogs.delete.actions.cancel}</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDeleteReceipt}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {dictionary.receipt.dialogs.delete.title}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}