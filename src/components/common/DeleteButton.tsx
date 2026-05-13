import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows, layout } from "../../styles/globalStyles";

type Props = {
  onDelete: () => void;
  selectedCount: number;
};

const DeleteButton = ({ onDelete, selectedCount }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onDelete}>
        <MaterialIcons name="delete-outline" size={20} color={colors.text_inverse} />
        <Text style={styles.text}>
          Delete {selectedCount} item{selectedCount > 1 ? "s" : ""}
        </Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  container: {
    position: "absolute",
    bottom: layout.tabBarHeight,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.subtle,
  },
  text: {
    color: colors.text_inverse,
    fontSize: 15,
    fontFamily: typography.semiBold,
    letterSpacing: 0.3,
  },
});

export default DeleteButton;
