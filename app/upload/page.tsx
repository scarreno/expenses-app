import { UploadPageClient } from "@/app/components/upload/upload-page-cliente";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { getAvailableCategoriesForPreview } from "@/app/lib/categories/categories";
import { getCategoryLabel } from "@/app/lib/categories/category-labels";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";

export default async function UploadPage() {
  const currentUser = await getCurrentUserOrRedirect();

  const settings = await getUserSettings(currentUser.id);
  const dictionary = await getDictionary(settings.language);

  const categories = await getAvailableCategoriesForPreview(currentUser.id);

  const categoryOptions = categories.map((category) => ({
    code: category.code,
    label: getCategoryLabel(category, dictionary.categories.defaults),
  }));

  return (
    <UploadPageClient
      categories={categoryOptions}
      settings={settings}
      dictionary={dictionary}
    />
  );
}