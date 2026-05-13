import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { withAlpha } from "../styles/colors";

export type ThemeName = "rose" | "classic";

const THEME_STORAGE_KEY = "@theme_name";

export interface ThemeColors {
  primary: string;
  primary_light: string;
  primary_dark: string;
  primary_subtle: string;

  accent: string;
  accent_light: string;
  accent_subtle: string;

  text_primary: string;
  text_secondary: string;
  text_tertiary: string;
  text_inverse: string;

  surface_primary: string;
  surface_secondary: string;
  surface_tertiary: string;
  surface_card: string;

  border_light: string;
  border_medium: string;
  border_strong: string;

  error: string;
  error_light: string;
  success: string;
  success_light: string;

  overlay_light: string;
  overlay_medium: string;
  overlay_heavy: string;

  shadow_color: string;

  surface_card_80: string;
  surface_card_67: string;
  text_inverse_73: string;
  primary_87: string;
  primary_dark_27: string;

  transparent: string;
}

const roseTheme: ThemeColors = {
  primary: "#E8A0BF",
  primary_light: "#F5D5E5",
  primary_dark: "#C77DA0",
  primary_subtle: "#FDF2F8",

  accent: "#D4A574",
  accent_light: "#E8CDB5",
  accent_subtle: "#FBF5EF",

  text_primary: "#2D2D3A",
  text_secondary: "#6B6B7B",
  text_tertiary: "#9D9DAF",
  text_inverse: "#FFFFFF",

  surface_primary: "#FEFCFD",
  surface_secondary: "#FAF7F9",
  surface_tertiary: "#F5F0F3",
  surface_card: "#FFFFFF",

  border_light: "#F0EBEE",
  border_medium: "#E0D8DD",
  border_strong: "#C8BFC6",

  error: "#E85D75",
  error_light: "#FDE8EC",
  success: "#6BCB9B",
  success_light: "#E5F8EF",

  overlay_light: "rgba(45, 45, 58, 0.04)",
  overlay_medium: "rgba(45, 45, 58, 0.12)",
  overlay_heavy: "rgba(45, 45, 58, 0.40)",

  shadow_color: "rgba(45, 45, 58, 0.08)",

  surface_card_80: withAlpha("#FFFFFF", 0.8),
  surface_card_67: withAlpha("#FFFFFF", 0.67),
  text_inverse_73: withAlpha("#FFFFFF", 0.73),
  primary_87: withAlpha("#E8A0BF", 0.87),
  primary_dark_27: withAlpha("#C77DA0", 0.27),

  transparent: "transparent",
};

const classicTheme: ThemeColors = {
  primary: "#F4C753",
  primary_light: "#FFE9B1",
  primary_dark: "#D4A83A",
  primary_subtle: "#FFF8E7",

  accent: "#FF6B4A",
  accent_light: "#FFB8A8",
  accent_subtle: "#FFF0EC",

  text_primary: "#1E1E1E",
  text_secondary: "#625845",
  text_tertiary: "#A39E9E",
  text_inverse: "#FFFFFF",

  surface_primary: "#FCFAF7",
  surface_secondary: "#F8F5F0",
  surface_tertiary: "#F2F0E8",
  surface_card: "#FFFFFF",

  border_light: "#E8E4DE",
  border_medium: "#D3D3D3",
  border_strong: "#B8B0A4",

  error: "#FF2000",
  error_light: "#FFE8E4",
  success: "#4CAF50",
  success_light: "#E8F5E9",

  overlay_light: "rgba(30, 30, 30, 0.04)",
  overlay_medium: "rgba(30, 30, 30, 0.12)",
  overlay_heavy: "rgba(30, 30, 30, 0.40)",

  shadow_color: "rgba(30, 30, 30, 0.08)",

  surface_card_80: withAlpha("#FFFFFF", 0.8),
  surface_card_67: withAlpha("#FFFFFF", 0.67),
  text_inverse_73: withAlpha("#FFFFFF", 0.73),
  primary_87: withAlpha("#F4C753", 0.87),
  primary_dark_27: withAlpha("#D4A83A", 0.27),

  transparent: "transparent",
};

export const themes: Record<ThemeName, ThemeColors> = {
  rose: roseTheme,
  classic: classicTheme,
};

const themeKeys = Object.keys(themes) as ThemeName[];

interface ThemeContextType {
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("rose");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === "rose" || stored === "classic") {
          setThemeName(stored);
        }
      })
      .catch((err) => console.warn("Failed to load theme preference:", err));
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch((err) =>
      console.warn("Failed to persist theme preference:", err)
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeName((prev) => {
      const idx = themeKeys.indexOf(prev);
      const next = themeKeys[(idx + 1) % themeKeys.length];
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch((err) =>
        console.warn("Failed to persist theme preference:", err)
      );
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ themeName, colors: themes[themeName], setTheme, toggleTheme }),
    [themeName, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
