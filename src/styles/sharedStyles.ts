import { StyleSheet } from "react-native";
import type { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius, layout } from "./globalStyles";

export const createSharedStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface_primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: typography.regular,
    fontSize: 15,
    color: colors.text_tertiary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: typography.display,
    color: colors.text_primary,
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface_secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  gridContentWithDelete: {
    paddingBottom: layout.tabBarHeight + layout.deleteBarHeight,
  },
  notFoundText: {
    fontFamily: typography.regular,
    fontSize: 15,
    color: colors.text_tertiary,
    textAlign: "center",
    marginTop: 40,
  },
});
