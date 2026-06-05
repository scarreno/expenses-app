import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { formatMoney }
from "@/app/lib/format-money";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseISO } from "date-fns";
import { formatDisplayDate } from "@/lib/utils/date";
import { UserSettings } from "@/app/types/user-settings-types";

type Props = {
    store: string | null;
    total: number | null;
    editable?: boolean;
    purchaseDate: string | null;
    settings: UserSettings,
    updateReceiptField?: (
        field: "store" | "purchaseDate",
        value: string
    ) => void;
};


export function ReceiptItemsSummary({
  store,
  total,
  editable,
  purchaseDate,
  settings,
  updateReceiptField
}: Props) {

    const selectedDate = purchaseDate
        ? parseISO(purchaseDate)
        : undefined;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
            Receipt Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4 items-end max-w-4xl pt-4">
            <div className="space-y-2 min-w-0">
            <label className="text-sm text-muted-foreground">
                Store
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
                <div className="text-2xl font-semibold truncate">
                {store ?? "Unknown store"}
                </div>
            )}
            </div>

            <div className="space-y-2 w-full md:w-[220px]">
            <label className="text-sm text-muted-foreground">
                Purchase Date
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
                        : "Select date"}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-auto p-0 bg-zinc-950 border border-zinc-800 shadow-2xl z-50"
                >
                    <Calendar
                    className="bg-zinc-950 text-white rounded-md"
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
                {purchaseDate
                ? purchaseDate
                : "Unknown"}
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
          Total extracted from receipt items
        </p>
      </CardContent>
    </Card>
  );
}