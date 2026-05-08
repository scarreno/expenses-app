import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { extractReceiptData, cleanJsonResponse } from "@/app/lib/receipt-extractor";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest){
    let receiptId: string | null = null;

    try {
        
    

    const formData = await request.formData();
    const file = formData.get("file");

    if(!(file instanceof File)){
        return NextResponse.json(
            { error: "File is required"},
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");


    const extension = file.name.split(".").pop();
    const fileName = `${uuid()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, fileName);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const extracted = await extractReceiptData(base64, 
                                            file.type,
                                            file.name);

    const cleanJson = cleanJsonResponse(extracted);
    const parsed = JSON.parse(cleanJson);


    const pendingReceipt = await prisma.receipt.create({
        data: {
            fileName: file.name,
            status: "PENDING"
        }
    });

    receiptId = pendingReceipt.id;

    const receipt = await prisma.receipt.update({
        where: {
            id: receiptId
        },
        data: {
            status: "PROCESSED",
            fileName: file.name,
            store: parsed.store,
            total: parsed.total,
            rawJson: parsed,
            filePath,
            items: {
                    create: parsed.items?.map((item: any) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice                        
                    })
                ) ?? []
            }
        },
        include: {
            items: true
        }
    });

    return NextResponse.json({
        message: "Receipt uploaded succesfully!",
        receipt
    });
    } catch (error) {
        console.error(error);

        if(receiptId){
            await prisma.receipt.update({
                where: {
                    id: receiptId
                },
                data: {
                    status: "ERROR",
                    errorMessage: 
                        error instanceof Error 
                        ? error.message 
                        : "Unknown error" 
                }
            });
        }
        return NextResponse.json(
            {
                error: "Failed to process receipt"
            },
            { status: 500 }
        );
    }
}