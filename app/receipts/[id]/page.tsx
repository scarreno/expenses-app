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
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = await getDictionary(settings.language);

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
          title={dictionary.receipt.pages.detail.title}
          description={dictionary.receipt.pages.detail.description}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href="/receipts">
              <IconChevronsLeft className="mr-2 size-4" />
              {dictionary.receipt.actions.backToReceipts}
            </Link>
          </Button>

          <DeleteReceiptButton receiptId={receipt.id} dictionary={dictionary} />
        </div>
      </PageHeaderActions>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0">
          <ReceiptFilePreview fileUrl={receipt.publicFileUrl ?? ""} dictionary={dictionary} />
        </div>

        <div className="min-w-0 space-y-6">
          <ReceiptItemsSummary
            store={receipt.store}
            total={receipt.total}
            purchaseDate={
              receipt.purchaseDate
                ? formatDisplayDate(receipt.purchaseDate, settings)
                : null
            }
            settings={settings}
            dictionary={dictionary}
          />

            <ReceiptItemsTable
              items={receipt.items}
              readonly
              settings={settings}
              dictionary={dictionary}
            />
        </div>
      </section>
    </PageContainer>
  );
}