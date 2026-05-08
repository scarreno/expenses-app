import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { extractReceiptData, cleanJsonResponse } from "@/app/lib/receipt-extractor";

export async function POST(request: NextRequest){
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

    const extracted = await extractReceiptData(base64, 
                                            file.type,
                                            file.name);

    const cleanJson = cleanJsonResponse(extracted);
    const parsed = JSON.parse(cleanJson);



    const receipt = await prisma.receipt.create({
        data: {
            fileName: file.name,
            store: parsed.store,
            total: parsed.total,
            rawJson: parsed,
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

}