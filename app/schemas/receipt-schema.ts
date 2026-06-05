import { z } from "zod";

export const receiptItemSchema = z.object({
  sku: z.string().nullable(),
  description: z.string(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  unitPrice: z.number().int().nullable(),
  totalPrice: z.number().int().nullable(),
  category: z.string().nullable().optional()
});


export const extractedReceiptSchema = z.object({
  store: z.string().nullable(),
  branch: z.string().nullable(),
  purchaseDate: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable(),
  purchaseTime: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  subtotal: z.number().int().nullable(),
  tax: z.number().int().nullable(),
  total: z.number().int().nullable(),
  items: z.array(receiptItemSchema).default([]),
});

export const saveReceiptSchema = z.object({
  receiptType: z.string().min(1),

  file: z.object({
    originalName: z.string(),
    filePath: z.string(),
    generatedFileName: z.string(),
    publicFileUrl: z.string(),
  }),

  receipt: extractedReceiptSchema,
});


export type ReceiptItemInput = z.infer<typeof receiptItemSchema>;
export type ExtractedReceiptInput = z.infer<typeof extractedReceiptSchema>;
export type SaveReceiptInput = z.infer<typeof saveReceiptSchema>;