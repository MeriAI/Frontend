"use client";

import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

import { ServiceCatalogue } from "@/components/marketing/service-catalogue";
import { SettingsControls } from "@/components/marketing/settings-controls";
import { marketingTokens } from "@/components/marketing/theme";
import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";

export default function ServicesPage() {
  const { theme, contrast } = useSettings();
  const tokens = marketingTokens(theme, contrast);
  const t = useTranslations();

  return (
    <div className={`min-h-screen ${tokens.page}`}>
      <main>
        <section className={`border-b ${tokens.divider} ${tokens.sectionAlt}`}>
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66C8C1] ${tokens.body}`}
              >
                <ArrowLeft aria-hidden="true" size={16} />
                {t.services.back}
              </Link>
              <SettingsControls />
            </div>

            <div className="text-center">
              <p
                className={`mt-10 text-sm font-semibold uppercase tracking-[0.14em] ${tokens.muted}`}
              >
                {t.services.eyebrow}
              </p>
              <h1
                className={`mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl ${tokens.heading}`}
              >
                {t.services.title}
              </h1>
              <p className={`mx-auto mt-4 max-w-2xl text-base leading-7 ${tokens.muted}`}>
                {t.services.lede}
              </p>

              <div
                className={`mx-auto mt-8 flex min-h-14 max-w-2xl items-center gap-3 rounded-2xl px-5 text-left shadow-[0_10px_30px_rgba(15,48,47,0.06)] ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surface}`}
              >
                <Search aria-hidden="true" size={20} className={`shrink-0 ${tokens.muted}`} />
                <span className={`text-sm sm:text-base ${tokens.muted}`}>
                  {t.services.searchHint}
                </span>
              </div>
            </div>
          </div>
        </section>

        <ServiceCatalogue />
      </main>
    </div>
  );
}
