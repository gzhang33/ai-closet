import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

type Props = {
  options: string[];
  selectedValues: string[];
  onValueChange: (selected: string[]) => void;
  disabled?: boolean;
};

const MultiSelectToggle = ({ options, selectedValues, onValueChange, disabled = false }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const toggleValue = (value: string) => {
    if (disabled) return;

    let updatedValues = [...selectedValues];
    if (updatedValues.includes(value)) {
      updatedValues = updatedValues.filter((v) => v !== value);
    } else {
      updatedValues.push(value);
    }
    onValueChange(updatedValues);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <PressableFade
            key={option}
            style={[
              styles.button,
              isSelected && styles.buttonSelected,
              disabled && (isSelected ? styles.buttonSelectedDisabled : styles.buttonDisabled),
            ]}
            onPress={() => toggleValue(option)}
            disabled={disabled}
          >
            <View style={styles.buttonContent}>
              {isSelected && (
                <MaterialIcons
                  name="check"
                  size={14}
                  color={disabled ? colors.text_tertiary : colors.text_inverse}
                  style={styles.checkIcon}
                />
              )}
              <Text
                style={[
                  styles.buttonText,
                  isSelected && styles.buttonTextSelected,
                  disabled && (isSelected ? styles.buttonTextSelectedDisabled : styles.buttonTextDisabled),
                ]}
              >
                {option}
              </Text>
            </View>
          </PressableFade>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border_medium,
    backgroundColor: colors.surface_card,
  },
  buttonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    borderColor: colors.border_light,
    opacity: 0.5,
  },
  buttonSelectedDisabled: {
    backgroundColor: colors.text_tertiary,
    borderColor: colors.text_tertiary,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_secondary,
    letterSpacing: 0.2,
  },
  buttonTextSelected: {
    color: colors.text_inverse,
  },
  buttonTextDisabled: {
    color: colors.text_tertiary,
  },
  buttonTextSelectedDisabled: {
    color: colors.text_inverse,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
});

export default MultiSelectToggle;
