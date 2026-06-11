"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronsLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReceiptFilePreview } from "@/app/components/receipt-file-preview";
import { ReceiptItemsSummary } from "@/app/components/receipt-items-summary";
import { ReceiptItemsTable } from "@/app/components/receipt-items-table";
import { calculateReceiptTotal } from "@/app/lib/calculate-receipt-total";
import { CategoryOption } from "@/app/types/category-option";
import { Spinner } from "@/components/ui/spinner"
import { UserSettings } from "@/app/types/user-settings-types";
import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { PageHeaderActions } from "@/app/components/layout/page-header-actions";
import { Dictionary } from "@/app/types/dictionary";

type EditableReceipt = {
  id: string;
  store: string | null;
  total: number | null;
  purchaseDate: string | null;
  publicFileUrl: string | null;
  items: {
    id: string;
    sku: string | null;
    description: string;
    quantity: number | null;
    unit: string | null;
    unitPrice: number | null;
    totalPrice: number | null;
    category: string | null;
  }[];
};

type Props = {
  receipt: EditableReceipt;
  categories: CategoryOption[];
  settings: UserSettings;
  dictionary: Dictionary;
};

export function EditReceiptClient({ receipt, categories, settings, dictionary }: Props) {
    const router = useRouter();
    const [editableReceipt, setEditableReceipt] = useState(receipt);
    const [saving, setSaving] = useState(false);

  function updateReceiptField(
    field: keyof EditableReceipt,
    value: string
  ) {
    setEditableReceipt({
      ...editableReceipt,
      [field]: value,
    });
  }

  async function handleSaveChanges() {
    setSaving(true);

    try {
        const response = await fetch(
        `/api/receipts/${editableReceipt.id}`,
        {
            method: "PATCH",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            receipt: editableReceipt,
            }),
        }
        );

        if (!response.ok) {
        throw new Error(dictionary.receipt.notifications.updateFailed);
        }

        toast.success(dictionary.receipt.notifications.updated);

        router.push("/receipts");
    } catch (error) {
        console.error(error);

        const message =
        error instanceof Error
            ? error.message
            : dictionary.receipt.errors.unknown;

        toast.error(message);
    } finally {
        setSaving(false);
    }
    }

  function updateItemField(
    index: number,
    field: keyof EditableReceipt["items"][number],
    value: string
  ) {
    const updatedItems = [...editableReceipt.items];
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
      const quantity =
        field === "quantity" ? Number(value) : updatedItem.quantity;

      const unitPrice =
        field === "unitPrice" ? Number(value) : updatedItem.unitPrice;

      updatedItem.totalPrice =
        quantity && unitPrice
          ? Math.round(quantity * unitPrice)
          : null;
    }

    updatedItems[index] = updatedItem;

    setEditableReceipt({
      ...editableReceipt,
      total: calculateReceiptTotal(updatedItems),
      items: updatedItems,
    });
  }

  function removeItem(index: number) {
    const updatedItems = editableReceipt.items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setEditableReceipt({
      ...editableReceipt,
      total: calculateReceiptTotal(updatedItems),
      items: updatedItems,
    });
  }


 return (
  <PageContainer className="max-w-[1600px]">
    <PageHeaderActions>
      <PageHeader
        title={dictionary.receipt.pages.edit.title}
        description={dictionary.receipt.pages.edit.description}
      />

      <Button asChild variant="outline">
        <Link href="/receipts">
          <IconChevronsLeft className="mr-2 size-4" />
          {dictionary.receipt.actions.backToReceipts}
        </Link>
      </Button>
    </PageHeaderActions>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0">
          <ReceiptFilePreview 
            fileUrl={editableReceipt.publicFileUrl ?? ""}
            dictionary={dictionary} />
        </div>

        <div className="min-w-0 space-y-6">
          <ReceiptItemsSummary
            store={editableReceipt.store}
            total={editableReceipt.total}
            purchaseDate={editableReceipt.purchaseDate}
            editable
            updateReceiptField={updateReceiptField}
            settings={settings}
            dictionary={dictionary}
          />

            <ReceiptItemsTable
              items={editableReceipt.items}
              readonly={false}
              categories={categories}
              updateItemField={updateItemField}
              removeItem={removeItem}
              settings={settings}
              dictionary={dictionary}
            />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href={`/receipts`}>
                {dictionary.receipt.actions.cancel}
              </Link>
            </Button>

            <Button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                >

                {saving ? (
                            <>
                            <Spinner className="mr-2 size-4" />
                            {dictionary.receipt.actions.savingChanges}
                            </>
                        ) : (
                            <>
                            <IconDeviceFloppy className="mr-2 size-4" />
                            {dictionary.receipt.actions.saveChanges}
                            </>
                        )}

                </Button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}