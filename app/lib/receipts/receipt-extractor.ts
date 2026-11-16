import { openai } from "@/lib/utils/openai";
import { buildReceiptPrompt } from "@/app/prompts/receipt-prompt-builder";
import { CategoryForPrompt } from "@/app/types/category-for-prompt";

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
  fileName: string,
  receiptType: string,
  categories: CategoryForPrompt[]
) {
  try {
    const prompt = buildReceiptPrompt(receiptType, categories);
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
            isPdf
              ? {
                  type: "input_file",
                  filename: fileName,
                  file_data: `data:${mimeType};base64,${fileBase64}`,
                }
              : {
                  type: "input_image",
                  image_url: `data:${mimeType};base64,${fileBase64}`,
                  detail: "high",
                },
          ],
        },
      ],
    });

    return response.output_text;
  } catch (error) {
    throw error;
  }
}
