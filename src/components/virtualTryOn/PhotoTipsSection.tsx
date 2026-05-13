import React, { useState } from "react";
import { View, Text, StyleSheet, LayoutAnimation } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";

const tips = [
  "Ensure good lighting conditions",
  "Wear form-fitting clothes",
  "You should be the only person in the photo",
];

const PhotoTipsSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <PressableFade onPress={toggleExpand} style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="lightbulb-outline" size={18} color={colors.accent} />
          <Text style={styles.title}>Photo Tips</Text>
        </View>
        <MaterialIcons
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={22}
          color={colors.text_tertiary}
        />
      </PressableFade>

      {isExpanded && (
        <View style={styles.tipsContainer}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={16} color={colors.primary} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
    backgroundColor: colors.accent_subtle,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.accent_light,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_secondary,
    letterSpacing: 0.2,
  },
  tipsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.text_secondary,
    lineHeight: 20,
  },
});

export default PhotoTipsSection;
