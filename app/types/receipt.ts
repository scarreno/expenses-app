export type ReceiptItem = {
  sku: string | null;
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
};

export type ExtractedReceipt = {
  store: string | null;
  branch: string | null;
  purchaseDate: string | null;
  purchaseTime: string | null;
  paymentMethod: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;

  items: ReceiptItem[];
};

export type ExtractReceiptResponse = {
  message: string;
  receiptType: string;
  file: {
    originalName: string;
    filePath: string;
    generatedFileName: string;
    publicFileUrl: string;
  };

  receipt: ExtractedReceipt;
};
