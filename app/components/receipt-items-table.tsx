import { formatMoney } from "@/app/lib/format-money";
import { ReceiptItem } from "@/app/types/receipt";
import { UserSettings } from "@/app/types/user-settings-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Dictionary } from "@/app/types/dictionary";

type ReceiptCategoryOption = {
  code: string;
  label: string;
};

type Props = {
  items: ReceiptItem[];
  readonly: boolean;
  categories?: ReceiptCategoryOption[];
  settings: UserSettings;
  dictionary: Dictionary;

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
  settings,
  dictionary
}: Props) {
  function getCategoryLabel(code?: string | null) {
    if (!code) {
      return "-";
    }

    return categories.find((category) => category.code === code)?.label ?? code;
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-lg border bg-card">
      <table
        className={cn(
          "w-full table-fixed text-sm",
          readonly ? "min-w-[760px]" : "min-w-[980px]"
        )}
      >
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="w-[28%] border-b px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide">
              {dictionary.receipt.items.description}
            </th>

            <th className="w-[20%] border-b px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide">
              {dictionary.receipt.items.category}
            </th>

            <th className="w-[10%] border-b px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wide">
              {dictionary.receipt.items.quantity}
            </th>

            <th className="w-[9%] border-b px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wide">
              {dictionary.receipt.items.unit}
            </th>

            <th className="w-[12%] border-b px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide">
              {dictionary.receipt.items.unitPrice}
            </th>

            <th className="w-[10%] border-b px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide">
              {dictionary.receipt.items.total}
            </th>

            {!readonly && (
              <th className="w-[11%] border-b px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wide">
                {dictionary.receipt.items.actions}
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="px-3 py-2 align-middle">
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

              <td className="px-3 py-2 align-middle">
                {readonly ? (
                  <div>{getCategoryLabel(item.category)}</div>
                ) : (
                  <>
                    <Select
                      value={item.category ?? ""}
                      onValueChange={(value) =>
                        updateItemField?.(index, "category", value)
                      }
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>

                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.code}
                            value={category.code}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  </>
                )}
              </td>

              <td className="px-3 py-2 text-center align-middle">
                {readonly ? (
                  <div>{item.quantity ?? "-"}</div>
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

              <td className="px-3 py-2 text-right align-middle">
                {readonly ? (
                  <div>{formatMoney(item.unitPrice, settings)}</div>
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
                      {formatMoney(item.unitPrice, settings)}
                    </div>
                  </div>
                )}
              </td>

              <td className="px-3 py-2 text-right align-middle font-semibold">
                {formatMoney(item.totalPrice, settings)}
              </td>

              {!readonly && (
                <td className="px-3 py-2 text-center align-middle">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem?.(index)}
                  >
                    {dictionary.receipt.actions.removeItem}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}