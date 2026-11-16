"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorMessage } from "@/app/components/error-message";
import { PageHeader } from "@/app/components/layout/page-header";
import { PageHeaderActions } from "@/app/components/layout/page-header-actions";
import { ReceiptActions } from "@/app/components/receipt-actions";
import { ReceiptFilePreview } from "@/app/components/receipt-file-preview";
import { ReceiptItemsSummary } from "@/app/components/receipt-items-summary";
import { ReceiptItemsTable } from "@/app/components/receipt-items-table";
import { calculateReceiptTotal } from "@/app/lib/receipts/calculate-receipt-total";
import { CategoryOption } from "@/app/types/category-option";
import { Dictionary } from "@/app/types/dictionary";
import { ExtractReceiptResponse } from "@/app/types/receipt";
import { UserSettings } from "@/app/types/user-settings-types";
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
  initialPreview: ExtractReceiptResponse;
  categories: CategoryOption[];
  settings: UserSettings;
  dictionary: Dictionary;
  onSaved?: () => void;
  onDiscarded?: () => void;
};

export function ReceiptExtractionReview({
  receiptId,
  initialPreview,
  categories,
  settings,
  dictionary,
  onSaved,
  onDiscarded,
}: Props) {
  const router = useRouter();
  const [preview, setPreview] = useState(initialPreview);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finishSaved() {
    if (onSaved) {
      onSaved();
      return;
    }
    router.push("/receipts");
  }

  function finishDiscarded() {
    if (onDiscarded) {
      onDiscarded();
      return;
    }
    router.push("/receipts");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/receipts/${receiptId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptType: preview.receiptType,
          receipt: preview.receipt,
        }),
      });

      if (!response.ok) {
        throw new Error(dictionary.receipt.notifications.saveFailed);
      }

      toast.success(dictionary.receipt.notifications.saved);
      finishSaved();
    } catch (saveError) {
      console.error(saveError instanceof Error ? saveError.message : "save failed");
      setError(
        saveError instanceof Error
          ? saveError.message
          : dictionary.receipt.errors.unknown,
      );
      toast.error(dictionary.receipt.notifications.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelPreview() {
    try {
      const response = await fetch(`/api/receipts/${receiptId}/discard`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(dictionary.receipt.notifications.deleteFailed);
      }

      finishDiscarded();
    } catch (discardError) {
      console.error(
        discardError instanceof Error ? discardError.message : "discard failed",
      );
      toast.error(dictionary.receipt.notifications.deleteFailed);
    }
  }

  function updateItemField(
    index: number,
    field: keyof ExtractReceiptResponse["receipt"]["items"][number],
    value: string,
  ) {
    const updatedItems = [...preview.receipt.items];
    const currentItem = updatedItems[index];
    const stringFields = ["description", "sku", "unit", "category"];
    const parsedValue = stringFields.includes(field)
      ? value
      : value === ""
        ? null
        : Number(value);

    const updatedItem = {
      ...currentItem,
      [field]: parsedValue,
    };

    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? Number(value) : updatedItem.quantity;
      const unitPrice = field === "unitPrice" ? Number(value) : updatedItem.unitPrice;
      updatedItem.totalPrice =
        quantity && unitPrice ? Math.round(quantity * unitPrice) : null;
    }

    updatedItems[index] = updatedItem;
    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        total: calculateReceiptTotal(updatedItems),
        items: updatedItems,
      },
    });
  }

  function removeItem(index: number) {
    const updatedItems = preview.receipt.items.filter((_, itemIndex) => itemIndex !== index);
    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        total: calculateReceiptTotal(updatedItems),
        items: updatedItems,
      },
    });
  }

  function addItem() {
    const updatedItems = [
      ...preview.receipt.items,
      {
        sku: null,
        description: "",
        quantity: 1,
        unit: "UNIT",
        unitPrice: null,
        totalPrice: null,
        category: null,
      },
    ];

    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        items: updatedItems,
        total: calculateReceiptTotal(updatedItems),
      },
    });
  }

  function updateReceiptField(
    field: "store" | "purchaseDate",
    value: string,
  ) {
    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        [field]: value,
      },
    });
  }

  return (
    <>
      <PageHeaderActions>
        <PageHeader
          title={dictionary.receipt.pages.preview.title}
          description={dictionary.receipt.pages.preview.description}
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline">
              {dictionary.receipt.actions.uploadAnotherReceipt}
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
      </PageHeaderActions>

      {error && <ErrorMessage message={error} />}

      <section className="grid min-w-0 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0">
          <ReceiptFilePreview
            fileUrl={preview.file.publicFileUrl}
            dictionary={dictionary}
          />
        </div>

        <div className="min-w-0 space-y-6">
          <ReceiptItemsSummary
            store={preview.receipt.store}
            total={preview.receipt.total}
            purchaseDate={preview.receipt.purchaseDate}
            editable
            updateReceiptField={updateReceiptField}
            settings={settings}
            dictionary={dictionary}
          />

          <ReceiptItemsTable
            items={preview.receipt.items}
            updateItemField={updateItemField}
            removeItem={removeItem}
            readonly={false}
            categories={categories}
            settings={settings}
            dictionary={dictionary}
          />

          <ReceiptActions
            addItem={addItem}
            handleSave={handleSave}
            saving={saving}
            handleCancelPreview={handleCancelPreview}
            dictionary={dictionary}
          />
        </div>
      </section>
    </>
  );
}
