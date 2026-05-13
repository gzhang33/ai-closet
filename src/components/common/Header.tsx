import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { spacing, borderRadius } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

type Props = {
  onBack?: () => void;
  onDelete?: () => void;
};

const Header = ({ onBack, onDelete }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {onBack && (
        <PressableFade onPress={onBack} style={styles.iconButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.text_primary} />
        </PressableFade>
      )}
      <View style={styles.spacer} />
      {onDelete && (
        <PressableFade onPress={onDelete} style={styles.iconButton}>
          <MaterialIcons name="delete-outline" size={22} color={colors.error} />
        </PressableFade>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border_light,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface_secondary,
  },
  spacer: {
    flex: 1,
  },
});

export default Header;
