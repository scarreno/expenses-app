"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PageContainer } from "@/app/components/layout/page-container";
import { ErrorMessage } from "@/app/components/error-message";
import { ReceiptFormUpload } from "@/app/components/receipt-form-upload";
import { ReceiptExtractionReview } from "@/app/components/receipts/receipt-extraction-review";
import {
  ExtractionFailure,
  ExtractionProgress,
} from "@/app/components/receipts/extraction-status-panel";
import { useExtractionPolling } from "@/app/components/receipts/use-extraction-polling";
import {
  deleteReceiptFileFromClient,
  uploadReceiptFileFromClient,
} from "@/app/lib/storage/client-storage";
import { RECEIPT_STATUS } from "@/app/lib/receipts/receipt-lifecycle";
import { CategoryOption } from "@/app/types/category-option";
import { Dictionary } from "@/app/types/dictionary";
import type { ExtractionView } from "@/app/types/extraction";
import { ExtractReceiptResponse } from "@/app/types/receipt";
import { UserSettings } from "@/app/types/user-settings-types";

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

type UploadPhase = "form" | "waiting";

export function UploadPageClient({ categories, settings, dictionary }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("form");
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedReceiptFile | null>(null);
  const [discarding, setDiscarding] = useState(false);

  const { view } = useExtractionPolling(receiptId, phase === "waiting");
  const currentView = view?.receiptId === receiptId ? view : null;
  const display = resolveUploadDisplay(phase, currentView);
  const preview =
    display === "review" && currentView?.receipt ? toPreview(currentView) : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    let uploadedReceiptFile: UploadedReceiptFile | null = null;
    let serverRejected = false;

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

      uploadedReceiptFile = await uploadReceiptFileFromClient(file);
      setUploadedFile(uploadedReceiptFile);

      const response = await fetch("/api/receipts/extractions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          receiptType,
          filePath: uploadedReceiptFile.filePath,
          originalName: file.name,
          generatedFileName: uploadedReceiptFile.generatedFileName,
          publicFileUrl: uploadedReceiptFile.publicFileUrl,
        }),
      });

      if (!response.ok) {
        serverRejected = true;
        throw new Error(dictionary.receipt.errors.enqueueReceipt);
      }

      const data = (await response.json()) as { receiptId: string };
      setReceiptId(data.receiptId);
      setPhase("waiting");
    } catch (submitError) {
      console.error(submitError instanceof Error ? submitError.message : "enqueue failed");

      if (serverRejected && uploadedReceiptFile?.filePath) {
        try {
          await deleteReceiptFileFromClient(uploadedReceiptFile.filePath);
        } catch (deleteError) {
          console.error(
            deleteError instanceof Error ? deleteError.message : "cleanup failed",
          );
        }
        setUploadedFile(null);
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : dictionary.receipt.errors.unknown,
      );
      toast.error(dictionary.receipt.errors.enqueueReceipt);
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscardFailure() {
    if (!receiptId) {
      return;
    }

    setDiscarding(true);
    try {
      const response = await fetch(`/api/receipts/${receiptId}/discard`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(dictionary.receipt.notifications.deleteFailed);
      }
      resetToForm();
    } catch (discardError) {
      console.error(discardError instanceof Error ? discardError.message : "discard failed");
      toast.error(dictionary.receipt.notifications.deleteFailed);
    } finally {
      setDiscarding(false);
    }
  }

  function resetToForm() {
    setPhase("form");
    setReceiptId(null);
    setUploadedFile(null);
    setError(null);
  }

  return (
    <PageContainer className="max-w-[1600px]">
      {display === "form" && (
        <ReceiptFormUpload
          handleSubmit={handleSubmit}
          loading={loading}
          dictionary={dictionary}
        />
      )}

      {error && <ErrorMessage message={error} />}

      {display === "processing" && (
        <ExtractionProgress
          fileName={uploadedFile?.generatedFileName}
          dictionary={dictionary}
        />
      )}

      {display === "failed" && (
        <ExtractionFailure
          dictionary={dictionary}
          errorCode={currentView?.errorMessage}
          discarding={discarding}
          onDiscard={handleDiscardFailure}
        />
      )}

      {display === "review" && preview && receiptId && (
        <ReceiptExtractionReview
          key={receiptId}
          receiptId={receiptId}
          initialPreview={preview}
          categories={categories}
          settings={settings}
          dictionary={dictionary}
          onDiscarded={resetToForm}
        />
      )}
    </PageContainer>
  );
}

function resolveUploadDisplay(
  phase: UploadPhase,
  view: ExtractionView | null,
): "form" | "processing" | "review" | "failed" {
  if (phase === "form") {
    return "form";
  }
  if (view?.status === RECEIPT_STATUS.READY_FOR_REVIEW && view.receipt) {
    return "review";
  }
  if (
    view?.status === RECEIPT_STATUS.EXTRACTION_FAILED ||
    (view?.status === RECEIPT_STATUS.READY_FOR_REVIEW && !view.receipt)
  ) {
    return "failed";
  }
  return "processing";
}

function toPreview(view: ExtractionView): ExtractReceiptResponse {
  return {
    message: "",
    receiptType: view.receiptType ?? "",
    file: {
      originalName: view.file.originalName ?? "",
      filePath: view.file.filePath ?? "",
      generatedFileName: view.file.generatedFileName ?? "",
      publicFileUrl: view.file.publicFileUrl ?? "",
    },
    receipt: view.receipt!,
  };
}
