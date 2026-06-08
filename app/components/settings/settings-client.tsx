"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

export function SettingsClient({ settings }: SettingsClientProps) {
  const [locale, setLocale] = useState(settings.locale);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  const [saving, setSaving] = useState(false);

  const currencyLocale =
    currencyCode === "CLP" ? "es-CL" : currencyCode === "EUR" ? "de-DE" : "en-US";

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
  <Card>
    <CardHeader>
      <CardTitle>Application Settings</CardTitle>
      <CardDescription>
        Configure how dates, language and currency are displayed.
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-0">
      <div className="grid gap-4 border-b py-4 md:grid-cols-[1fr_260px] md:items-center">
        <div className="space-y-1">
          <label className="text-sm font-medium">Locale</label>
          <p className="text-sm text-muted-foreground">
            Select the language and regional format used by the application.
          </p>
        </div>

        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es-CL">Spanish (Chile)</SelectItem>
            <SelectItem value="en-US">English (US)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 border-b py-4 md:grid-cols-[1fr_260px] md:items-center">
        <div className="space-y-1">
          <label className="text-sm font-medium">Date Format</label>
          <p className="text-sm text-muted-foreground">
            Choose how receipt dates are displayed across the app.
          </p>
        </div>

        <Select value={dateFormat} onValueChange={setDateFormat}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dd-MM-yyyy">dd-MM-yyyy</SelectItem>
            <SelectItem value="MM-dd-yyyy">MM-dd-yyyy</SelectItem>
            <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 border-b py-4 md:grid-cols-[1fr_260px] md:items-start">
        <div className="space-y-1">
          <label className="text-sm font-medium">Currency</label>
          <p className="text-sm text-muted-foreground">
            Changing the currency updates symbols and formatting only.
            Existing receipt amounts are not converted.
          </p>
        </div>

        <Select value={currencyCode} onValueChange={setCurrencyCode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CLP">Chilean Peso (CLP)</SelectItem>
            <SelectItem value="USD">US Dollar (USD)</SelectItem>
            <SelectItem value="EUR">Euro (EUR)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </CardContent>
  </Card>
);
}