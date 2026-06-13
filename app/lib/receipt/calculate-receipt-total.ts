import { ReceiptItem }
from "@/app/types/receipt";

export function calculateReceiptTotal(
  items: ReceiptItem[]
) {

  return items.reduce(
    (sum, item) =>
      sum + (item.totalPrice ?? 0),
    0
  );
}