import { en } from "@/app/lib/i18n/dictionaries/en";
import { es } from "@/app/lib/i18n/dictionaries/es";
import type { Dictionary, SupportedLanguage } from "@/app/types/dictionary";

const dictionaries: Record<SupportedLanguage, Dictionary> = {
  en,
  es,
};

export function getDictionary(language?: string): Dictionary {
  if (language === "es") {
    return dictionaries.es;
  }

  return dictionaries.en;
}