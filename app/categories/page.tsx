import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { prisma } from "@/app/lib/prisma";
import { ensureUserDefaultCategories } from "@/app/lib/categories";
import { getCategoryLabel } from "@/app/lib/category-labels";
import {
  createCategory,
  deactivateCategory,
  updateCategory,
  reactivateCategory
} from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/app/components/layout/page-header";

export default async function CategoriesPage() {
  const user = await getCurrentUserOrRedirect();

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
  <main className="mx-auto max-w-4xl space-y-6 p-6">
    <PageHeader
                title="Categories"
                description="Manage the categories used to classify your receipt items."
              />
    
    <Tabs defaultValue="default" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="default">
          Default ({defaultCategories.length})
        </TabsTrigger>

        <TabsTrigger value="custom">
          Custom ({customActiveCategories.length})
        </TabsTrigger>

        <TabsTrigger value="inactive">
          Inactive ({customInactiveCategories.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="default">
        <Card>
          <CardHeader>
            <CardTitle>Default Categories</CardTitle>
            <CardDescription>
              System categories used by AI classification.
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
                    {getCategoryLabel(category, "en")}
                  </p>

                  <Badge variant="secondary">
                    Default
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
              <CardTitle>Add Custom Category</CardTitle>
              <CardDescription>
                Create categories for manual reassignment.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={createCategory} className="flex gap-3">
                <Input
                  name="displayName"
                  placeholder="Category name"
                />

                <Button
                  type="submit"
                  size="lg"
                  className="min-w-28"
                >
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Categories</CardTitle>
              <CardDescription>
                Active categories available for manual reassignment.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {customActiveCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No custom categories found.
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
                        {getCategoryLabel(category, "en")}
                      </p>

                      <Badge variant="outline">
                        Custom
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {category.code}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 md:min-w-72">
                    <form
                      action={updateCategory}
                      className="flex gap-2"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={category.id}
                      />

                      <Input
                        name="displayName"
                        defaultValue={getCategoryLabel(
                          category,
                          "en"
                        )}
                      />

                      <Button
                        type="submit"
                        variant="outline"
                      >
                        Save
                      </Button>
                    </form>

                    <form action={deactivateCategory}>
                      <input
                        type="hidden"
                        name="id"
                        value={category.id}
                      />

                      <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                      >
                        Deactivate
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
            <CardTitle>Inactive Categories</CardTitle>
            <CardDescription>
              Hidden custom categories that can be restored.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {customInactiveCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No inactive categories.
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
                      {getCategoryLabel(category, "en")}
                    </p>

                    <Badge variant="outline">
                      Custom
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {category.code}
                  </p>
                </div>

                <form action={reactivateCategory}>
                  <input
                    type="hidden"
                    name="id"
                    value={category.id}
                  />

                  <Button
                    type="submit"
                    variant="outline"
                  >
                    Reactivate
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </main>
);
}