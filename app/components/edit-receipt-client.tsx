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
};

export function EditReceiptClient({ receipt, categories, settings }: Props) {
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
        throw new Error("Failed to update receipt");
        }

        toast.success(
        "Receipt updated successfully"
        );

        router.push("/receipts");
    } catch (error) {
        console.error(error);

        const message =
        error instanceof Error
            ? error.message
            : "Unknown error";

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
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Receipt
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the receipt information and adjust extracted items.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/receipts`}>
            <IconChevronsLeft className="mr-2 size-4" />
            Back to receipts
          </Link>
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[35%_65%]">
        <ReceiptFilePreview fileUrl={editableReceipt.publicFileUrl ?? ""} />

        <div className="space-y-6">
          <ReceiptItemsSummary
            store={editableReceipt.store}
            total={editableReceipt.total}
            purchaseDate={editableReceipt.purchaseDate}
            editable
            updateReceiptField={updateReceiptField}
            settings={settings}
          />

          <div className="overflow-x-auto">
            <ReceiptItemsTable
              items={editableReceipt.items}
              readonly={false}
              categories={categories}
              updateItemField={updateItemField}
              removeItem={removeItem}
              settings={settings}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link href={`/receipts`}>
                Cancel
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
                            Saving...
                            </>
                        ) : (
                            <>
                            <IconDeviceFloppy className="mr-2 size-4" />
                            Save Changes
                            </>
                        )}

                </Button>
          </div>
        </div>
      </section>
    </main>
  );
}