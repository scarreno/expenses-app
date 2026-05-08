import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(){
    const receipts = await prisma.receipt.findMany({
        include: {
            items: true
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return NextResponse.json(receipts);
}
