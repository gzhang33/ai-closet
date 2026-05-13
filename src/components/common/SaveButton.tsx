import React from "react";
import { Text, StyleSheet } from "react-native";
import PressableFade from "./PressableFade";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows } from "../../styles/globalStyles";

interface SaveButtonProps {
  onPress: () => void;
  label?: string;
}

const SaveButton = ({ onPress, label = "Save Changes" }: SaveButtonProps) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  return (
    <PressableFade containerStyle={styles.container} style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </PressableFade>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  container: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.small,
  },
  text: {
    fontSize: 16,
    fontFamily: typography.semiBold,
    color: colors.text_inverse,
    letterSpacing: 0.5,
  },
});

export default SaveButton;
