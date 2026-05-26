import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatMoney }
from "@/app/lib/format-money";
import { Input } from "@/components/ui/input";

type Props = {
    store: string | null;
    total: number | null;
    editable?: boolean;
    updateReceiptField?: (
        field: "store",
        value: string
    ) => void;
};

export function ReceiptItemsSummary({
  store,
  total,
  editable,
  updateReceiptField
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Receipt Summary
        </CardDescription>

        <CardTitle className="text-2xl">
          {editable ? (
            <Input
                value={store ?? ""}
                onChange={(event) =>
                updateReceiptField?.("store", event.target.value)
                }
            />
            ) : (
            <CardTitle className="text-2xl">
                {store ?? "Unknown store"}
            </CardTitle>
            )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          {formatMoney(total)}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Total extracted from receipt items
        </p>
      </CardContent>
    </Card>
  );
}