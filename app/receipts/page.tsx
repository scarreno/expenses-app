import Link from "next/link";
import { formatMoney } from "@/app/lib/format-money";
import { prisma } from "@/app/lib/prisma";

export default async function ReceiptsPage() {
  const receipts = await prisma.receipt.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main style={{ padding: 32 }}>
      <h1>Receipts History</h1>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
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
    </main>
  );
}
