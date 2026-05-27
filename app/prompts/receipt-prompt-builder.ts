import { buildBasePrompt } from "./base-prompt";
import { supermarketRules } from "./supermarket-rules";
import { marketRules } from "./market-rules";
import { gasRules } from "./gas-rules";

export function buildReceiptPrompt(receiptType: string) {
  const rulesByType: Record<string, string> = {
    SUPERMARKET: supermarketRules,
    MARKET: marketRules,
    GAS: gasRules,
  };

  return `
    ${buildBasePrompt(receiptType)}

    ${rulesByType[receiptType] ?? ""}
  `;
}