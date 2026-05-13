import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

export default async function ReceiptsPage() {
  const receipts = await prisma.receipt.findMany({
    include: {
      items: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main style={{ padding: 32 }}>
      <h1>Receipts</h1>

      <table
        border={1}
        cellPadding={8}
        style={{
          marginTop: 24,
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Status</th>
            <th>Store</th>
            <th>Total</th>
            <th>Items</th>
            <th>Date</th>
            <th>Detail</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>{receipt.status}</td>

              <td>{receipt.store ?? "-"}</td>

              <td>{receipt.total ?? "-"}</td>

              <td>{receipt.items.length}</td>

              <td>{receipt.createdAt.toLocaleString()}</td>

              <td>
                <Link href={`/receipts/${receipt.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
