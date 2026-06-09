import Link from "next/link";

import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { ReceiptHistoryFilters } from "@/app/components/receipts/receipt-history-filters";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { formatMoney } from "@/app/lib/format-money";
import { prisma } from "@/app/lib/prisma";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import type { Prisma } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/utils/date";

const PAGE_SIZE = 8;

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    month?: string;
    year?: string;
  }>;
}) {
  const { page, month, year } = await searchParams;

  const currentPage = Number(page ?? "1");
  const skip = (currentPage - 1) * PAGE_SIZE;

  const selectedMonth = month ?? "all";
  const selectedYear = year ?? "all";

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);

  const where: Prisma.ReceiptWhereInput = {
    userId: user.id,
  };

  if (selectedYear !== "all" && selectedMonth !== "all") {
    where.purchaseDate = {
      startsWith: `${selectedYear}-${selectedMonth}`,
    };
  } else if (selectedYear !== "all") {
    where.purchaseDate = {
      startsWith: selectedYear,
    };
  } else if (selectedMonth !== "all") {
    where.purchaseDate = {
      contains: `-${selectedMonth}-`,
    };
  }

  const [receipts, totalReceipts, receiptsWithDates] = await Promise.all([
    prisma.receipt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),

    prisma.receipt.count({
      where,
    }),

    prisma.receipt.findMany({
      where: {
        userId: user.id,
        purchaseDate: {
          not: null,
        },
      },
      select: {
        purchaseDate: true,
      },
    }),
  ]);

  const years = Array.from(
    new Set(
      receiptsWithDates
        .map((receipt) => receipt.purchaseDate?.slice(0, 4))
        .filter((receiptYear): receiptYear is string => Boolean(receiptYear))
    )
  ).sort((a, b) => b.localeCompare(a));

  const totalPages = Math.max(1, Math.ceil(totalReceipts / PAGE_SIZE));

  const paginationParams = new URLSearchParams();

  if (selectedMonth !== "all") {
    paginationParams.set("month", selectedMonth);
  }

  if (selectedYear !== "all") {
    paginationParams.set("year", selectedYear);
  }

  function getPaginationHref(targetPage: number) {
    const params = new URLSearchParams(paginationParams.toString());
    params.set("page", String(targetPage));

    return `/receipts?${params.toString()}`;
  }

  return (
    <PageContainer className="max-w-7xl">
      <PageHeader
        title="Receipts History"
        description="Browse and review your previously processed receipts."
      />

      <ReceiptHistoryFilters
        years={years}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="flex h-full flex-col">
            <CardHeader className="space-y-3 pb-3">
              <Badge variant="secondary" className="w-fit">
                {receipt.receiptType ?? "UNKNOWN"}
              </Badge>

              <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-tight">
                {receipt.store ?? "Unknown store"}
              </h2>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="text-2xl font-bold tracking-tight">
                {formatMoney(receipt.total, settings)}
              </div>

              <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Created:</span>{" "}
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

            <CardFooter className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="w-full sm:flex-1">
                <Link href={`/receipts/${receipt.id}`}>View Detail</Link>
              </Button>

              <Button asChild className="w-full sm:flex-1">
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
            <Link href={getPaginationHref(currentPage - 1)}>Previous</Link>
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
            <Link href={getPaginationHref(currentPage + 1)}>Next</Link>
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