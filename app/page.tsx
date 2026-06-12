import { HomePageClient } from "@/app/home/home-page-client";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { getAvailableCategoriesForPreview } from "@/app/lib/categories";
import { getCategoryLabel } from "@/app/lib/category-labels";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

export default async function Page() {
  const currentUser = await getCurrentUserOrRedirect();

  const categories = await getAvailableCategoriesForPreview(currentUser.id);
  const settings = await getUserSettings(currentUser.id);
  const dictionary = getDictionary(settings.language);

  const categoryOptions = categories.map((category) => ({
    code: category.code,
    label: getCategoryLabel(category, dictionary.categories.defaults),
  }));

  return (
    <HomePageClient
      categories={categoryOptions}
      settings={settings}
      dictionary={dictionary}
    />
  );
}