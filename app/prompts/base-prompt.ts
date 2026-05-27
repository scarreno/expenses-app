export function buildBasePrompt(receiptType: string) {
  return `
You are extracting structured data from a receipt.

Receipt type selected by user: ${receiptType}

Use the selected receipt type as context to interpret products, quantities, units, categories and totals correctly.

General rules:

- All money values are Chilean pesos (CLP).
- In Chile, dots are thousand separators, NOT decimal separators.
- Return all money amounts as integer numbers without dots, commas or currency symbols.

Examples:
- $22.655 -> 22655
- 1.445 -> 1445
- 127.476 -> 127476

Date rules:

- Return purchaseDate using ISO date-only format: yyyy-MM-dd.
- Never return localized formats like dd/MM/yyyy or MM/dd/yyyy.
- Chilean and Latin American receipts use dd/MM/yyyy by default.
- Slash-separated dates must be interpreted as dd/MM/yyyy unless the receipt clearly belongs to a locale using MM/dd/yyyy.

Examples:
- 10/05/2026 -> 2026-05-10
- 07/05/2026 -> 2026-05-07
- May 10, 2026 -> 2026-05-10
- 05/10/2026 in a US receipt -> 2026-05-10

- If the date is ambiguous and the locale cannot be inferred safely, return null.
- purchaseDate should normally not be later than the current date unless the receipt clearly indicates a future transaction.

JSON rules:

- Return raw JSON only.
- Do not wrap the response in markdown.
- Do not use \`\`\`json.
- Do not include explanations.
- Return ONLY valid JSON.

Field rules:

- Always return all properties defined in the expected structure.
- Never omit properties.
- If a value is missing, unreadable, or cannot be safely inferred, return null.
- Do not invent values.

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
      "description": string | null,
      "category": string | null,
      "quantity": number | null,
      "unit": string | null,
      "unitPrice": number | null,
      "totalPrice": number | null
    }
  ]
}
`;
}