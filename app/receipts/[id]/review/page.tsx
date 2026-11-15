import { notFound } from "next/navigation";

import { ReceiptReviewClient } from "./review-client";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { getAvailableCategoriesForPreview } from "@/app/lib/categories/categories";
import { getCategoryLabel } from "@/app/lib/categories/category-labels";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { getExtraction } from "@/app/lib/receipts/extraction-api";
import { REVIEW_QUEUE_STATUSES } from "@/app/lib/receipts/receipt-lifecycle";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";

export default async function ReceiptReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = getDictionary(settings.language);
  const extraction = await getExtraction(user.id, id);

  if (
    !extraction ||
    !(REVIEW_QUEUE_STATUSES as readonly string[]).includes(extraction.status)
  ) {
    notFound();
  }

  const categories = await getAvailableCategoriesForPreview(user.id);
  const categoryOptions = categories.map((category) => ({
    code: category.code,
    label: getCategoryLabel(category, dictionary.categories.defaults),
  }));

  return (
    <ReceiptReviewClient
      initial={extraction}
      categories={categoryOptions}
      settings={settings}
      dictionary={dictionary}
    />
  );
}
