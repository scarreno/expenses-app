"use client";
import { PageContainer } from "@/app/components/layout/page-container";
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
import { PageHeader } from "@/app/components/layout/page-header";
import { PageHeaderActions } from "@/app/components/layout/page-header-actions";
import { Dictionary } from "@/app/types/dictionary";


type Props = {
    categories: CategoryOption[];   
    settings: UserSettings;
    dictionary: Dictionary;
};

type UploadedReceiptFile = {
    filePath: string;
    generatedFileName: string;
    publicFileUrl: string;
};

export  function HomePageClient({ categories, settings, dictionary }: Props) {
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
        throw new Error(dictionary.receipt.validations.fileRequired);
      }

      if (typeof receiptType !== "string" || !receiptType) {
        throw new Error(dictionary.receipt.validations.receiptTypeRequired);
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
        throw new Error(dictionary.receipt.errors.extractReceipt);
      }

      const data: ExtractReceiptResponse = await extractResponse.json();

      setPreview(data);

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
            dictionary.receipt.errors.cleanupUploadedFile,
            deleteError
          );
        }
      }

      setError(
        error instanceof Error
          ? error.message
          : dictionary.receipt.errors.unknown
      );

      toast.error(dictionary.receipt.errors.extractReceipt);
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
        throw new Error(dictionary.receipt.notifications.saveFailed);
      }

      const savedReceipt = await response.json();
      toast.success(dictionary.receipt.notifications.saved);
      resetPreviewState();
      console.log(savedReceipt);
      router.push("/receipts");

    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : dictionary.receipt.errors.unknown);
      toast.error(dictionary.receipt.notifications.saveFailed);
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
      dictionary.receipt.notifications.deleteFailed,
      error
    );
  }

  resetPreviewState();
}

return (
  <PageContainer className="max-w-[1600px]">
    {!preview && (
      <ReceiptFormUpload
        handleSubmit={handleSubmit}
        loading={loading}
        dictionary={dictionary}
      />
    )}

    {error && <ErrorMessage message={error} />}

    {preview && (
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

      <section className="grid min-w-0 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0">
          <ReceiptFilePreview fileUrl={preview.file.publicFileUrl} 
          dictionary={dictionary} />
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
    )}
  </PageContainer>
);
}
