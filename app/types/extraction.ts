import type { ExtractedReceipt } from "@/app/types/receipt";

export type ExtractionView = {
  receiptId: string;
  jobId: string;
  status: string;
  jobStatus: string;
  attempts: number;
  errorMessage: string | null;
  receiptType: string | null;
  file: {
    originalName: string | null;
    filePath: string | null;
    generatedFileName: string | null;
    publicFileUrl: string | null;
  };
  receipt: ExtractedReceipt | null;
};

export type EnqueueExtractionResult = {
  receiptId: string;
  jobId: string;
  status: string;
  replayed: boolean;
};
