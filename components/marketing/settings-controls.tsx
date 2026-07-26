"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

import { AccessibilityModal } from "@/components/studio/accessibility-modal";
import { marketingTokens } from "@/components/marketing/theme";
import { useTranslations } from "@/features/i18n/use-translations";
import { useSettings } from "@/features/settings/settings-provider";

export function SettingsControls() {
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    contrast,
    setContrast,
    resetAccessibility,
  } = useSettings();
  const t = useTranslations();
  const tokens = marketingTokens(theme, contrast);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        id="marketing-accessibility-btn"
        onClick={() => setIsAccessibilityOpen(true)}
        title={t.marketing.controls.accessibility}
        aria-label={t.marketing.controls.accessibility}
        className={`grid size-9 place-items-center rounded-full transition-colors ${tokens.cardBorderWidth} ${tokens.border} ${tokens.surface} ${tokens.surfaceHover} ${tokens.body} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66C8C1]`}
      >
        <Settings2 aria-hidden="true" className="size-4" />
      </button>

      {isAccessibilityOpen && (
        <AccessibilityModal
          language={language}
          fontSize={fontSize}
          theme={theme}
          contrast={contrast}
          onLanguageChange={setLanguage}
          onFontSizeChange={setFontSize}
          onThemeChange={setTheme}
          onContrastChange={setContrast}
          onReset={resetAccessibility}
          onClose={() => setIsAccessibilityOpen(false)}
        />
      )}
    </>
  );
}
