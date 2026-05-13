import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";

interface FilterChipProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  count: number;
}

export type { FilterChipProps as ChipProps };

const FilterChip = ({ name, isSelected, onPress, count }: FilterChipProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable style={[styles.chip, isSelected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {name} ({count})
      </Text>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  chip: {
    height: 32,
    flexDirection: "row",
    backgroundColor: colors.surface_tertiary,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.medium,
    fontSize: 13,
    color: colors.text_secondary,
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: colors.text_inverse,
  },
});

export default FilterChip;
