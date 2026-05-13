import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows } from "../../styles/globalStyles";
import { VirtualTryOnItem } from "../../types/VirtualTryOn";
import PressableFade from "../common/PressableFade";
import SelectionCheckbox from "../common/SelectionCheckbox";

type Props = {
  items: VirtualTryOnItem[];
  onItemPress: (item: VirtualTryOnItem) => void;
  onItemLongPress?: (item: VirtualTryOnItem) => void;
  isSelectionMode?: boolean;
  selectedItems?: Set<string>;
};

const RecentlyTriedSection = ({ items, onItemPress, onItemLongPress, isSelectionMode, selectedItems }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recently Tried</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {items.map((item) => (
          <PressableFade
            key={item.id}
            style={styles.itemContainer}
            onPress={() => onItemPress(item)}
            onLongPress={() => onItemLongPress?.(item)}
          >
            <View
              style={[
                styles.imageWrapper,
                isSelectionMode && selectedItems?.has(item.id) && styles.imageWrapperSelected,
              ]}
            >
              <Image source={{ uri: item.resultImageUri }} style={styles.image} resizeMode="cover" />
              <View style={styles.tryOnTypeTag}>
                <MaterialIcons
                  name={item.tryOnType === "discover" ? "photo-library" : "checkroom"}
                  size={10}
                  color={colors.text_inverse}
                />
                <Text style={styles.tryOnTypeText}>
                  {item.tryOnType === "discover" ? "Discover" : "Closet"}
                </Text>
              </View>
              {isSelectionMode && (
                <SelectionCheckbox isSelected={!!selectedItems?.has(item.id)} />
              )}
            </View>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </PressableFade>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
  },
  itemContainer: {
    marginRight: spacing.md,
    width: 140,
  },
  imageWrapper: {
    width: 140,
    height: 190,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface_tertiary,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.transparent,
    ...shadows.subtle,
  },
  imageWrapperSelected: {
    borderColor: colors.primary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tryOnTypeTag: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary_87,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tryOnTypeText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.text_inverse,
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.text_tertiary,
    textAlign: "center",
  },
});

export default RecentlyTriedSection;
