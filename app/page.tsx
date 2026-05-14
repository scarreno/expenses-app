"use client";

import { useState } from "react";
import { ExtractReceiptResponse } from "@/app/types/receipt";
import { ReceiptItemsTable } from "@/app/components/receipt-items-table"
import { ReceiptFilePreview } from "@/app/components/receipt-file-preview";
import { ReceiptFormUpload } from "@/app/components/receipt-form-upload";
import { ReceiptActions } from  "@/app/components/receipt-actions";
import { ReceiptItemsSummary } from  "@/app/components/receipt-items-summary";
import { ErrorMessage } from  "@/app/components/error-message";

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

  function updateReceiptField(
    field: keyof ExtractReceiptResponse["receipt"],
    value: string
  ) {
    if (!preview) return;

    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        [field]: value,
      },
    });
  }

  function updateItemField(
    index: number,
    field: keyof ExtractReceiptResponse["receipt"]["items"][number],
    value: string
  ) {
    if (!preview) return;

    const updatedItems = [...preview.receipt.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "description" || field === "sku" || field === "unit"
          ? value
          : value === ""
            ? null
            : Number(value),
    };

    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        items: updatedItems,
      },
    });
  }

  async function removeItem(index: number) {
    if (!preview) return;

    const updatedItems = preview.receipt.items.filter(
      (_, itemIndex) => itemIndex !== index
    );
    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        items: updatedItems,
      },
    });
  }

  async function addItem() {
    if (!preview) return;

    setPreview({
      ...preview,
      receipt: {
        ...preview.receipt,
        items: [
          ...preview.receipt.items,
          {
            sku: null,
            description: "",
            quantity: 1,
            unit: "UNIT",
            unitPrice: null,
            totalPrice: null,
          },
        ],
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
                receipt={preview.receipt}
                updateReceiptField={updateReceiptField}/>

            <div style={{ overflowX: "auto", marginTop: 24 }}>
             <ReceiptItemsTable  
                items={preview.receipt.items} 
                updateItemField={updateItemField} 
                removeItem={removeItem}
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
