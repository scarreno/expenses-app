import Link from "next/link";

import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { formatMoney } from "@/app/lib/format-money";
import { prisma } from "@/app/lib/prisma";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/utils/date";

const PAGE_SIZE = 8;

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  const currentPage = Number(page ?? "1");
  const skip = (currentPage - 1) * PAGE_SIZE;

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);

  const where = {
    userId: user.id,
  };

  const [receipts, totalReceipts] = await Promise.all([
    prisma.receipt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),

    prisma.receipt.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(totalReceipts / PAGE_SIZE);

  return (
    <PageContainer className="max-w-7xl">
      <PageHeader
        title="Receipts History"
        description="Browse and review your previously processed receipts."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="flex h-full flex-col">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                {receipt.receiptType ?? "UNKNOWN"}
              </Badge>

              <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-tight">
                {receipt.store ?? "Unknown store"}
              </h2>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="text-2xl font-bold">
                {formatMoney(receipt.total, settings)}
              </div>

              <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    Created:
                  </span>{" "}
                  {receipt.createdAt.toLocaleString()}
                </div>

                <div>
                  <span className="font-medium text-foreground">
                    Purchase Date:
                  </span>{" "}
                  {receipt.purchaseDate
                    ? formatDisplayDate(receipt.purchaseDate, settings)
                    : "Unknown"}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/receipts/${receipt.id}`}>View Detail</Link>
              </Button>

              <Button asChild className="flex-1">
                <Link href={`/receipts/${receipt.id}/edit`}>
                  Edit Receipt
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        {currentPage > 1 ? (
          <Button variant="outline" asChild>
            <Link href={`/receipts?page=${currentPage - 1}`}>Previous</Link>
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
            <Link href={`/receipts?page=${currentPage + 1}`}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Next
          </Button>
        )}
      </div>
    </PageContainer>
  );
}