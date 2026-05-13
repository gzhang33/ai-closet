import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import { MaterialIcons } from "@expo/vector-icons";

const languages = [
  { code: "en" as const, label: "English" },
  { code: "zh" as const, label: "中文" },
];

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("profile.title")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.language")}</Text>
        {languages.map((lang) => (
          <Pressable
            key={lang.code}
            style={[styles.languageRow, language === lang.code && styles.languageRowActive]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={[styles.languageLabel, language === lang.code && styles.languageLabelActive]}>
              {lang.label}
            </Text>
            {language === lang.code && (
              <MaterialIcons name="check" size={20} color={colors.primary_yellow} />
            )}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text_primary,
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.medium,
    color: colors.text_gray,
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.thumbnail_background,
  },
  languageRowActive: {
    backgroundColor: colors.light_yellow,
  },
  languageLabel: {
    fontSize: 16,
    fontFamily: typography.regular,
    color: colors.text_gray,
  },
  languageLabelActive: {
    fontFamily: typography.medium,
    color: colors.text_primary,
  },
});

export default ProfileScreen;
