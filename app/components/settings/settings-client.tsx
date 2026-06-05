"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingsClientProps = {
  settings: {
    locale: string;
    dateFormat: string;
    currencyLocale: string;
    currencyCode: string;
  };
};

export function SettingsClient({
  settings,
}: SettingsClientProps) {
  const [locale, setLocale] = useState(settings.locale);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currencyLocale, setCurrencyLocale] = useState(settings.currencyLocale);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale,
          dateFormat,
          currencyLocale,
          currencyCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Locale
            </label>

            <Select
              value={locale}
              onValueChange={setLocale}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="es-CL">
                  Spanish (Chile)
                </SelectItem>

                <SelectItem value="en-US">
                  English (US)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Date Format
            </label>

            <Select
              value={dateFormat}
              onValueChange={setDateFormat}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="dd-MM-yyyy">
                  dd-MM-yyyy
                </SelectItem>

                <SelectItem value="MM-dd-yyyy">
                  MM-dd-yyyy
                </SelectItem>

                <SelectItem value="yyyy-MM-dd">
                  yyyy-MM-dd
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Currency
            </label>

            <Select
              value={currencyCode}
              onValueChange={setCurrencyCode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="CLP">
                  Chilean Peso (CLP)
                </SelectItem>

                <SelectItem value="USD">
                  US Dollar (USD)
                </SelectItem>

                <SelectItem value="EUR">
                  Euro (EUR)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changing the currency updates symbols and formatting only. Existing receipt amounts are not converted.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}