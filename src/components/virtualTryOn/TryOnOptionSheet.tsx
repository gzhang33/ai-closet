import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";

type TryOnOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isComingSoon?: boolean;
};

const tryOnOptions: TryOnOption[] = [
  {
    id: "single",
    title: "Single Closet Item",
    description: "Try a single item from your closet",
    icon: "checkroom",
  },
  {
    id: "discover",
    title: "Discover & Try",
    description: "Try on items from photos or online stores",
    icon: "photo-library",
  },
  {
    id: "outfit",
    title: "Complete Outfits",
    description: "Try on your saved outfit with multiple pieces",
    icon: "style",
    isComingSoon: true,
  },
];

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (optionId: string) => void;
};

const TryOnOptionSheet = ({ isVisible, onClose, onSelect }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  if (!isVisible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Try-On Mode</Text>
          <PressableFade onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={20} color={colors.text_secondary} />
          </PressableFade>
        </View>

        <View style={styles.optionsList}>
          {tryOnOptions.map((option) => (
            <PressableFade
              key={option.id}
              style={[styles.optionItem, option.isComingSoon && styles.optionItemDisabled]}
              onPress={() => !option.isComingSoon && onSelect(option.id)}
              disabled={option.isComingSoon}
            >
              <View style={styles.optionIcon}>
                <MaterialIcons name={option.icon} size={22} color={option.isComingSoon ? colors.text_tertiary : colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, option.isComingSoon && styles.optionTitleDisabled]}>{option.title}</Text>
                  {option.isComingSoon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </PressableFade>
          ))}
        </View>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay_heavy,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface_primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: "50%",
    ...shadows.large,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.semiBold,
    fontSize: 20,
    color: colors.text_primary,
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface_tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    gap: spacing.md,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface_card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border_light,
  },
  optionItemDisabled: {
    opacity: 0.6,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary_subtle,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  optionTitle: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.text_primary,
    letterSpacing: 0.2,
  },
  optionTitleDisabled: {
    color: colors.text_tertiary,
  },
  optionDescription: {
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.text_tertiary,
    lineHeight: 18,
  },
  comingSoonBadge: {
    backgroundColor: colors.accent_subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  comingSoonText: {
    fontFamily: typography.medium,
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 0.3,
  },
});

export default TryOnOptionSheet;
