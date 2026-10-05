import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/app/lib/auth/auth-user";
import { loadDashboard } from "@/app/lib/dashboard/get-dashboard-metrics";
import { labelCategoryTotals } from "@/app/lib/dashboard/label-category-totals";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const dashboard = await loadDashboard(user.id, {
    month: request.nextUrl.searchParams.get("month"),
    year: request.nextUrl.searchParams.get("year"),
    category: request.nextUrl.searchParams.get("category"),
  });
  const settings = await getUserSettings(user.id);
  const dictionary = getDictionary(settings.language);

  return NextResponse.json(
    labelCategoryTotals(
      dashboard.period.categoryTotals,
      dashboard.categories,
      dictionary.categories.defaults
    )
  );
}
