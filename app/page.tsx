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
import { prismaVersion } from './generated/prisma/internal/prismaNamespace';

export default function HomePage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ExtractReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preview) return;

    setSaving(true);
    setError(null);

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
      alert("Receipt saved successfully");
      console.log(savedReceipt);
    } catch (error) {
      console.error(error);

      setError(error instanceof Error ? error.message : "Unknown error");
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

  return (
    <main style={{ padding: 32 }}>
      <ReceiptFormUpload 
          handleSubmit={handleSubmit}
          loading={loading} 
          />

      {error && (
        <ErrorMessage message={error} />
      )}

      {preview && (
        <section
          style={{
            marginTop: 32,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDE */}

          <ReceiptFilePreview fileUrl={preview.file.publicFileUrl}/>
          {/* RIGHT SIDE */}
          <div>
             <ReceiptItemsSummary 
                store={preview.receipt.store}
                total={preview.receipt.total}
                />

            <div style={{ overflowX: "auto", marginTop: 24 }}>
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
      )}
    </main>
  );
}
