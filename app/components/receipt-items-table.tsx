import { ReceiptItem } from "@/app/types/receipt";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/app/lib/format-money";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReceiptCategoryOption = {
  code: string;
  label: string;
};

type Props = {
  items: ReceiptItem[];
  readonly: boolean;
  categories?: ReceiptCategoryOption[];

  updateItemField?: (
    index: number,
    field: keyof ReceiptItem,
    value: string
  ) => void;

  removeItem?: (index: number) => void;
};

export function ReceiptItemsTable({
  items,
  updateItemField,
  removeItem,
  readonly,
  categories = [],
}: Props) {
  return (
    <table className="min-w-[1000px] w-full table-fixed text-sm">
      <thead className="border-b text-left text-muted-foreground">
        <tr>
          <th className="w-[28%] border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            Description
          </th>

          <th className="w-[18%] border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            Category
          </th>

          <th className="w-[10%] border-b px-3 py-2 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
            Quantity
          </th>

          <th className="w-[10%] border-b px-3 py-2 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
            Unit
          </th>

          <th className="w-[16%] border-b px-3 py-2 text-right text-[11px] uppercase tracking-wide text-muted-foreground">
            Unit Price
          </th>

          <th className="w-[12%] border-b px-3 py-2 text-right text-[11px] uppercase tracking-wide text-muted-foreground">
            Total
          </th>

          {!readonly && (
            <th className="w-[12%] border-b px-3 py-2 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => (
          <tr key={index} className="border-b">
            <td className="px-3 py-2">
              {readonly ? (
                <div>{item.description}</div>
              ) : (
                <Input
                  className="h-8 w-full text-sm"
                  value={item.description}
                  onChange={(event) =>
                    updateItemField?.(
                      index,
                      "description",
                      event.target.value
                    )
                  }
                />
              )}
            </td>

            <td className="px-3 py-2">
              {readonly ? (
                <div>{item.category ?? "-"}</div>
              ) : (
                <Select
                  value={item.category ?? ""}
                    onValueChange={(value) =>{
                      console.log(value);
                      updateItemField?.(index, "category", value)
                    }
                  }
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.code} value={category.code}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <p className="mt-1 text-xs text-muted-foreground">
                {item.category}
              </p>
            </td>

            <td className="px-3 py-2 text-center">
              {readonly ? (
                <div>{item.quantity}</div>
              ) : (
                <Input
                  className="mx-auto h-8 w-20 text-center text-sm"
                  type="number"
                  value={item.quantity ?? ""}
                  onChange={(event) =>
                    updateItemField?.(index, "quantity", event.target.value)
                  }
                />
              )}
            </td>

            <td className="px-3 py-2 text-center align-middle">
              {readonly ? (
                <div>{item.unit ?? "-"}</div>
              ) : (
                <Input
                  className="mx-auto h-8 w-20 text-center text-sm"
                  value={item.unit ?? ""}
                  onChange={(event) =>
                    updateItemField?.(index, "unit", event.target.value)
                  }
                />
              )}
            </td>

            <td className="px-3 py-2 text-right">
              {readonly ? (
                <div>{formatMoney(item.unitPrice)}</div>
              ) : (
                <div>
                  <Input
                    className="ml-auto h-8 w-28 text-right text-sm"
                    type="number"
                    value={item.unitPrice ?? ""}
                    onChange={(event) =>
                      updateItemField?.(
                        index,
                        "unitPrice",
                        event.target.value
                      )
                    }
                  />

                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatMoney(item.unitPrice)}
                  </div>
                </div>
              )}
            </td>

            <td className="px-3 py-2 text-right align-middle font-semibold">
              {formatMoney(item.totalPrice)}
            </td>

            {!readonly && (
              <td className="px-3 py-2 text-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem?.(index)}
                >
                  Remove
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}