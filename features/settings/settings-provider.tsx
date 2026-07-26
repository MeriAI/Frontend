"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  loadAccessibilitySettings,
  loadAccountSettings,
  saveAccessibilitySettings,
  saveAccountSettings,
} from "@/lib/storage/studio-storage";
import type {
  AccessibilitySettings,
  AccountSettings,
  Contrast,
  FontSize,
  Language,
  Theme,
} from "@/types/studio";

export type {
  AccountSettings,
  Contrast,
  FontSize,
  Language,
  Theme,
} from "@/types/studio";

const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  userName: "",
  userEmail: "",
  userOrg: "",
  voiceModel: "MeriAI managed voice",
  audioQuality: "Server managed",
};

const ROOT_FONT_SIZES: Record<FontSize, string> = {
  small: "14px",
  normal: "16px",
  large: "18px",
  xlarge: "20px",
};

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  language: "en",
  fontSize: "normal",
  theme: "light",
  contrast: "normal",
};

interface SettingsContextValue {
  accountSettings: AccountSettings;
  setAccountSettings: Dispatch<SetStateAction<AccountSettings>>;
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  fontSize: FontSize;
  setFontSize: Dispatch<SetStateAction<FontSize>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  contrast: Contrast;
  setContrast: Dispatch<SetStateAction<Contrast>>;
  isMuted: boolean;
  setIsMuted: Dispatch<SetStateAction<boolean>>;
  voiceSpeed: number;
  setVoiceSpeed: Dispatch<SetStateAction<number>>;
  resetAccessibility: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accountSettings, setAccountSettings] = useState(
    DEFAULT_ACCOUNT_SETTINGS,
  );
  const [accessibility, setAccessibility] = useState(
    DEFAULT_ACCESSIBILITY_SETTINGS,
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);

  useEffect(() => {
    const savedAccount = loadAccountSettings();
    if (savedAccount) setAccountSettings(savedAccount);
    const savedAccessibility = loadAccessibilitySettings();
    if (savedAccessibility) setAccessibility(savedAccessibility);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) saveAccountSettings(accountSettings);
  }, [accountSettings, hasHydrated]);

  useEffect(() => {
    if (hasHydrated) saveAccessibilitySettings(accessibility);
  }, [accessibility, hasHydrated]);

  useEffect(() => {
    document.documentElement.lang = accessibility.language;
  }, [accessibility.language]);

  // Tailwind sizes are rem based, so scaling the root scales every page.
  useEffect(() => {
    document.documentElement.style.fontSize =
      ROOT_FONT_SIZES[accessibility.fontSize];
  }, [accessibility.fontSize]);

  const value = useMemo<SettingsContextValue>(() => {
    const updateAccessibility =
      <Key extends keyof AccessibilitySettings>(key: Key) =>
      (update: SetStateAction<AccessibilitySettings[Key]>) => {
        setAccessibility((current) => ({
          ...current,
          [key]:
            typeof update === "function"
              ? (update as (value: AccessibilitySettings[Key]) => AccessibilitySettings[Key])(
                  current[key],
                )
              : update,
        }));
      };

    return {
      accountSettings,
      setAccountSettings,
      language: accessibility.language,
      setLanguage: updateAccessibility("language"),
      fontSize: accessibility.fontSize,
      setFontSize: updateAccessibility("fontSize"),
      theme: accessibility.theme,
      setTheme: updateAccessibility("theme"),
      contrast: accessibility.contrast,
      setContrast: updateAccessibility("contrast"),
      isMuted,
      setIsMuted,
      voiceSpeed,
      setVoiceSpeed,
      resetAccessibility: () =>
        setAccessibility(DEFAULT_ACCESSIBILITY_SETTINGS),
    };
  }, [accessibility, accountSettings, isMuted, voiceSpeed]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) {
    throw new Error("useSettings must be used inside SettingsProvider.");
  }
  return value;
}
