import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatMoney }
from "@/app/lib/format-money";

type Props = {
  store: string | null;
  total: number | null;
};

export function ReceiptItemsSummary({
  store,
  total,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Receipt Summary
        </CardDescription>

        <CardTitle className="text-2xl">
          {store ?? "Unknown store"}
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