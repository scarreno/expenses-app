import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { getAvailableCategoriesForPreview } from "@/app/lib/categories";
import { getCategoryLabel } from "@/app/lib/category-labels";
import { HomePageClient } from "@/app/home/home-page-client";
import { getUserSettings } from "@/app/lib/settings/get-user-settings"

export default async function Page() {
  const currentUser = await getCurrentUserOrRedirect();

  const categories = await getAvailableCategoriesForPreview(currentUser.id);
  const settings = await getUserSettings(currentUser.id);

  const categoryOptions = categories.map((category) => ({
    code: category.code,
    label: getCategoryLabel(category, "en"),
  }));

  return <HomePageClient 
            categories={categoryOptions}
            settings={settings}
             />;
}