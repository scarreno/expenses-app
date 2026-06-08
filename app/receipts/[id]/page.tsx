import Link from "next/link";
import { notFound } from "next/navigation";
import { IconChevronsLeft } from "@tabler/icons-react";

import { DeleteReceiptButton } from "@/app/components/delete-receipt-button";
import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { PageHeaderActions } from "@/app/components/layout/page-header-actions";
import { ReceiptFilePreview } from "@/app/components/receipt-file-preview";
import { ReceiptItemsSummary } from "@/app/components/receipt-items-summary";
import { ReceiptItemsTable } from "@/app/components/receipt-items-table";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { prisma } from "@/app/lib/prisma";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils/date";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);

  const receipt = await prisma.receipt.findUnique({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: true,
    },
  });

  if (!receipt) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeaderActions>
        <PageHeader
          title="Receipt Detail"
          description="Review the original receipt and extracted items."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/receipts">
              <IconChevronsLeft className="mr-2 size-4" />
              Back to receipts
            </Link>
          </Button>

          <DeleteReceiptButton receiptId={receipt.id} />
        </div>
      </PageHeaderActions>

      <section className="grid gap-6 lg:grid-cols-[35%_65%]">
        <ReceiptFilePreview fileUrl={receipt.publicFileUrl ?? ""} />

        <div className="space-y-6">
          <ReceiptItemsSummary
            store={receipt.store}
            total={receipt.total}
            purchaseDate={
              receipt.purchaseDate
                ? formatDisplayDate(receipt.purchaseDate, settings)
                : null
            }
            settings={settings}
          />

            <ReceiptItemsTable
              items={receipt.items}
              readonly
              settings={settings}
            />
        </div>
      </section>
    </PageContainer>
  );
}