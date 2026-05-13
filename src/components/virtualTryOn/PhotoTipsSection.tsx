import React, { useState } from "react";
import { View, Text, StyleSheet, LayoutAnimation } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";

const PhotoTipsSection = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const tips = [
    t("tryOn.tips.tip1"),
    t("tryOn.tips.tip2"),
    t("tryOn.tips.tip3"),
  ];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <PressableFade onPress={toggleExpand} style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="info" size={20} color={colors.text_gray} />
          <Text style={styles.title}>{t("tryOn.tips.title")}</Text>
        </View>
        <MaterialIcons
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={colors.text_gray}
        />
      </PressableFade>

      {isExpanded && (
        <View style={styles.tipsContainer}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={16} color={colors.primary_yellow} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.thumbnail_background,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_gray,
  },
  tipsContainer: {
    padding: 12,
    paddingTop: 0,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  tipText: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.text_gray,
  },
});

export default PhotoTipsSection;
