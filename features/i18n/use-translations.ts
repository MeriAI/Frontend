"use client";

import { translations, type Translation } from "@/features/i18n/translations";
import { useSettings } from "@/features/settings/settings-provider";

export function useTranslations(): Translation {
  const { language } = useSettings();
  return translations[language];
}
