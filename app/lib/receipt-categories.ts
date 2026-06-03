export const RECEIPT_CATEGORIES = [
  "MEAT",
  "FRUITS_AND_VEGETABLES",
  "GROCERIES",
  "BAKERY",
  "DAIRY",
  "BEVERAGES",
  "SNACKS",
  "CLEANING",
  "PERSONAL_CARE",
  "PETS",
  "HEALTH",
  "HOME",
  "RESTAURANTS",
  "TRANSPORT",
  "OTHER",
  "UNCATEGORIZED",
] as const;

export type ReceiptCategory = (typeof RECEIPT_CATEGORIES)[number];

export function buildCategoryPromptSection(
  categories: string[]
) {
  return `
Use only one of the following categories for each receipt item:

${categories.map((category) => `- ${category}`).join("\n")}

Return the category value exactly as written.
Do not translate category values.
Do not invent new categories.

Receipt items may be written in Spanish, English, or abbreviated supermarket text commonly found in Chilean receipts.

Classification rules:

- MEAT: beef, chicken, pork, fish, seafood, sausages, ham.
  Spanish examples: carne, vacuno, pollo, pechuga, pavo, cerdo, lomo, posta negra, posta rosada, punta ganso, ganso, posta paleta, asiento, molida, pescado, salmón, vienesa, longaniza, jamón, choclillo.

- GROCERIES: rice, pasta, noodles, flour, sugar, salt, oil, sauces, cereals, oats, legumes and pantry products.
  Spanish examples:
  arroz,
  fideos,
  tallarines,
  spaghetti,
  espagueti,
  espaguetis,
  espirales,
  corbatas,
  corbatitas,
  coditos,
  mostacholes,
  rigatoni,
  penne,
  fusilli,
  canutos,
  caracoles,
  cabello de ángel,
  cabello angel,
  lasaña,
  lasagna,
  gnocchi,
  ñoquis,
  ravioles,
  tortellini,
  harina,
  azúcar,
  azucar,
  sal,
  aceite,
  avena,
  cereal,
  lentejas,
  porotos,
  garbanzos,
  arroz grano largo,
  arroz integral,
  quinoa,
  ketchup,
  kétchup,
  mayonesa,
  mostaza,
  salsa de tomate,
  salsa boloñesa,
  salsa bolognesa,
  puré,
  pure,
  puré instantáneo,
  pure instantaneo.

- FRUITS_AND_VEGETABLES: fruits, vegetables, salads, herbs.
  Spanish examples: fruta, verdura, papa, zanahoria, limón, limones, lechuga, tomate, palta, cebolla, ajo, manzana, plátano, naranja, zapallo, cilantro, perejil.

- BAKERY: bread, pastries, cakes, tortillas.
  Spanish examples: pan, marraqueta, hallulla, molde, baguette, tortilla, queque, kuchen, pastel.

- DAIRY: milk, cheese, yogurt, butter, cream.
  Spanish examples: leche, queso, yogurt, yogur, mantequilla, crema, manjar.

- BEVERAGES: water, soda, juice, coffee, tea, beer, wine, energy drinks and sports drinks.
  Spanish examples: agua, bebida, gaseosa, jugo, néctar, cafe, café, te, té, cerveza, vino, cola, energética, energetica, energy drink, bebida energética, bebida energetica, red bull, monster, score, gatorade, powerade, isotónica, isotonica.

- SNACKS: chips, cookies, crackers, candy, chocolate, salty snacks and confectionery.
  Spanish examples: ramitas, galleta, galletas, papas fritas, snacks, chocolate, chocolates, caramelo, caramelos, dulce, dulces, gomitas, maní, mani, papas, triton, tritón, kuky, frac, oblea.

- CLEANING: detergent, dish soap, bleach, paper towels, toilet paper, cleaning supplies.
  Spanish examples: detergente, lavaloza, cloro, limpia piso, limpiador, desinfectante, antigrasa, papel higienico, papel higiénico, nova, servilleta.

- PERSONAL_CARE: shampoo, soap, deodorant, toothpaste, cosmetics.
  Spanish examples: shampoo, champú, jabón, desodorante, pasta dental, cepillo, crema corporal, colonia.

- PETS: pet food and pet supplies.
  Spanish examples: perro, gato, mascota, alimento perro, alimento gato, pellet.

- HEALTH: medicine, vitamins and pharmacy products.
  Spanish examples: remedio, medicamento, paracetamol, ibuprofeno, vitaminas, farmacia.

- HOME: household items, kitchen supplies and home products.
  Spanish examples: bolsa, bolsas, film plastico, film plástico, aluminio, pila, pilas, vela, velas, fósforos, fosforos, utensilio.

- RESTAURANTS: prepared meals, fast food and delivery food.
  Spanish examples: comida preparada, colacion, colación, sandwich, sushi, pizza, completo, empanada.

- TRANSPORT: fuel, parking and tolls.
  Spanish examples: bencina, gasolina, diesel, petróleo, estacionamiento, peaje.

- OTHER: readable items that do not fit any category.

- UNCATEGORIZED: unreadable, missing, abbreviated beyond recognition, or impossible-to-classify items only.

Examples:

"SPAGHETTI N5" -> GROCERIES
"ESPIRALES" -> GROCERIES
"RIGATONI" -> GROCERIES
"TALLARIN" -> GROCERIES
"TALLARINES" -> GROCERIES
"CORBATITAS" -> GROCERIES
"CODITOS" -> GROCERIES
"PENNE" -> GROCERIES
"FUSILLI" -> GROCERIES
"CANUTOS" -> GROCERIES
"CARACOLES" -> GROCERIES
"LUCCHETTI ESPIRAL" -> GROCERIES
"CAROZZI SPAGH" -> GROCERIES
"TUCAPEL GR LGO" -> GROCERIES
"ARROZ TUCAPEL" -> GROCERIES
"LENTEJAS" -> GROCERIES
"POROTOS" -> GROCERIES
"GARBANZOS" -> GROCERIES
"AVENA" -> GROCERIES
"ACEITE VEGETAL" -> GROCERIES
"AZUCAR IANSA" -> GROCERIES
"KETCHUP" -> GROCERIES
"MAYONESA" -> GROCERIES
"SALSA TOMATE" -> GROCERIES

"PAPA LISA" -> FRUITS_AND_VEGETABLES
"RAMITAS SAL" -> SNACKS
"GALLETA" -> SNACKS
"SEMICARAMELO" -> SNACKS
"MINI TRITON VAINIL" -> SNACKS
"RED BULL" -> BEVERAGES
"MONSTER" -> BEVERAGES
"SCORE" -> BEVERAGES
"GATORADE" -> BEVERAGES
"POWERADE" -> BEVERAGES
"ZANAHORIAS" -> FRUITS_AND_VEGETABLES
"LIMONES" -> FRUITS_AND_VEGETABLES
"PECH POLLO" -> MEAT
"POST NEGRA" -> MEAT
"LOMO" -> MEAT
"POSTA" -> MEAT
"CHOCLILLO" -> MEAT
"TE CHA" -> BEVERAGES
"LIMPIA PISO" -> CLEANING
"ANTIGRASA" -> CLEANING
"FILM PLASTIC" -> HOME

Prefer OTHER over UNCATEGORIZED when the item is readable but does not clearly match a category.
`;
}