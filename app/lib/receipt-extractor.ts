import { openai } from "@/app/lib/openai";

export function cleanJsonResponse(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function extractReceiptData(
  fileBase64: string,
  mimeType: string,
  fileName: string
) {

    try {
        const prompt = `
    Extract the receipt information.
    Return raw JSON only.
    Do not wrap the response in markdown.
    Do not use \`\`\`json.
    Do not include explanations.

    Return ONLY valid JSON.

    Expected structure:
    {
    "store": string | null,
    "branch": string | null,
    "purchaseDate": string | null,
    "purchaseTime": string | null,
    "paymentMethod": string | null,
    "subtotal": number | null,
    "tax": number | null,
    "total": number | null,
    "items": [
        {
        "sku": string | null,
        "description": string,
        "quantity": number | null,
        "unit": string | null,
        "unitPrice": number | null,
        "totalPrice": number | null
        }
    ]
    }
    `;

    const isPdf = mimeType === "application/pdf";

    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
        {
            role: "user",
            content: [
            {
                type: "input_text",
                text: prompt,
            },
            isPdf ? {
                    type: "input_file",
                    filename: fileName,
                    file_data: `data:${mimeType};base64,${fileBase64}`,
                }:
            {
                type: "input_image",
                image_url: `data:${mimeType};base64,${fileBase64}`,
                detail: "high",
            },
            ],
        },
        ],
    });

    console.log('Open AI request executed OK!');
    console.log(response.output_text);
    return response.output_text;
  } catch (error) {
        throw error;
    }
}