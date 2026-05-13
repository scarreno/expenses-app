import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

type ReceiptDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReceiptDetailPage({
  params,
}: ReceiptDetailPageProps) {
  const { id } = await params;

  const receipt = await prisma.receipt.findUnique({
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
      <Link href="/receipts">← Back to receipts</Link>

      <h1>Receipt detail</h1>

      <section style={{ marginTop: 24 }}>
        <p>
          <strong>Status:</strong> {receipt.status}
        </p>
        <p>
          <strong>Store:</strong> {receipt.store ?? "-"}
        </p>
        <p>
          <strong>Branch:</strong> {receipt.branch ?? "-"}
        </p>
        <p>
          <strong>Purchase date:</strong>{" "}
          {receipt.purchaseDate?.toLocaleDateString() ?? "-"}
        </p>
        <p>
          <strong>Purchase time:</strong> {receipt.purchaseTime ?? "-"}
        </p>
        <p>
          <strong>Payment method:</strong> {receipt.paymentMethod ?? "-"}
        </p>
        <p>
          <strong>Subtotal:</strong> {receipt.subtotal ?? "-"}
        </p>
        <p>
          <strong>Tax:</strong> {receipt.tax ?? "-"}
        </p>
        <p>
          <strong>Total:</strong> {receipt.total ?? "-"}
        </p>
        <p>
          <strong>File:</strong> {receipt.fileName ?? "-"}
        </p>
        <p>
          <strong>File path:</strong> {receipt.filePath ?? "-"}
        </p>
      </section>

      <h2 style={{ marginTop: 32 }}>Items</h2>

      <table
        border={1}
        cellPadding={8}
        style={{
          marginTop: 16,
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>SKU</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.id}>
              <td>{item.sku ?? "-"}</td>
              <td>{item.description}</td>
              <td>{item.quantity ?? "-"}</td>
              <td>{item.unit ?? "-"}</td>
              <td>{item.unitPrice ?? "-"}</td>
              <td>{item.totalPrice ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>Raw JSON</h2>

      <pre
        style={{
          marginTop: 16,
          padding: 16,
          background: "#f4f4f4",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(receipt.rawJson, null, 2)}
      </pre>
    </main>
  );
}
