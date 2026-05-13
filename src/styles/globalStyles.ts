import { Platform, StyleSheet } from "react-native";
import type { ThemeColors } from "../contexts/ThemeContext";

export const typography = {
  // Display - Playfair Display (serif, for headlines)
  display: "PlayfairDisplay-Bold",
  displayItalic: "PlayfairDisplay-Italic",

  // Body - Outfit (sans-serif, clean geometric)
  regular: "Outfit-Regular",
  medium: "Outfit-Medium",
  semiBold: "Outfit-SemiBold",
  bold: "Outfit-Bold",
  light: "Outfit-Light",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export const fontSizes = {
  caption: 10,
  small: 11,
  tag: 12,
  bodySmall: 13,
  body: 14,
  bodyLarge: 15,
  subtitle: 16,
  titleSmall: 17,
  title: 18,
  titleLarge: 20,
  displaySmall: 22,
  display: 28,
} as const;

export const layout = {
  iconButtonSize: 40,
  deleteBarHeight: 80,
  addButtonSize: 56,
  checkboxSize: 22,
  tabBarHeight: Platform.OS === "ios" ? 88 : 64,
} as const;

export const createShadows = (colors: ThemeColors) => ({
  subtle: {
    shadowColor: colors.shadow_color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  small: {
    shadowColor: colors.shadow_color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: colors.shadow_color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  large: {
    shadowColor: colors.shadow_color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
});

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    fontSize: 24,
    fontFamily: typography.display,
    letterSpacing: -0.5,
  },
  bodyText: {
    fontFamily: typography.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
