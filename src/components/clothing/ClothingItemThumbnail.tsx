import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { ClothingItem } from "../../types/ClothingItem";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { borderRadius, createShadows } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";
import SelectionCheckbox from "../common/SelectionCheckbox";

type Props = {
  item: ClothingItem;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
};

const ClothingItemThumbnail = ({ item, onPress, onLongPress, isSelectable, isSelected }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  return (
    <PressableFade
      containerStyle={styles.container}
      style={styles.pressableContent}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        <Image
          source={{ uri: item.backgroundRemovedImageUri || item.imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
        {isSelectable && <SelectionCheckbox isSelected={!!isSelected} />}
      </View>
    </PressableFade>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  container: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 4,
  },
  pressableContent: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface_card,
    borderRadius: borderRadius.lg,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.transparent,
    ...shadows.subtle,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary_subtle,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ClothingItemThumbnail;
