import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { layout, spacing } from "../../styles/globalStyles";

interface SelectionCheckboxProps {
  isSelected: boolean;
  style?: ViewStyle;
}

const SelectionCheckbox = ({ isSelected, style }: SelectionCheckboxProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <MaterialIcons name="check" size={14} color={colors.text_inverse} />}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  checkbox: {
    width: layout.checkboxSize,
    height: layout.checkboxSize,
    borderRadius: layout.checkboxSize / 2,
    backgroundColor: colors.surface_card,
    borderWidth: 2,
    borderColor: colors.border_medium,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default SelectionCheckbox;
