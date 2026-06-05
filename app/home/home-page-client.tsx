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
import {
  uploadReceiptFileFromClient,
  deleteReceiptFileFromClient,
} from "@/app/lib/client-storage";
import { CategoryOption } from "@/app/types/category-option";
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
import { UserSettings } from "@/app/types/user-settings-types";

type Props = {
    categories: CategoryOption[];   
    settings: UserSettings;
};

type UploadedReceiptFile = {
    filePath: string;
    generatedFileName: string;
    publicFileUrl: string;
};

export  function HomePageClient({ categories, settings }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ExtractReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedReceiptFile | null>(null);
  

  const router = useRouter();
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    let uploadedReceiptFile: UploadedReceiptFile | null = null;

    try {
      const formData = new FormData(event.currentTarget);

      const file = formData.get("file");
      const receiptType = formData.get("receiptType");

      if (!(file instanceof File) || file.size === 0) {
        throw new Error("File is required");
      }

      if (typeof receiptType !== "string" || !receiptType) {
        throw new Error("Receipt type is required");
      }

      // Upload file (local or Vercel Blob depending on env)
      uploadedReceiptFile = await uploadReceiptFileFromClient(file);

      setUploadedFile(uploadedReceiptFile);

      // Extract receipt using uploaded file URL
      const extractResponse = await fetch(
        "/api/receipts/extract",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiptType,
            filePath: uploadedReceiptFile.filePath,
            originalName: file.name,
            generatedFileName: uploadedReceiptFile.generatedFileName,
            publicFileUrl: uploadedReceiptFile.publicFileUrl,
          }),
        }
      );

      if (!extractResponse.ok) {
        throw new Error("Failed to extract receipt");
      }

      const data: ExtractReceiptResponse = await extractResponse.json();

      setPreview(data);

      // Si después necesitas guardar el uploadedFile
      // para el Save Receipt:
      //
      // setUploadedFile(uploadedFile);

    } catch (error) {
      console.error(error);

      // Cleanup orphan file
      if (uploadedReceiptFile?.filePath) {
        try {
          await deleteReceiptFileFromClient(
            uploadedReceiptFile.filePath
          );
        } catch (deleteError) {
          console.error(
            "Failed to cleanup uploaded file",
            deleteError
          );
        }
      }

      setError(
        error instanceof Error
          ? error.message
          : "Unknown error"
      );

      toast.error("Failed to extract receipt");
    } finally {
      setLoading(false);
    }
  }

  function resetPreviewState() {
    setPreview(null);
    setUploadedFile(null);
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
      resetPreviewState();
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
      quantity && unitPrice ? Math.round(quantity * unitPrice) : null;
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

  async function handleCancelPreview() {
  try {
    if (uploadedFile?.filePath) {
      await deleteReceiptFileFromClient(
        uploadedFile.filePath
      );
    }
  } catch (error) {
    console.error(
      "Failed to delete uploaded file",
      error
    );
  }

  resetPreviewState();
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
              >
                Upload another receipt
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Discard receipt preview?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the uploaded file and discard all extracted data.
                  This action cannot be undone.
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

        <section className="grid gap-6 lg:grid-cols-[25%_75%]">
          <ReceiptFilePreview fileUrl={preview.file.publicFileUrl} />

          <div>
            <ReceiptItemsSummary
              store={preview.receipt.store}
              total={preview.receipt.total}
              purchaseDate={preview.receipt.purchaseDate}
              editable
              updateReceiptField={updateReceiptField}
              settings={settings}
            />

            <div className="mt-6 overflow-x-auto">
              <ReceiptItemsTable
                items={preview.receipt.items}
                updateItemField={updateItemField}
                removeItem={removeItem}
                readonly={false}
                categories={categories}
                settings={settings}
              />
            </div>

            <ReceiptActions
              addItem={addItem}
              handleSave={handleSave}
              saving={saving}
              handleCancelPreview={handleCancelPreview}
            />
          </div>
        </section>
      </>
    )}
  </main>
);
}
