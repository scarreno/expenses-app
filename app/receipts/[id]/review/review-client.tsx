"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageContainer } from "@/app/components/layout/page-container";
import { ReceiptExtractionReview } from "@/app/components/receipts/receipt-extraction-review";
import {
  ExtractionFailure,
  ExtractionProgress,
} from "@/app/components/receipts/extraction-status-panel";
import { useExtractionPolling } from "@/app/components/receipts/use-extraction-polling";
import { RECEIPT_STATUS } from "@/app/lib/receipts/receipt-lifecycle";
import { CategoryOption } from "@/app/types/category-option";
import { Dictionary } from "@/app/types/dictionary";
import type { ExtractionView } from "@/app/types/extraction";
import { ExtractReceiptResponse } from "@/app/types/receipt";
import { UserSettings } from "@/app/types/user-settings-types";

type Props = {
  initial: ExtractionView;
  categories: CategoryOption[];
  settings: UserSettings;
  dictionary: Dictionary;
};

export function ReceiptReviewClient({
  initial,
  categories,
  settings,
  dictionary,
}: Props) {
  const router = useRouter();
  const [discarding, setDiscarding] = useState(false);
  const polled = useExtractionPolling(
    initial.receiptId,
    initial.status === RECEIPT_STATUS.EXTRACTING,
  );
  const view = polled.view?.receiptId === initial.receiptId ? polled.view : initial;

  async function discardAndReturn() {
    setDiscarding(true);
    try {
      const response = await fetch(`/api/receipts/${view.receiptId}/discard`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(dictionary.receipt.notifications.deleteFailed);
      }
      router.push("/receipts");
    } catch (error) {
      console.error(error instanceof Error ? error.message : "discard failed");
      toast.error(dictionary.receipt.notifications.deleteFailed);
      setDiscarding(false);
    }
  }

  if (view.status === RECEIPT_STATUS.EXTRACTING) {
    return (
      <PageContainer className="max-w-[1600px]">
        <ExtractionProgress
          fileName={view.file.originalName}
          dictionary={dictionary}
        />
      </PageContainer>
    );
  }

  if (view.status === RECEIPT_STATUS.READY_FOR_REVIEW && view.receipt) {
    return (
      <PageContainer className="max-w-[1600px]">
        <ReceiptExtractionReview
          receiptId={view.receiptId}
          initialPreview={toPreview(view)}
          categories={categories}
          settings={settings}
          dictionary={dictionary}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1600px]">
      <ExtractionFailure
        dictionary={dictionary}
        errorCode={view.errorMessage}
        discarding={discarding}
        onDiscard={discardAndReturn}
      />
    </PageContainer>
  );
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
