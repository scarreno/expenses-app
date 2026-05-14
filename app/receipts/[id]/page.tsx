import { notFound } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

import { ReceiptFilePreview }
from "@/app/components/receipt-file-preview";

import { ReceiptItemsSummary }
from "@/app/components/receipt-items-summary";

import { ReceiptItemsTable }
from "@/app/components/receipt-items-table";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const receipt =
    await prisma.receipt.findUnique({
      where: {
        id,
      },

      include: {
        items: true,
      },
    });

  if (!receipt) {
    notFound();
  }

  return (
    <main style={{ padding: 32 }}>

      <h1>Receipt Detail</h1>

      <section
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >

        <ReceiptFilePreview
          fileUrl={
            receipt.publicFileUrl ?? ""
          }
        />

        <div>

          <ReceiptItemsSummary
            store={receipt.store}
            total={receipt.total}
          />

          <ReceiptItemsTable
            items={receipt.items}
            readonly
          />

        </div>

      </section>

    </main>
  );
}