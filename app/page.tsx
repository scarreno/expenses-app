"use client";

import { useState } from "react";
import { ExtractReceiptResponse } from "@/app/types/receipt";
import { ReceiptItemsTable } from "@/app/components/receipt-items-table"
import { ReceiptFilePreview } from "@/app/components/receipt-file-preview";
import { ReceiptFormUpload } from "@/app/components/receipt-form-upload";
import { ReceiptActions } from  "@/app/components/receipt-actions";
import { ReceiptItemsSummary } from  "@/app/components/receipt-items-summary";
import { ErrorMessage } from  "@/app/components/error-message";
import { calculateReceiptTotal } from "@/app/lib/calculate-receipt-total";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ExtractReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/receipts/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract receipt");
      }
      const data: ExtractReceiptResponse = await response.json();
      setPreview(data);

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to extract receipt");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preview) return;

    setSaving(true);
    setError(null);

    console.log(preview.receipt);

    try {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptType: preview.receiptType,
          file: preview.file,
          receipt: preview.receipt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save receipt");
      }

      const savedReceipt = await response.json();
      toast.success("Receipt saved successfully");
      console.log(savedReceipt);
      router.push("/receipts");

    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to save receipt");
    } finally {
      setSaving(false);
    }
  }

  function updateItemField(
    index: number,
    field: keyof ExtractReceiptResponse["receipt"]["items"][number],
    value: string
  ) {
      if (!preview) return;

      const updatedItems = [...preview.receipt.items];
      const currentItem = updatedItems[index];

      const updatedItem = {
        ...currentItem,
        [field]:
          field === "description" || field === "sku" || field === "unit"
            ? value
            : value === ""
              ? null
              : Number(value),
      }

      if (field === "quantity" || field === "unitPrice") {
        const quantity =
          field === "quantity"
            ? Number(value)
            : updatedItem.quantity;

        const unitPrice =
          field === "unitPrice"
            ? Number(value)
            : updatedItem.unitPrice;

        updatedItem.totalPrice =
          quantity && unitPrice
            ? Math.round(quantity * unitPrice)
            : null;
      }

      updatedItems[index] = updatedItem;
      const receiptTotal = calculateReceiptTotal(updatedItems);

      setPreview({
        ...preview,
        receipt: {
          ...preview.receipt,
          total: receiptTotal,
          items: updatedItems,
        },
      });
  }

  async function removeItem(index: number) {
    if (!preview) return;

    const updatedItems = preview.receipt.items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    const receiptTotal = calculateReceiptTotal(updatedItems);
    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        total: receiptTotal,
        items: updatedItems,
      },
    });
  }

  async function addItem() {
    if (!preview) return;

    const updatedItems = [
    ...preview.receipt.items,
    {
      sku: null,
      description: "",
      quantity: 1,
      unit: "UNIT",
      unitPrice: null,
      totalPrice: null,
      category: null
    },
  ];

  const receiptTotal = calculateReceiptTotal(updatedItems);

    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        items: updatedItems,
        total: receiptTotal
      },
    });
  }
  
  function updateReceiptField(
    field: keyof ExtractReceiptResponse["receipt"],
    value: string) {

    if (!preview) {
      return;
    }

    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        [field]: value,
      }
    });
  }

return (
  <main className="p-8">
    {!preview && (
      <ReceiptFormUpload
        handleSubmit={handleSubmit}
        loading={loading}
      />
    )}

    {error && <ErrorMessage message={error} />}

    {preview && (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Receipt Preview
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and adjust the extracted items before saving.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setPreview(null)}
          >
            Upload another receipt
          </Button>
        </div>

        <section className="grid gap-6 lg:grid-cols-[25%_75%]">
          <ReceiptFilePreview fileUrl={preview.file.publicFileUrl} />

          <div>
            <ReceiptItemsSummary
              store={preview.receipt.store}
              total={preview.receipt.total}
              purchaseDate={preview.receipt.purchaseDate}
              editable
              updateReceiptField={updateReceiptField}
            />

            <div className="mt-6 overflow-x-auto">
              <ReceiptItemsTable
                items={preview.receipt.items}
                updateItemField={updateItemField}
                removeItem={removeItem}
                readonly={false}
              />
            </div>

            <ReceiptActions
              addItem={addItem}
              handleSave={handleSave}
              saving={saving}
            />
          </div>
        </section>
      </>
    )}
  </main>
);
}
