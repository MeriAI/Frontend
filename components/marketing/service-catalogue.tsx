"use client";

import {
  Baby,
  BadgeCheck,
  Briefcase,
  Car,
  GraduationCap,
  House,
  IdCard,
  ReceiptText,
} from "lucide-react";

import { ServiceCard } from "@/components/marketing/service-card";
import { marketingTokens } from "@/components/marketing/theme";
import type { Translation } from "@/features/i18n/translations";
import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";

type ServiceId = keyof Translation["catalogue"]["entries"];

const SERVICE_DEFINITIONS: {
  id: ServiceId;
  icon: typeof BadgeCheck;
  available?: boolean;
}[] = [
  { id: "passport", icon: BadgeCheck, available: true },
  { id: "nationalId", icon: IdCard },
  { id: "civil", icon: Baby },
  { id: "driving", icon: Car },
  { id: "business", icon: Briefcase },
  { id: "tax", icon: ReceiptText },
  { id: "land", icon: House },
  { id: "education", icon: GraduationCap },
];

const availableCount = SERVICE_DEFINITIONS.filter(
  (service) => service.available,
).length;

export function ServiceCatalogue() {
  const { theme, contrast } = useSettings();
  const tokens = marketingTokens(theme, contrast);
  const t = useTranslations();

  return (
    <section id="services" aria-labelledby="catalogue-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="catalogue-heading"
              className={`text-2xl font-semibold ${tokens.heading}`}
            >
              {t.catalogue.heading}
            </h2>
            <p className={`mt-1 text-sm ${tokens.muted}`}>
              {t.catalogue.summary(
                availableCount,
                SERVICE_DEFINITIONS.length - availableCount,
              )}
            </p>
          </div>
          <p className={`text-xs ${tokens.muted}`}>{t.catalogue.reviewNote}</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SERVICE_DEFINITIONS.map(({ id, icon, available }) => (
            <ServiceCard
              key={id}
              icon={icon}
              available={available}
              tokens={tokens}
              copy={t.catalogue}
              entry={t.catalogue.entries[id]}
            />
          ))}
        </div>

        <aside
          className={`mt-10 rounded-2xl p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6 ${tokens.cardBorderWidth} ${tokens.border} ${tokens.sectionAlt}`}
        >
          <div>
            <p className={`font-semibold ${tokens.heading}`}>{t.catalogue.noticeTitle}</p>
            <p className={`mt-1 max-w-3xl text-sm leading-6 ${tokens.muted}`}>
              {t.catalogue.noticeBody}
            </p>
          </div>
          <BadgeCheck
            aria-hidden="true"
            size={34}
            className={`mt-4 shrink-0 sm:mt-0 ${tokens.body}`}
          />
        </aside>
      </div>
    </section>
  );
}
