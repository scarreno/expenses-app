import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import type { Dictionary, SupportedLocale } from "./types";

const dictionaries: Record<SupportedLocale, Dictionary> = {
  en,
  es,
};

export function getDictionary(locale?: string): Dictionary {
  if (locale === "es") {
    return dictionaries.es;
  }

  return dictionaries.en;
}