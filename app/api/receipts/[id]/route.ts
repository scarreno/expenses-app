// app/api/receipts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

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

    if (!receiptId) {
      throw Error("Receipt id is required");
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
        },
      }),
    ])

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