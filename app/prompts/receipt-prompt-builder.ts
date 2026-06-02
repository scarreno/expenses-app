import { buildBasePrompt } from "./base-prompt";
import { supermarketRules } from "./supermarket-rules";
import { marketRules } from "./market-rules";
import { gasRules } from "./gas-rules";
import { buildCategoryPromptSection } from "@/app/lib/receipt-categories";

export function buildReceiptPrompt(receiptType: string) {
  const rulesByType: Record<string, string> = {
    SUPERMARKET: supermarketRules,
    MARKET: marketRules,
    GAS: gasRules,
  };

  return `
    ${buildBasePrompt(receiptType)}
    ${rulesByType[receiptType] ?? ""}
    ${buildCategoryPromptSection()}
  `;
}