import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { ensureUserDefaultCategories } from "@/app/lib/categories";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { prisma } from "@/app/lib/prisma";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconInfoCircle } from "@tabler/icons-react";

import {
  createCategory,
  deactivateCategory,
  reactivateCategory,
  updateCategory,
} from "./actions";

type CategoryViewModel = {
  code: string;
  displayName: string | null;
  isDefault: boolean;
};

function getLocalizedCategoryLabel(
  category: CategoryViewModel,
  defaultLabels: Record<string, string>
) {
  if (category.isDefault) {
    return defaultLabels[category.code] ?? category.code;
  }

  return category.displayName ?? category.code;
}

export default async function CategoriesPage() {
  const user = await getCurrentUserOrRedirect();

  const settings = await getUserSettings(user.id);
  const dictionary = await getDictionary(settings.language);

  await ensureUserDefaultCategories(user.id);

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [{ isActive: "desc" }, { isDefault: "desc" }, { code: "asc" }],
  });

  const defaultCategories = categories.filter((category) => category.isDefault);

  const customActiveCategories = categories.filter(
    (category) => !category.isDefault && category.isActive
  );

  const customInactiveCategories = categories.filter(
    (category) => !category.isDefault && !category.isActive
  );

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title={dictionary.categories.page.title}
        description={dictionary.categories.page.description}
      />

      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="default">
            {dictionary.categories.tabs.default} ({defaultCategories.length})
          </TabsTrigger>

          <TabsTrigger value="custom">
            {dictionary.categories.tabs.custom} ({customActiveCategories.length})
          </TabsTrigger>

          <TabsTrigger value="inactive">
            {dictionary.categories.tabs.inactive} (
            {customInactiveCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default">
          <Card>
            <CardHeader>
              <CardTitle>
                {dictionary.categories.sections.defaultTitle}
              </CardTitle>

              <CardDescription>
                {dictionary.categories.sections.defaultDescription}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {defaultCategories.map((category) => (
                <div
                  key={category.id}
                  className="border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {getLocalizedCategoryLabel(
                        category,
                        dictionary.categories.defaults
                      )}
                    </p>

                    <Badge variant="secondary">
                      {dictionary.categories.labels.default}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {category.code}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {dictionary.categories.sections.addCustomTitle}
                </CardTitle>

                <CardDescription>
                  {dictionary.categories.sections.addCustomDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form
                  action={createCategory}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <Input
                    name="displayName"
                    placeholder={dictionary.categories.form.categoryName}
                  />

                  <Button type="submit" size="lg" className="sm:min-w-28">
                    {dictionary.categories.actions.add}
                  </Button>
                </form>

                <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
                  <IconInfoCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />

                  <p className="text-sm text-muted-foreground">
                    {dictionary.categories.sections.customUsageNote}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {dictionary.categories.sections.customTitle}
                </CardTitle>

                <CardDescription>
                  {dictionary.categories.sections.customDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {customActiveCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dictionary.categories.emptyStates.noCustomCategories}
                  </p>
                )}

                {customActiveCategories.map((category) => (
                  <div
                    key={category.id}
                    className="grid gap-4 border-b pb-4 last:border-0 last:pb-0 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {getLocalizedCategoryLabel(
                            category,
                            dictionary.categories.defaults
                          )}
                        </p>

                        <Badge variant="outline">
                          {dictionary.categories.labels.custom}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {category.code}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-72">
                      <form action={updateCategory} className="flex gap-2">
                        <input type="hidden" name="id" value={category.id} />

                        <Input
                          name="displayName"
                          defaultValue={getLocalizedCategoryLabel(
                            category,
                            dictionary.categories.defaults
                          )}
                        />

                        <Button type="submit" variant="outline">
                          {dictionary.categories.actions.save}
                        </Button>
                      </form>

                      <form action={deactivateCategory}>
                        <input type="hidden" name="id" value={category.id} />

                        <Button
                          type="submit"
                          variant="destructive"
                          className="w-full"
                        >
                          {dictionary.categories.actions.deactivate}
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>
                {dictionary.categories.sections.inactiveTitle}
              </CardTitle>

              <CardDescription>
                {dictionary.categories.sections.inactiveDescription}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {customInactiveCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {dictionary.categories.emptyStates.noInactiveCategories}
                </p>
              )}

              {customInactiveCategories.map((category) => (
                <div
                  key={category.id}
                  className="grid gap-4 border-b pb-4 last:border-0 last:pb-0 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-muted-foreground">
                        {getLocalizedCategoryLabel(
                          category,
                          dictionary.categories.defaults
                        )}
                      </p>

                      <Badge variant="outline">
                        {dictionary.categories.labels.custom}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {category.code}
                    </p>
                  </div>

                  <form action={reactivateCategory}>
                    <input type="hidden" name="id" value={category.id} />

                    <Button type="submit" variant="outline">
                      {dictionary.categories.actions.reactivate}
                    </Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}