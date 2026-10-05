import { CategoryTotalsChartClient } from "./client";

import { Dictionary } from "@/app/types/dictionary";
import { UserSettings } from "@/app/types/user-settings-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ChartData = {
  category: string;
  total: number;
};

type Props = {
  data: ChartData[];
  settings: UserSettings;
  dictionary: Dictionary;
};

export function CategoryTotalsChart({ data, settings, dictionary }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.categoryInsights.title}</CardTitle>
        <CardDescription>{dictionary.dashboard.categoryInsights.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <CategoryTotalsChartClient data={data} settings={settings} dictionary={dictionary} />
      </CardContent>
    </Card>
  );
}
