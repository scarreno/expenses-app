import Link from "next/link";

import { RECEIPT_STATUS } from "@/app/lib/receipts/receipt-lifecycle";
import { Dictionary } from "@/app/types/dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PendingReceipt = {
  id: string;
  fileName: string | null;
  receiptType: string | null;
  status: string;
  createdAt: Date;
};

export function PendingReceiptsSection({
  receipts,
  dictionary,
}: {
  receipts: PendingReceipt[];
  dictionary: Dictionary;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{dictionary.receiptsHistory.pending.title}</h2>
        <p className="text-sm text-muted-foreground">
          {dictionary.receiptsHistory.pending.description}
        </p>
      </div>

      {receipts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dictionary.receiptsHistory.pending.empty}</p>
      ) : (
        <div className="grid gap-3">
          {receipts.map((receipt) => (
            <Card key={receipt.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badgeVariant(receipt.status)}>
                      {statusLabel(receipt.status, dictionary)}
                    </Badge>
                    {receipt.receiptType ? (
                      <Badge variant="outline">{receipt.receiptType}</Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-sm">
                    <span className="font-medium">{dictionary.receiptsHistory.pending.file}</span>{" "}
                    {receipt.fileName ?? dictionary.receipt.summary.unknownStore}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dictionary.receiptsHistory.card.created} {receipt.createdAt.toLocaleString()}
                  </p>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/receipts/${receipt.id}/review`}>
                    {dictionary.receiptsHistory.pending.review}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function statusLabel(status: string, dictionary: Dictionary) {
  if (status === RECEIPT_STATUS.READY_FOR_REVIEW) {
    return dictionary.receiptsHistory.pending.status.ready;
  }
  if (status === RECEIPT_STATUS.EXTRACTION_FAILED) {
    return dictionary.receiptsHistory.pending.status.failed;
  }
  return dictionary.receiptsHistory.pending.status.extracting;
}

function badgeVariant(status: string) {
  if (status === RECEIPT_STATUS.EXTRACTION_FAILED) {
    return "destructive" as const;
  }
  if (status === RECEIPT_STATUS.READY_FOR_REVIEW) {
    return "default" as const;
  }
  return "secondary" as const;
}
