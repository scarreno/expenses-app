"use client";

import { useState } from "react";
import { ExtractReceiptResponse } from "@/app/types/receipt";

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
      <h1>Expenses MVP</h1>

      <br />

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 400,
        }}
      >
        <select name="receiptType" required>
          <option value="">Select receipt type</option>

          <option value="SUPERMARKET">Supermarket</option>
        </select>

        <input
          type="file"
          name="file"
          accept="image/*,application/pdf"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Upload receipt"}
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "red",
            marginTop: 24,
          }}
        >
          {error}
        </p>
      )}
      {preview && (
        <section style={{ marginTop: 32 }}>
          <div style={{ marginTop: 24 }}>
            <h3>Receipt file</h3>
            {preview.file.publicFileUrl.endsWith(".pdf") ? (
              <iframe
                src={`${preview.file.publicFileUrl}#view=FitH&zoom=page-width`}
                width="100%"
                height="600"
              />
            ) : (
              <img
                src={preview.file.publicFileUrl}
                alt="Receipt"
                style={{
                  maxWidth: "100%",
                  border: "1px solid #ccc",
                }}
              />
            )}
          </div>

          <h2>Receipt Preview</h2>

          <p>
            <label>
              Store
              <input
                value={preview.receipt.store ?? ""}
                onChange={(event) =>
                  updateReceiptField("store", event.target.value)
                }
              />
            </label>
          </p>

          <p>
            <label>
              Total
              <input
                type="number"
                value={preview.receipt.total ?? ""}
                onChange={(event) =>
                  updateReceiptField("total", event.target.value)
                }
              />
            </label>
          </p>

          <p>
            <strong>Items:</strong> {preview.receipt.items.length}
          </p>

          <table
            border={1}
            cellPadding={8}
            style={{
              marginTop: 16,
              borderCollapse: "collapse",
              width: "100%",
            }}
          >
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {preview.receipt.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      value={item.description}
                      onChange={(event) =>
                        updateItemField(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.quantity ?? ""}
                      onChange={(event) =>
                        updateItemField(index, "quantity", event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      value={item.unit ?? ""}
                      onChange={(event) =>
                        updateItemField(index, "unit", event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.unitPrice ?? ""}
                      onChange={(event) =>
                        updateItemField(index, "unitPrice", event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.totalPrice ?? ""}
                      onChange={(event) =>
                        updateItemField(index, "totalPrice", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeItem(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={addItem} style={{ marginTop: 16 }}>
            Add item
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 24 }}
          >
            {saving ? "Saving..." : "Save receipt"}
          </button>
        </section>
      )}
    </main>
  );
}
