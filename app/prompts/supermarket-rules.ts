export const supermarketRules = `
Supermarket receipt interpretation rules:

1. Standard item:
If no explicit quantity is shown, assume quantity = 1, unit = "UNIT".
The shown amount is the totalPrice and also the unitPrice.

2. Repeated units:
Patterns like "4X4.790", "3X1.250" or "2X990" mean:
quantity = number before X
unitPrice = amount after X, interpreted as CLP integer
totalPrice = quantity * unitPrice

Example:
4X4.790 -> quantity = 4, unitPrice = 4790

3. Weighted products:
Some supermarket products are sold by weight and may appear in two lines.

Example pattern:
PRODUCT DESCRIPTION        $ 18.683
X 1,700 KG

The line with "X ... KG" is NOT a separate item.
It is weight information for the product immediately above it.

Never create an item from a weight-only line.
Never return an item with description = null.
Never return an item where the only information is "X ... KG".

For weighted products:
- Use the description from the product line immediately above the weight line.
- quantity must represent the weight in KG.
- quantity can be decimal.
- Chilean comma decimals must be converted to dot decimals.
- unit must be "KG".
- totalPrice must be the final paid amount from the product line.
- unitPrice must be calculated as totalPrice / quantity and rounded to the nearest integer.

Examples:
"X 1,514 KG" -> quantity = 1.514
"X 0,532 KG" -> quantity = 0.532
"X 1,700 KG" -> quantity = 1.7

Example input:
V POST NEGRA        $ 18.683
X 1,700 KG

Correct output:
{
  "description": "V POST NEGRA",
  "quantity": 1.7,
  "unit": "KG",
  "unitPrice": 10990,
  "totalPrice": 18683
}

Incorrect output:
{
  "description": null,
  "quantity": 1.7,
  "unit": "KG"
}

IMPORTANT:
Perform the unitPrice calculation yourself.
Do not return formulas or expressions.

4. Money format:
All money values must be returned as integer CLP values without dots, commas or currency symbols.

Examples:
$22.655 -> 22655
1.445 -> 1445
127.476 -> 127476

5. Ignore non-product lines as items:
Do not create items for lines such as:
- AHORRO
- CODIGO
- SUBTOTAL
- TOTAL
- TOTAL AFECTO
- TOTAL EXENTO
- IVA
- MEDIO DE PAGO
- PRECIO BAJOS
- MI CLUB
- RF PRECIO ANTES AHORRO
- RIF LEVE N
- DESCUENTO

Discount lines are not products.

Examples:
- RIF LEVE N
- DESCUENTO
- AHORRO
- PROMOCION
- PROMOCIÓN

Do not return them as items.

However, totals, taxes and payment information should still be extracted into the main receipt fields.
`;
