import Link from "next/link";
import {
  IconChartBar,
  IconReceipt,
  IconUpload,
} from "@tabler/icons-react";

import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { getRecentReceipts } from "@/app/lib/receipts/get-recent-receipts";
import { getReceiptSummary } from "@/app/lib/receipts/get-summary";
import { formatDisplayDate } from "@/lib/utils/date"
import { formatMoney } from "@/lib/utils/format-money";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {

  console.log('llega al homepge');
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = await getDictionary(settings.language);

  const summary = await getReceiptSummary(user.id);
  const recentReceipts = await getRecentReceipts(user.id);

  const quickActions = [
    {
      href: "/upload",
      title: dictionary.home.quickActions.upload.title,
      description: dictionary.home.quickActions.upload.description,
      icon: IconUpload,
    },
    {
      href: "/receipts",
      title: dictionary.home.quickActions.receipts.title,
      description: dictionary.home.quickActions.receipts.description,
      icon: IconReceipt,
    },
    {
      href: "/dashboard",
      title: dictionary.home.quickActions.dashboard.title,
      description: dictionary.home.quickActions.dashboard.description,
      icon: IconChartBar,
    },
  ];

  const summaryCards = [
    {
      title: dictionary.home.summary.totalSpent,
      value: formatMoney(summary.totalSpent, settings),
    },
    {
      title: dictionary.home.summary.receipts,
      value: String(summary.totalReceipts),
    },
    {
      title: dictionary.home.summary.items,
      value: String(summary.totalItems),
    },
    {
      title: dictionary.home.summary.averageReceipt,
      value: formatMoney(summary.averageReceipt, settings),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`${dictionary.home.header.title}, ${user.name}`}
        description={dictionary.home.header.description}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition hover:bg-muted/50">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon size={22} />
                  </div>

                  <div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-3xl">{card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.home.recentActivity.title}</CardTitle>
        </CardHeader>

        <CardContent>
          {recentReceipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {dictionary.home.recentActivity.empty}
            </p>
          ) : (
            <div className="space-y-2">
              {recentReceipts.map((receipt) => (
                <Link
                  key={receipt.id}
                  href={`/receipts/${receipt.id}`}
                  className="grid gap-2 rounded-lg border p-4 transition hover:bg-muted/50 sm:grid-cols-[1fr_auto_auto]"
                >
                  <div className="font-medium">
                    {receipt.store ?? "Unknown store"}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {receipt.purchaseDate
                      ? formatDisplayDate(receipt.purchaseDate, settings)
                      : "-"}
                  </div>

                  <div className="font-semibold">
                    {formatMoney(receipt.total ?? 0, settings)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}