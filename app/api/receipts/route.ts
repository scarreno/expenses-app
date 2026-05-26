import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { saveReceiptSchema } from "@/app/schemas/receipt-schema";
import { parseReceiptDate } from "@/app/lib/parse-string-date";

export async function GET() {
  const receipts = await prisma.receipt.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(receipts);
}

export async function POST(request: NextRequest) {
  try {
    const body = saveReceiptSchema.parse(
      await request.json()
    );
    const receipt = await prisma.receipt.create({
      data: {
        receiptType: body.receiptType,
        store: body.receipt.store,
        branch: body.receipt.branch,
        purchaseDate: parseReceiptDate(body.receipt.purchaseDate),
        purchaseTime: body.receipt.purchaseTime,
        paymentMethod: body.receipt.paymentMethod,
        subtotal: body.receipt.subtotal,
        tax: body.receipt.tax,
        total: body.receipt.total,
        fileName: body.file.originalName,
        filePath: body.file.filePath,
        status: "PROCESSED",
        rawJson: body.receipt,
        publicFileUrl: body.file.publicFileUrl,
        items: {
          create: body.receipt.items.map((item: any) => ({
            sku: item.sku,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            category: item.category
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(receipt);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to save receipt",
      },
      {
        status: 500,
      }
    );
  }
}
