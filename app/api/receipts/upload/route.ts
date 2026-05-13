import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { extractReceiptData, cleanJsonResponse } from "@/app/lib/receipt-extractor";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { normalizeMoney } from "@/app/lib/money";

export async function POST(request: NextRequest){
    let receiptId: string | null = null;

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const receiptType = formData.get("receiptType");

        if(typeof receiptType != "string" || !receiptType){
            return NextResponse.json(
                { error: "Receipt type is required"},
                { status: 400 }
            );
        }
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
                                                file.name,
                                                receiptType);

        const cleanJson = cleanJsonResponse(extracted);
        const parsed = JSON.parse(cleanJson);


        const pendingReceipt = await prisma.receipt.create({
            data: {
                fileName: file.name,
                status: "PENDING",
                filePath,
                receiptType
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
                subtotal: normalizeMoney(parsed.subtotal),
                total: normalizeMoney(parsed.total),
                tax: normalizeMoney(parsed.tax),
                rawJson: parsed,
                filePath,
                items: {
                        create: parsed.items?.map((item: any) => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: normalizeMoney(item.unitPrice),
                            totalPrice: normalizeMoney(item.totalPrice)
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