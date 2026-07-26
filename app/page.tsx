"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  MessageCircle,
  Mic,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ServiceCatalogue } from "@/components/marketing/service-catalogue";
import { SettingsControls } from "@/components/marketing/settings-controls";
import { marketingTokens } from "@/components/marketing/theme";
import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";

export default function HomePage() {
  const { theme, contrast } = useSettings();
  const tokens = marketingTokens(theme, contrast);
  const t = useTranslations();

  return (
    <div className={`min-h-screen ${tokens.page}`}>
      <main>
        <section className={`relative isolate overflow-hidden border-b ${tokens.divider}`}>
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-40 -z-10 size-[34rem] rounded-full bg-[#66C8C1]/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-48 -left-48 -z-10 size-[32rem] rounded-full bg-[#66C8C1]/10 blur-3xl"
          />

          <div className="mx-auto flex max-w-7xl justify-end px-4 pt-5 sm:px-6 lg:px-8">
            <SettingsControls />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-sm sm:text-sm ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surface} ${tokens.body}`}
              >
                <Sparkles aria-hidden="true" size={16} />
                {t.marketing.badge}
              </div>

              <h1
                className={`mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[3.75rem] ${tokens.heading}`}
              >
                {t.marketing.titleLead}{" "}
                <span className={tokens.muted}>{t.marketing.titleTail}</span>
              </h1>
              <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${tokens.muted}`}>
                {t.marketing.lede}
              </p>

              <div className={`mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm ${tokens.muted}`}>
                {t.marketing.highlights.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className={`grid size-5 place-items-center rounded-full ${tokens.iconTile}`}>
                      <Check aria-hidden="true" size={13} strokeWidth={2.5} />
                    </span>
                    {item}
                  </span>
                ))}
              </div>

              <a
                href="#services"
                className={`mt-9 inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66C8C1] ${tokens.cardBorderWidth} ${tokens.outline} ${tokens.surface}`}
              >
                {t.marketing.catalogueLink}
                <ArrowDown aria-hidden="true" size={17} />
              </a>
            </div>

            <section aria-labelledby="assistant-heading" className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] bg-[#66C8C1]/20"
              />
              <div
                className={`rounded-[1.75rem] p-5 shadow-[0_24px_70px_rgba(15,48,47,0.13)] sm:p-7 ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surface}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tokens.solid}`}>
                      <MessageCircle aria-hidden="true" size={21} />
                    </span>
                    <div>
                      <h2
                        id="assistant-heading"
                        className={`text-base font-semibold tracking-[-0.01em] ${tokens.heading}`}
                      >
                        {t.marketing.assistant.heading}
                      </h2>
                      <p className={`mt-0.5 text-xs ${tokens.muted}`}>
                        {t.marketing.assistant.subtitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tokens.cardBorderWidth} ${tokens.border} ${tokens.sectionAlt} ${tokens.body}`}
                  >
                    <span aria-hidden="true" className="size-2 rounded-full bg-[#66C8C1]" />
                    {t.marketing.assistant.status}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <p
                    className={`max-w-[92%] rounded-2xl rounded-bl-md border-l-4 border-l-[#66C8C1] p-4 text-sm leading-6 ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surfaceSubtle} ${tokens.body}`}
                  >
                    {t.marketing.assistant.previewAssistant}
                  </p>
                  <p
                    className={`ml-auto max-w-[82%] rounded-2xl rounded-br-md p-4 text-sm leading-6 ${tokens.solid}`}
                  >
                    {t.marketing.assistant.previewUser}
                  </p>
                </div>

                <div className="mt-6">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${tokens.muted}`}>
                    {t.marketing.assistant.tryAsking}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {t.marketing.assistant.questions.map((question) => (
                      <li
                        key={question}
                        className={`rounded-full px-3 py-1.5 text-xs ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surfaceSubtle} ${tokens.muted}`}
                      >
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/studio?mode=chat"
                  aria-label={t.marketing.assistant.chatEntryLabel}
                  className={`mt-6 flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl py-3 pl-5 pr-3 text-sm transition-colors hover:border-[#66C8C1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66C8C1] ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surfaceSubtle} ${tokens.muted}`}
                >
                  {t.marketing.assistant.chatEntry}
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${tokens.solid}`}>
                    <ArrowRight aria-hidden="true" size={18} />
                  </span>
                </Link>

                <Link
                  href="/studio?mode=voice"
                  className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66C8C1] ${tokens.cardBorderWidth} ${tokens.outline}`}
                >
                  <Mic aria-hidden="true" size={17} />
                  {t.marketing.assistant.voiceEntry}
                </Link>

                <p
                  className={`mt-5 flex items-start gap-2 border-t pt-5 text-xs leading-5 ${tokens.divider} ${tokens.muted}`}
                >
                  <ShieldCheck aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                  {t.marketing.assistant.disclaimer}
                </p>
              </div>
            </section>
          </div>
        </section>

        <ServiceCatalogue />
      </main>
    </div>
  );
}
