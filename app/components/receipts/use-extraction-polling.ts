"use client";

import { useEffect, useState } from "react";

import { RECEIPT_STATUS } from "@/app/lib/receipts/receipt-lifecycle";
import type { ExtractionView } from "@/app/types/extraction";

export function useExtractionPolling(receiptId: string | null, active: boolean) {
  const [view, setView] = useState<ExtractionView | null>(null);
  const [pollError, setPollError] = useState(false);

  useEffect(() => {
    if (!receiptId || !active) {
      return;
    }

    let stopped = false;
    const timer = setInterval(() => {
      void load();
    }, 3000);

    async function load() {
      try {
        const response = await fetch(`/api/receipts/${receiptId}/extraction`);
        if (!response.ok) {
          if (!stopped) {
            setPollError(true);
          }
          return;
        }

        const data = (await response.json()) as ExtractionView;
        if (!stopped) {
          setView(data);
          setPollError(false);
        }
        if (data.status !== RECEIPT_STATUS.EXTRACTING) {
          clearInterval(timer);
        }
      } catch {
        if (!stopped) {
          setPollError(true);
        }
      }
    }

    void load();

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [receiptId, active]);

  return { view, pollError };
}
