
export function buildBasePrompt(
  receiptType: string
) {
  return `
    You are extracting data from a receipt.

    Receipt type selected by user: ${receiptType}
    Use this type as context to interpret the receipt correctly.

    All money values are Chilean pesos (CLP).

    In Chile, dots are thousand separators, NOT decimal separators.

    Example:
    22.655 CLP = 22655

    Return all money amounts as integer numbers without dots, commas or currency symbols.

    Examples:
    $22.655 -> 22655
    1.445 -> 1445
    127.476 -> 127476

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
}