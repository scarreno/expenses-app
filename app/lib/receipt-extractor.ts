import { openai } from "@/app/lib/openai";
import { buildReceiptPrompt } from "@/app/prompts/receipt-prompt-builder";

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
  categories: string[]
) {
  try {

    console.log(`Creating prompt para , categorias`,);
    const prompt = buildReceiptPrompt(receiptType, categories);
    console.log("Creating prompt - Ok");
    console.log(`prompt: ${prompt}`);

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

    console.log("Open AI request executed OK!");
    console.log(response.output_text);
    return response.output_text;
  } catch (error) {
    throw error;
  }
}
