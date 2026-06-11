import { formatMoney } from "@/app/lib/format-money";
import { UserSettings } from "@/app/types/user-settings-types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDisplayDate } from "@/lib/utils/date";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  store: string | null;
  total: number | null;
  editable?: boolean;
  purchaseDate: string | null;
  settings: UserSettings;
  dictionary: Dictionary;
  updateReceiptField?: (field: "store" | "purchaseDate", value: string) => void;
};

export function ReceiptItemsSummary({
  store,
  total,
  editable,
  purchaseDate,
  settings,
  dictionary,
  updateReceiptField,
}: Props) {
  const selectedDate = purchaseDate ? parseISO(purchaseDate) : undefined;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>{dictionary.receipt.summary.title}</CardTitle>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <div className="min-w-0 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {dictionary.receipt.summary.store}
            </label>

            {editable ? (
              <Input
                className="h-9 w-full"
                value={store ?? ""}
                onChange={(event) =>
                  updateReceiptField?.("store", event.target.value)
                }
              />
            ) : (
              <div className="truncate text-2xl font-semibold">
                {store ?? dictionary.receipt.summary.unknownStore}
              </div>
            )}
          </div>

          <div className="w-full space-y-2 md:w-[220px]">
            <label className="text-sm font-medium text-muted-foreground">
              {dictionary.receipt.summary.purchaseDate}
            </label>

            {editable ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate
                      ? formatDisplayDate(selectedDate, settings)
                      : dictionary.receipt.actions.selectDate}
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" side="bottom" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;

                      updateReceiptField?.(
                        "purchaseDate",
                        format(date, settings.storageFormat)
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="text-lg font-medium">
                {purchaseDate ? purchaseDate : "Unknown"}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          {formatMoney(total, settings)}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {dictionary.receipt.summary.totalExtracted}
        </p>
      </CardContent>
    </Card>
  );
}