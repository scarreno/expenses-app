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