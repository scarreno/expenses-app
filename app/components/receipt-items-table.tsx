import { ReceiptItem } from "@/app/types/receipt";
import { Input } from "@/components/ui/input";
import { formatMoney }
from "@/app/lib/format-money";
import { Button } from "@/components/ui/button";

type Props = {
    items: ReceiptItem[];
    readonly: boolean;
    
    updateItemField?: (index: number,
        field: keyof ReceiptItem,
        value: string) => void;

    removeItem?: (index: number) => void;
}

export function ReceiptItemsTable({
                                items,
                                updateItemField,
                                removeItem,
                                readonly,
                                }: Props){
    return (
  <table className="min-w-[900px] w-full table-fixed text-sm">
    <thead className="border-b text-left text-muted-foreground">
      <tr>
        <th className="w-[34%] border-b border-zinc-800 px-3 py-2 text-left text-[11px] uppercase tracking-wide text-zinc-400">
          Description
        </th>

        <th className="w-[10%] border-b border-zinc-800 px-3 py-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">
          Quantity
        </th>

        <th className="w-[10%] border-b border-zinc-800 px-3 py-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">
          Unit
        </th>

        <th className="w-[18%] border-b border-zinc-800 px-3 py-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">
          Unit Price
        </th>

        <th className="w-[12%] border-b border-zinc-800 px-3 py-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">
          Total
        </th>

        {!readonly && (
          <th className="w-[12%] border-b border-zinc-800 px-3 py-2 text-center text-[11px] uppercase tracking-wide text-zinc-400">
            Actions
          </th>
        )}
      </tr>
    </thead>

    <tbody>
      {items.map((item, index) => (
        <tr key={index} className="border-b border-zinc-900">
          <td className="px-3 py-2">
            {readonly ? (
              <div>{item.description}</div>
            ) : (
              <Input
                className="h-8 w-full text-sm"
                value={item.description}
                onChange={(event) =>
                  updateItemField?.(index, "description", event.target.value)
                }
              />
            )}
            <p className="text-xs text-muted-foreground">
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
                    updateItemField?.(index, "unitPrice", event.target.value)
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
                variant="outline"
                size="sm"
                className="border-red-900/60 text-red-400 hover:bg-red-950 hover:text-red-200"
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