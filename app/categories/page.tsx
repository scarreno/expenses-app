// app/categories/page.tsx

import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { prisma } from "@/app/lib/prisma";
import { ensureUserDefaultCategories } from "@/app/lib/categories";
import { getCategoryLabel } from "@/app/lib/category-labels";

export default async function CategoriesPage() {
  const user = await getCurrentUserOrRedirect();

  await ensureUserDefaultCategories(user.id);

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: [{ isDefault: "desc" }, { code: "asc" }],
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage the categories used to classify your receipt items.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Active Categories</h2>
          <p className="text-sm text-muted-foreground">
            These categories will be used later during receipt extraction and
            preview.
          </p>
        </div>

        <div className="divide-y">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="font-medium">
                  {getCategoryLabel(category, "en")}
                </p>

                <p className="text-sm text-muted-foreground">
                  {category.code}
                </p>
              </div>

              <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                {category.isDefault ? "Default" : "Custom"}
              </span>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No categories found.
          </div>
        )}
      </div>
    </main>
  );
}