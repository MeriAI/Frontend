import type { LucideIcon } from "lucide-react";
import { Bell, Building2, CheckCircle2, Clock3, MessageCircle } from "lucide-react";

import type { MarketingTokens } from "@/components/marketing/theme";
import type { Translation } from "@/features/i18n/translations";

type CatalogueCopy = Translation["catalogue"];

interface ServiceCardProps {
  entry: CatalogueCopy["entries"][keyof CatalogueCopy["entries"]];
  copy: CatalogueCopy;
  tokens: MarketingTokens;
  icon: LucideIcon;
  available?: boolean;
}

export function ServiceCard({
  entry,
  copy,
  tokens,
  icon: Icon,
  available = false,
}: ServiceCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl p-5 shadow-[0_12px_35px_rgba(15,48,47,0.06)] sm:p-6 ${
        tokens.cardBorderWidth
      } ${available ? tokens.accentBorder : tokens.border} ${tokens.surface}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-12 place-items-center rounded-xl ${tokens.iconTile}`}>
          <Icon aria-hidden="true" size={23} />
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            available
              ? tokens.solid
              : `${tokens.cardBorderWidth} ${tokens.border} ${tokens.surfaceSubtle} ${tokens.muted}`
          }`}
        >
          {available ? (
            <CheckCircle2 aria-hidden="true" size={13} />
          ) : (
            <Clock3 aria-hidden="true" size={13} />
          )}
          {available ? copy.availableBadge : copy.pendingBadge}
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h2
          className={`text-xl font-semibold leading-snug tracking-[-0.02em] ${tokens.heading}`}
        >
          {entry.title}
        </h2>
        <p className={`mt-2 text-sm leading-6 ${tokens.muted}`}>{entry.description}</p>
      </div>

      <div className={`mt-5 border-t pt-4 ${tokens.divider}`}>
        <p className={`flex items-start gap-2 text-xs leading-5 ${tokens.muted}`}>
          <Building2 aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          {copy.sourceLabel}: {entry.source}
        </p>
      </div>

      <p
        className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
          tokens.cardBorderWidth
        } ${
          available
            ? `${tokens.accentBorder} ${tokens.sectionAlt} ${tokens.body}`
            : `${tokens.border} ${tokens.surfaceSubtle} ${tokens.muted}`
        }`}
      >
        {available ? (
          <MessageCircle aria-hidden="true" size={16} />
        ) : (
          <Bell aria-hidden="true" size={16} />
        )}
        {available ? copy.availableFooter : copy.pendingFooter}
      </p>
    </article>
  );
}
