"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
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
import { Dictionary } from "@/app/types/dictionary";


type SettingsClientProps = {
  settings: {
    locale: string;
    dateFormat: string;
    currencyLocale: string;
    currencyCode: string;
    language: string;
  },
  dictionary: Dictionary;
};
import { useRouter } from "next/navigation";

export function SettingsClient({ settings, dictionary }: SettingsClientProps) {
  const [locale, setLocale] = useState(settings.locale);
  const [language, setLanguage] = useState(settings.language);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  const [saving, setSaving] = useState(false);

  const currencyLocale =
    currencyCode === "CLP"
      ? "es-CL"
      : currencyCode === "EUR"
        ? "de-DE"
        : "en-US";


  const router = useRouter();
  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          locale,
          dateFormat,
          currencyLocale,
          currencyCode,
        }),
      });

      if (!response.ok) {
        throw new Error(dictionary.settings.notifications.saveFailed);
      }

      toast.success(dictionary.settings.notifications.saved);
      router.push("/settings");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(dictionary.settings.notifications.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.settings.application.title}</CardTitle>
        <CardDescription>
          {dictionary.settings.application.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 border-b py-4 md:grid-cols-[1fr_260px] md:items-center">
          <div className="space-y-1">
            <label className="text-sm font-medium">{dictionary.settings.language.label}</label>
            <p className="text-sm text-muted-foreground">
              {dictionary.settings.language.description}
            </p>
          </div>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{dictionary.settings.language.options.english}</SelectItem>
              <SelectItem value="es">{dictionary.settings.language.options.spanish}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 border-b py-4 md:grid-cols-[1fr_260px] md:items-center">
          <div className="space-y-1">
            <label className="text-sm font-medium">{dictionary.settings.regionalFormat.label}</label>
            <p className="text-sm text-muted-foreground">
              {dictionary.settings.regionalFormat.description}
            </p>
          </div>

          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es-CL">{dictionary.settings.regionalFormat.options.spanishChile}</SelectItem>
              <SelectItem value="en-US">{dictionary.settings.regionalFormat.options.englishUs}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 border-b py-4 md:grid-cols-[1fr_260px] md:items-center">
          <div className="space-y-1">
            <label className="text-sm font-medium">{dictionary.settings.dateFormat.label}</label>
            <p className="text-sm text-muted-foreground">
              {dictionary.settings.dateFormat.description}
            </p>
          </div>

          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-full">
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
            <label className="text-sm font-medium">{dictionary.settings.currency.label}</label>
            <p className="text-sm text-muted-foreground">
              {dictionary.settings.currency.description}
            </p>
          </div>

          <Select value={currencyCode} onValueChange={setCurrencyCode}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLP">{dictionary.settings.currency.options.clp}</SelectItem>
              <SelectItem value="USD">{dictionary.settings.currency.options.usd}</SelectItem>
              <SelectItem value="EUR">{dictionary.settings.currency.options.eur}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex pt-6 sm:justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Spinner className="mr-2 size-4" />
                {dictionary.settings.actions.saving}
              </>
            ) : (
              dictionary.settings.actions.save
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}