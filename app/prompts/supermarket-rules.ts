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
If a product has a nearby line like "X 1,514 KG", that line is NOT a separate item.
It means the product was sold by weight.

For weighted products:
- quantity must represent the weight in KG
- quantity can be decimal
- Chilean comma decimals must be converted to dot decimals
- unit = "KG"
- totalPrice must represent the final paid amount in CLP integer
- unitPrice must represent the calculated CLP price per KG as integer

Examples:
X 1,514 KG -> quantity = 1.514
X 0,532 KG -> quantity = 0.532

IMPORTANT:
Perform the unitPrice calculation yourself.
Do not return formulas or expressions.

Example:
totalPrice = 22655
quantity = 1.744

unitPrice must be:
12990

NOT:
22655 / 1.744

4. Money format:
All money values must be returned as integer CLP values without dots, commas or currency symbols.

Examples:
$22.655 -> 22655
1.445 -> 1445
127.476 -> 127476

5. Ignore non-product lines as items:
Do not create items for lines such as:
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

However, totals, taxes and payment information should still be extracted into the main receipt fields.

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

"V LOMO LISO" -> MEAT
"LECHUGA COST" -> VEGETABLES
"COCA COLA" -> BEVERAGES
"PAN MOLDE" -> BAKERY
"RAMITAS" -> SNACKS
"GALLETA" -> SNACKS
"PAPA LISA" -> SNACKS
"PAPA" -> VEGETABLES
`;
