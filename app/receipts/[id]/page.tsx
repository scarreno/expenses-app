import { notFound } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

import { ReceiptFilePreview }
from "@/app/components/receipt-file-preview";

import { ReceiptItemsSummary }
from "@/app/components/receipt-items-summary";

import { ReceiptItemsTable }
from "@/app/components/receipt-items-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { appSettings } from "@/lib/config/app-settings";
import { DeleteReceiptButton } from "@/app/components/delete-receipt-button";
import { IconChevronsLeft } from "@tabler/icons-react";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;
  const user = await getCurrentUserOrRedirect();

  const receipt =
    await prisma.receipt.findUnique({
      where: {
        id,
        userId: user.id
      },
      include: {
        items: true,
      },
    });

  if (!receipt) {
    notFound();
  }

  return (
  <main className="mx-auto max-w-7xl p-8">
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Receipt Detail
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review the original receipt and extracted items.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">
          <IconChevronsLeft className="mr-2 size-4" />
          <Link href="/receipts">
            Back to receipts
          </Link>
        </Button>

        <DeleteReceiptButton receiptId={receipt.id} />
      </div>
      
    </div>

    <section className="grid gap-6 lg:grid-cols-[35%_65%]">
      <ReceiptFilePreview fileUrl={receipt.publicFileUrl ?? ""} />

      <div className="space-y-6">
        <ReceiptItemsSummary
          store={receipt.store}
          total={receipt.total}
            purchaseDate={
            receipt.purchaseDate
              ? format(parseISO(receipt.purchaseDate), appSettings.date.displayFormat)
              : null
          }
        />

        <div className="overflow-x-auto">
          <ReceiptItemsTable
            items={receipt.items}
            readonly
          />
        </div>
      </div>
    </section>
  </main>
);
}