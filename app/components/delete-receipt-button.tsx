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

type Props = {
  receiptId: string;
};

export function DeleteReceiptButton({ receiptId }: Props) {
  const router = useRouter();

  async function handleDeleteReceipt() {
    try {
      const response = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete receipt");
      }

      toast.success("Receipt deleted successfully");

      router.push("/receipts");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete receipt");
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
          Delete Receipt
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete receipt?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this receipt and its extracted items.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDeleteReceipt}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Receipt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}