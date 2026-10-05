import { DailyExpensesChartClient } from "./client";
import { DailyExpensesChartData } from "./types";

import { Dictionary } from "@/app/types/dictionary";
import { UserSettings } from "@/app/types/user-settings-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  data: DailyExpensesChartData[];
  settings: UserSettings;
  dictionary: Dictionary;
};

export function DailyExpensesChart({ data, settings, dictionary }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.dailyExpenses.title}</CardTitle>
        <CardDescription>{dictionary.dashboard.dailyExpenses.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <DailyExpensesChartClient data={data} settings={settings} dictionary={dictionary} />
      </CardContent>
    </Card>
  );
}
