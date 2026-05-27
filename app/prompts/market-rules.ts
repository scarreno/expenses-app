export const marketRules = `
Small market receipt interpretation rules:

Small markets usually sell mixed products such as snacks, beverages, bread, groceries, cleaning products and personal care items.

1. Standard item:
If no explicit quantity is shown, assume quantity = 1, unit = "UNIT".
The shown amount is the totalPrice and also the unitPrice.

2. Quantity patterns:
If the receipt shows patterns like "2 X 1.200", "2X1200", or "3 x 990":
- quantity = number before X
- unitPrice = amount after X
- totalPrice = quantity * unitPrice

3. Loose or informal descriptions:
Small market receipts may contain short or abbreviated item names.
Infer the most likely category from the description, but do not invent product details.

4. Ignore non-product lines as items:
Do not create items for lines such as:
- TOTAL
- SUBTOTAL
- IVA
- VUELTO
- EFECTIVO
- TARJETA
- DEBITO
- CREDITO
- BOLETA
- RUT
- CAJERO

5. Category:
For each item, assign a category using ONLY one of these exact values:

GROCERIES
MEAT
VEGETABLES
FRUITS
DAIRY
CLEANING
PERSONAL_CARE
FUEL
RESTAURANT
SNACKS
BEVERAGES
BAKERY
FROZEN
OTHER

Examples:
"COCA COLA" -> BEVERAGES
"BEBIDA" -> BEVERAGES
"PAN" -> BAKERY
"LECHE" -> DAIRY
"DETERGENTE" -> CLEANING
"SHAMPOO" -> PERSONAL_CARE
"PAPAS FRITAS" -> SNACKS
"GALLETA" -> SNACKS
"ARROZ" -> GROCERIES
"AZUCAR" -> GROCERIES

If category cannot be inferred safely, use OTHER.
`;
