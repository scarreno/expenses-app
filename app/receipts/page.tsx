import Link from "next/link";
import { formatMoney } from "@/app/lib/format-money";
import { prisma } from "@/app/lib/prisma";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 6;

export default async function ReceiptsPage({ searchParams } : 
      { searchParams: Promise<{page?: string}>; }) {
    const { page } = await searchParams;

    const currentPage = Number(page ?? "1");
    const skip = (currentPage - 1) * PAGE_SIZE;

    const [receipts, totalReceipts] = await Promise.all([
      prisma.receipt.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),

      prisma.receipt.count(),
    ]);

    const totalPages = Math.ceil(totalReceipts / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Receipts History
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Browse and review your previously processed receipts.
        </p>
      </div>

      <div className="
            grid
            gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          ">
        {receipts.map((receipt) => (
          <article
            key={receipt.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, color: "#777" }}>
              {receipt.receiptType ?? "UNKNOWN"}
            </div>

            <h2 style={{ marginTop: 8 }}>
              {receipt.store ?? "Unknown store"}
            </h2>

            <div
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              {formatMoney(receipt.total)}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                color: "#777",
              }}
            >
              {receipt.createdAt.toLocaleString("es-CL")}
            </div>

            <Link
              href={`/receipts/${receipt.id}`}
              style={{
                display: "inline-block",
                marginTop: 16,
              }}
            >
              View detail
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-center gap-4">
        {currentPage > 1 ? (
          <Button variant="outline" asChild>
            <Link href={`/receipts?page=${currentPage - 1}`}>
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Previous
          </Button>
        )}

        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Button variant="outline" asChild>
            <Link href={`/receipts?page=${currentPage + 1}`}>
              Next
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Next
          </Button>
        )}
      </div>   
    </main>
  );
}
