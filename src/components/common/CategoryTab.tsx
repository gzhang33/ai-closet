import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";
import type { ChipProps } from "./FilterChip";

const CategoryTab = ({ name, isSelected, onPress, count }: ChipProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
      onPress={onPress}
    >
      <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>
        {name}
      </Text>
      <View style={[styles.categoryCountBadge, isSelected && styles.categoryCountBadgeSelected]}>
        <Text style={[styles.categoryCount, isSelected && styles.categoryCountSelected]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface_tertiary,
    gap: spacing.xs,
  },
  categoryTabSelected: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontFamily: typography.medium,
    fontSize: 13,
    color: colors.text_secondary,
    letterSpacing: 0.2,
  },
  categoryTabTextSelected: {
    color: colors.text_inverse,
  },
  categoryCountBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border_light,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  categoryCountBadgeSelected: {
    backgroundColor: colors.primary_dark_27,
  },
  categoryCount: {
    fontFamily: typography.medium,
    fontSize: 11,
    color: colors.text_tertiary,
  },
  categoryCountSelected: {
    color: colors.text_inverse,
  },
});

export default CategoryTab;
