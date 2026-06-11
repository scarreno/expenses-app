// app/api/receipts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from "@/app/lib/auth-user";
import { deleteReceiptFile } from "@/app/lib/storage";

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: receiptId } = await params

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
    if (!receiptId) {
      throw Error("Receipt id is required");
    }

    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        userId: currentUser.id,
      },
    });

    if (!receipt) {
      return Response.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.receiptItem.deleteMany({
        where: {
          receiptId: receiptId,
        },
      }),

      prisma.receipt.delete({
        where: {
          id: receiptId,
          userId: currentUser.id
        },
      }),
    ])


    if (receipt.filePath) {
      try {
        await deleteReceiptFile(receipt.filePath);
      } catch (error) {
        console.error("Failed to delete receipt file:", error);
      }
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: 'Failed to delete receipt',
      },
      {
        status: 500,
      }
    )
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();

    const existingReceipt =
      await prisma.receipt.findFirst({
        where: {
          id,
          userId: currentUser.id,
        },
      });

    if (!existingReceipt) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.receipt.update({
        where: {
          id,
        },
        data: {
          store: body.receipt.store,
          branch: body.receipt.branch,
          purchaseDate: body.receipt.purchaseDate,
          purchaseTime: body.receipt.purchaseTime,
          paymentMethod: body.receipt.paymentMethod,
          subtotal: body.receipt.subtotal,
          tax: body.receipt.tax,
          total: body.receipt.total,
          receiptType: body.receiptType,
        },
      });

      await tx.receiptItem.deleteMany({
        where: {
          receiptId: id,
        },
      });

      await tx.receiptItem.createMany({
        data: body.receipt.items.map(
          (item: {
            sku?: string | null;
            description: string;
            quantity?: number | null;
            unit?: string | null;
            unitPrice?: number | null;
            totalPrice?: number | null;
            category?: string | null;
          }) => ({
            receiptId: id,
            sku: item.sku,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            category: item.category,
          })
        ),
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update receipt",
      },
      {
        status: 500,
      }
    );
  }
}