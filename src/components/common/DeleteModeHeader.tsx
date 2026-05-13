import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing } from "../../styles/globalStyles";

type Props = {
  selectedCount: number;
  onCancel: () => void;
};

const DeleteModeHeader = ({ selectedCount, onCancel }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <Text style={styles.selectedText}>{selectedCount} selected</Text>
      <Pressable onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  selectedText: {
    fontSize: 22,
    fontFamily: typography.display,
    color: colors.text_primary,
    letterSpacing: -0.5,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: typography.medium,
    color: colors.primary,
    letterSpacing: 0.2,
  },
});

export default DeleteModeHeader;
