import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";

type Props = {
  title: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  selectedImageUri?: string;
};

const ContentSelectionBox = ({ title, iconName, onPress, selectedImageUri }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <PressableFade onPress={onPress} style={styles.selectionArea}>
        {selectedImageUri ? (
          <Image source={{ uri: selectedImageUri }} style={styles.selectedImage} resizeMode="contain" />
        ) : (
          <>
            <View style={styles.iconCircle}>
              <MaterialIcons name={iconName} size={28} color={colors.primary} />
            </View>
            <Text style={styles.addButtonText}>Tap to select</Text>
          </>
        )}
      </PressableFade>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  selectionArea: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface_tertiary,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border_light,
    borderStyle: "dashed",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary_subtle,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: typography.medium,
    color: colors.text_tertiary,
    letterSpacing: 0.2,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
});

export default ContentSelectionBox;
