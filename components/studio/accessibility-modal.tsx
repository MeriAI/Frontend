"use client";

import {
  Check,
  Contrast as ContrastIcon,
  Languages,
  Moon,
  Settings2,
  Sun,
  Type,
  X,
} from "lucide-react";

import { useTranslations } from "@/features/i18n/use-translations";
import {
  type Contrast,
  type FontSize,
  type Language,
  type Theme,
} from "@/features/settings/settings-provider";

interface AccessibilityModalProps {
  language: Language;
  fontSize: FontSize;
  theme: Theme;
  contrast: Contrast;
  onLanguageChange: (value: Language) => void;
  onFontSizeChange: (value: FontSize) => void;
  onThemeChange: (value: Theme) => void;
  onContrastChange: (value: Contrast) => void;
  onReset: () => void;
  onClose: () => void;
}

export function AccessibilityModal({
  language,
  fontSize,
  theme,
  contrast,
  onLanguageChange,
  onFontSizeChange,
  onThemeChange,
  onContrastChange,
  onReset,
  onClose,
}: AccessibilityModalProps) {
  const t = useTranslations();
  const isDark = theme === "dark";
  const panelClass = isDark
    ? "bg-[#182726] border-[#334846]"
    : "bg-[#FAFAF7] border-[#D5DFDB]";
  const mutedClass = isDark ? "text-[#D5DFDB]" : "text-[#65736F]";
  const selectedClass = isDark
    ? "bg-[#66C8C1] text-[#101A1A] border-[#66C8C1] shadow-sm"
    : "bg-[#163F3D] text-[#F3F8F6] border-[#163F3D] shadow-sm";
  const inactiveClass = isDark
    ? "bg-[#101A1A] text-[#D5DFDB] border-[#334846] hover:border-[#66C8C1] hover:text-[#F3F8F6]"
    : "bg-[#FAFAF7] text-[#65736F] border-[#D5DFDB] hover:border-[#163F3D] hover:text-[#163F3D]";

  const fontSizeLabels: Record<FontSize, string> = {
    small: "S",
    normal: "M",
    large: "L",
    xlarge: "XL",
  };

  const contrastLabels: Record<Contrast, string> = {
    normal: t.accessibility.contrastNormal,
    high: t.accessibility.contrastHigh,
    max: t.accessibility.contrastMax,
  };

  return (
    <div className="fixed inset-0 bg-[#101A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-modal-title"
        className={`w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden flex flex-col border max-h-[92vh] ${
          isDark
            ? "bg-[#101A1A] border-[#334846] text-[#F3F8F6]"
            : "bg-[#FAFAF7] border-[#D5DFDB] text-[#163F3D]"
        } ${contrast === "max" ? "border-2" : ""}`}
      >
        <header
          className={`px-5 sm:px-6 py-5 border-b flex items-center justify-between gap-4 ${
            isDark
              ? "border-[#334846] bg-[#182726]"
              : "border-[#D5DFDB] bg-[#FAFAF7]"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isDark
                  ? "bg-[#66C8C1] text-[#101A1A]"
                  : "bg-[#163F3D] text-[#F3F8F6]"
              }`}
            >
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="accessibility-modal-title"
                className="text-lg font-semibold tracking-tight"
              >
{t.accessibility.title}
              </h2>
              <p className={`text-xs mt-0.5 ${mutedClass}`}>
{t.accessibility.subtitle}
              </p>
            </div>
          </div>
          <button
            id="close-accessibility-modal-btn"
            onClick={onClose}
            aria-label={t.accessibility.close}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
              isDark
                ? "hover:bg-[#334846] text-[#D5DFDB]"
                : "hover:bg-[#F0F4F2] text-[#65736F]"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div
          className={`p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar ${
            isDark ? "bg-[#101A1A]" : "bg-[#F0F4F2]"
          }`}
        >
          <div className={`p-4 rounded-2xl border space-y-3.5 ${panelClass}`}>
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? "bg-[#101A1A] text-[#66C8C1]"
                    : "bg-[#F0F4F2] text-[#163F3D]"
                }`}
              >
                <Languages className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">
                  {t.accessibility.language}
                </h3>
                <p className={`text-xs mt-0.5 ${mutedClass}`}>
                  {t.accessibility.languageHint}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                ["en", "English", "EN"],
                ["am", "አማርኛ", "AM"],
              ] as const).map(([value, label, code]) => {
                const selected = language === value;
                return (
                  <button
                    key={value}
                    id={value === "en" ? "lang-en-btn" : "lang-am-btn"}
                    onClick={() => onLanguageChange(value)}
                    aria-pressed={selected}
                    className={`px-3 py-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      selected ? selectedClass : inactiveClass
                    }`}
                  >
                    <span>{label}</span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      {selected && <Check className="w-3 h-3" />}
                      {code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-3.5 ${panelClass}`}>
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? "bg-[#101A1A] text-[#66C8C1]"
                    : "bg-[#F0F4F2] text-[#163F3D]"
                }`}
              >
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {t.accessibility.textSize}
                </h3>
                <p className={`text-xs mt-0.5 ${mutedClass}`}>
                  {t.accessibility.textSizeHint}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["small", "normal", "large", "xlarge"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  aria-pressed={fontSize === size}
                  title={size === "xlarge" ? "Extra large" : size}
                  className={`h-10 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    fontSize === size ? selectedClass : inactiveClass
                  }`}
                >
                  {fontSizeLabels[size]}
                </button>
              ))}
            </div>
            <div
              className={`p-4 rounded-xl border ${
                isDark
                  ? "bg-[#101A1A] border-[#334846]"
                  : "bg-[#F0F4F2] border-[#D5DFDB]"
              }`}
            >
              <span className={`text-[10px] font-mono uppercase tracking-wider ${mutedClass}`}>
                {t.accessibility.preview}
              </span>
              <p
                className={`font-medium mt-1.5 transition-all ${
                  fontSize === "small"
                    ? "text-xs"
                    : fontSize === "large"
                      ? "text-base"
                      : fontSize === "xlarge"
                        ? "text-lg"
                        : "text-sm"
                }`}
              >
                {t.accessibility.previewText}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-3.5 ${panelClass}`}>
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? "bg-[#101A1A] text-[#66C8C1]"
                    : "bg-[#F0F4F2] text-[#163F3D]"
                }`}
              >
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {t.accessibility.appearance}
                </h3>
                <p className={`text-xs mt-0.5 ${mutedClass}`}>
                  {t.accessibility.appearanceHint}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="theme-light-btn"
                onClick={() => onThemeChange("light")}
                aria-pressed={!isDark}
                className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isDark ? selectedClass : inactiveClass
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t.accessibility.light}</span>
              </button>
              <button
                id="theme-dark-btn"
                onClick={() => onThemeChange("dark")}
                aria-pressed={isDark}
                className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark ? selectedClass : inactiveClass
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t.accessibility.dark}</span>
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-3.5 ${panelClass}`}>
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? "bg-[#101A1A] text-[#66C8C1]"
                    : "bg-[#F0F4F2] text-[#163F3D]"
                }`}
              >
                <ContrastIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {t.accessibility.contrast}
                </h3>
                <p className={`text-xs mt-0.5 ${mutedClass}`}>
                  {t.accessibility.contrastHint}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "high", "max"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => onContrastChange(value)}
                  aria-pressed={contrast === value}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                    contrast === value ? selectedClass : inactiveClass
                  }`}
                >
                  {contrastLabels[value]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer
          className={`px-5 sm:px-6 py-4 border-t flex items-center justify-between gap-3 ${
            isDark
              ? "bg-[#182726] border-[#334846]"
              : "bg-[#FAFAF7] border-[#D5DFDB]"
          }`}
        >
          <button
            onClick={onReset}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? "text-[#D5DFDB] hover:bg-[#334846] hover:text-[#F3F8F6]"
                : "text-[#65736F] hover:bg-[#F0F4F2] hover:text-[#163F3D]"
            }`}
          >
            {t.accessibility.reset}
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? "bg-[#66C8C1] text-[#101A1A] hover:bg-[#F0F4F2]"
                : "bg-[#163F3D] text-[#F3F8F6] hover:bg-[#0F302F]"
            }`}
          >
            {t.accessibility.done}
          </button>
        </footer>
      </section>
    </div>
  );
}
