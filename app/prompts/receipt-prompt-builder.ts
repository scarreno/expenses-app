import { buildBasePrompt } from "./base-prompt";
import { supermarketRules } from "./supermarket-rules";

export function buildReceiptPrompt(receiptType: string) {
  const rulesByType: Record<string, string> = {
    SUPERMARKET: supermarketRules,
  };

  return `
    ${buildBasePrompt(receiptType)}

    ${rulesByType[receiptType] ?? ""}
    `;
}
