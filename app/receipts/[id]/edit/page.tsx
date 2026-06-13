import { EditReceiptClient } from "@/app/components/edit-receipt-client";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { getAvailableCategoriesForPreview } from "@/app/lib/categories/categories";
import { getCategoryLabel } from "@/app/lib/categories/category-labels";
import { prisma } from "@/app/lib/database/prisma";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

export default async function ReceiptEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = await getDictionary(settings.language);

  const receipt = await prisma.receipt.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!receipt) {
    notFound();
  }

  const categories = await getAvailableCategoriesForPreview(user.id);

  const categoryOptions = categories.map((category) => ({
    code: category.code,
    label: getCategoryLabel(category, dictionary.categories.defaults),
  }));

  return (
    <EditReceiptClient
      receipt={receipt}
      categories={categoryOptions}
      settings={settings}
      dictionary={dictionary}
    />
  );
}