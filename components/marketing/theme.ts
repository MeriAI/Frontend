import type { Contrast, Theme } from "@/types/studio";

export interface MarketingTokens {
  page: string;
  sectionAlt: string;
  surface: string;
  surfaceHover: string;
  surfaceSubtle: string;
  border: string;
  heading: string;
  body: string;
  muted: string;
  iconTile: string;
  solid: string;
  solidHover: string;
  outline: string;
  accentBorder: string;
  divider: string;
  cardBorderWidth: string;
}

export function marketingTokens(
  theme: Theme,
  contrast: Contrast = "normal",
): MarketingTokens {
  const isDark = theme === "dark";
  const strongText = contrast !== "normal";

  return {
    page: isDark
      ? "bg-[#101A1A] text-[#F3F8F6] selection:bg-[#66C8C1] selection:text-[#101A1A]"
      : "bg-[#FAFAF7] text-[#163F3D] selection:bg-[#66C8C1] selection:text-[#0F302F]",
    sectionAlt: isDark ? "bg-[#182726]" : "bg-[#F0F4F2]",
    surface: isDark ? "bg-[#182726]" : "bg-white",
    surfaceHover: isDark ? "hover:bg-[#101A1A]" : "hover:bg-[#F0F4F2]",
    surfaceSubtle: isDark ? "bg-[#101A1A]" : "bg-[#FAFAF7]",
    border: isDark ? "border-[#334846]" : "border-[#D5DFDB]",
    heading: isDark ? "text-[#F3F8F6]" : "text-[#0F302F]",
    body: isDark ? "text-[#F3F8F6]" : "text-[#163F3D]",
    muted: strongText
      ? isDark
        ? "text-[#F3F8F6]"
        : "text-[#163F3D]"
      : isDark
        ? "text-[#D5DFDB]"
        : "text-[#65736F]",
    iconTile: isDark
      ? "bg-[#101A1A] text-[#66C8C1]"
      : "bg-[#F0F4F2] text-[#163F3D]",
    solid: isDark
      ? "bg-[#66C8C1] text-[#101A1A]"
      : "bg-[#163F3D] text-[#F3F8F6]",
    solidHover: isDark ? "hover:bg-[#8FD8D3]" : "hover:bg-[#0F302F]",
    outline: isDark
      ? "border-[#66C8C1] text-[#66C8C1] hover:bg-[#182726]"
      : "border-[#163F3D] text-[#163F3D] hover:bg-[#F0F4F2]",
    accentBorder: "border-[#66C8C1]",
    divider: isDark ? "border-[#334846]" : "border-[#D5DFDB]",
    cardBorderWidth: contrast === "max" ? "border-2" : "border",
  };
}
