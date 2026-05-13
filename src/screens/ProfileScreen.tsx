import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, ThemeName, themes } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../styles/globalStyles";
import ScreenHeader from "../components/common/ScreenHeader";
import PressableFade from "../components/common/PressableFade";

const themeOptions: { name: ThemeName; label: string; description: string }[] = [
  { name: "rose", label: "Rose", description: "Soft pink & warm gold" },
  { name: "classic", label: "Classic", description: "Warm yellow & neutral" },
];

const ProfileScreen = () => {
  const { themeName, colors, setTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface_primary }]} edges={["top", "left", "right"]}>
      <ScreenHeader title="Profile" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface_card, borderColor: colors.border_light }]}>
          <Text style={[styles.sectionTitle, { color: colors.text_primary }]}>Appearance</Text>

          {themeOptions.map((option) => {
            const isActive = themeName === option.name;
            return (
              <PressableFade
                key={option.name}
                style={[
                  styles.themeOption,
                  isActive && { backgroundColor: colors.primary_subtle },
                  !isActive && { backgroundColor: colors.surface_tertiary },
                  { borderColor: isActive ? colors.primary : colors.transparent },
                ]}
                onPress={() => setTheme(option.name)}
              >
                <View style={[styles.themeDot, { backgroundColor: themes[option.name].primary }]} />
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeLabel, { color: colors.text_primary }]}>{option.label}</Text>
                  <Text style={[styles.themeDescription, { color: colors.text_tertiary }]}>{option.description}</Text>
                </View>
                {isActive && (
                  <MaterialIcons name="check-circle" size={22} color={colors.primary} />
                )}
              </PressableFade>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  section: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.semiBold,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
  },
  themeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: spacing.md,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    letterSpacing: 0.1,
  },
  themeDescription: {
    fontSize: 12,
    fontFamily: typography.regular,
    marginTop: 2,
  },
});

export default ProfileScreen;
