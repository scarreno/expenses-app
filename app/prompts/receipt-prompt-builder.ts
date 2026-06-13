import { buildBasePrompt } from "./base-prompt";
import { supermarketRules } from "./supermarket-rules";
import { marketRules } from "./market-rules";
import { gasRules } from "./gas-rules";
import { buildCategoryPromptSection } from "@/app/lib/receipt/receipt-categories";
import { CategoryForPrompt } from "@/app/types/category-for-prompt";

export function buildReceiptPrompt(receiptType: string,
    categories: CategoryForPrompt[]
) {
  const rulesByType: Record<string, string> = {
    SUPERMARKET: supermarketRules,
    MARKET: marketRules,
    GAS: gasRules,
  };

  return `
    ${buildBasePrompt(receiptType)}
    ${rulesByType[receiptType] ?? ""}
    ${buildCategoryPromptSection(categories)}
  `;
}