export const gasRules = `
Gas station receipt interpretation rules:

This receipt type is for fuel stations. It may include fuel purchases and convenience store products.

General output rules:
- Always return all properties defined in the JSON schema.
- If a value is missing, unreadable, or cannot be safely inferred, return null.
- Do not omit properties.
- purchaseDate must always be returned as yyyy-MM-dd.
- Amounts must be returned as integers without thousand separators.
- Decimal quantities may use dot notation, for example 12.438.

Fuel item rules:
Fuel may appear as:
- Gasolina 93
- Gasolina 95
- Gasolina 97
- Diesel
- Petroleo
- Kerosene
- Bencina

For fuel:
- category = "FUEL"
- unit = "LT"
- quantity = liters sold
- unitPrice = price per liter
- totalPrice = final fuel line amount

Common fuel layouts:

1. Table layout:
Example:
Gasolina 93 12.438 Lt 1608 $20.000

Interpret as:
description = "Gasolina 93"
quantity = 12.438
unit = "LT"
unitPrice = 1608
totalPrice = 20000
category = "FUEL"

2. Quantity x price layout:
Example:
Gasolina 95 octanos RM
45,80 x 1.653
VALOR 75.711

Interpret as:
description = "Gasolina 95 octanos RM"
quantity = 45.80
unit = "LT"
unitPrice = 1653
totalPrice = 75711
category = "FUEL"

Fuel calculations:
- If quantity and unitPrice are available but totalPrice is missing, calculate totalPrice = quantity * unitPrice rounded to nearest integer.
- If quantity and totalPrice are available but unitPrice is missing, calculate unitPrice = totalPrice / quantity rounded to nearest integer.
- Do not return formulas, only final values.

Convenience store products:
If the receipt includes non-fuel products, extract them as separate items.

Examples:
- Cafe -> RESTAURANT
- Sandwich -> RESTAURANT
- Agua mineral -> BEVERAGES
- Bebida -> BEVERAGES
- Papas fritas -> SNACKS
- Chocolate -> SNACKS

Ignore these lines as products:
- SUBTOTAL
- TOTAL
- TOTAL A PAGAR
- MONTO NETO
- MONTO IVA
- IVA
- IMPUESTO COMBUSTIBLE
- MEDIO DE PAGO
- EFECTIVO
- TARJETA
- DEBITO
- CREDITO
- VUELTO
- PROPINA
- AJUSTE
- PATENTE
- KILOMETRAJE
- SURTIDOR
- TERMINAL
- TRANSACCION
- AUTORIZACION
- CAJERO
- ATENDEDOR
- CODIGO ESTACION
- BOLETA ELECTRONICA
- RUT
- GIRO
- DIRECCION
- COMUNA

Allowed categories:
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

If category cannot be inferred safely, use OTHER.
`;