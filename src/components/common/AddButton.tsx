import React from "react";
import { StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { spacing, borderRadius, createShadows, layout } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

const AddButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  return (
    <PressableFade style={styles.button} onPress={onPress}>
      <MaterialIcons name="add" size={28} color={colors.text_inverse} />
    </PressableFade>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  button: {
    position: "absolute",
    bottom: layout.tabBarHeight + spacing.xxl + 4,
    right: spacing.xxl,
    backgroundColor: colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },
});

export default AddButton;
