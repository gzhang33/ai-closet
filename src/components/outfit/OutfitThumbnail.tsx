import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
import { Outfit } from "../../types/Outfit";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { borderRadius, createShadows } from "../../styles/globalStyles";
import PressableFade from "../common/PressableFade";
import SelectionCheckbox from "../common/SelectionCheckbox";

type Props = {
  outfit: Outfit;
  width: number;
  height: number;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  style?: ViewStyle;
};

const OutfitThumbnail = ({ outfit, width, height, onPress, onLongPress, isSelectable, isSelected, style }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  return (
    <PressableFade style={[style]} onPress={onPress} onLongPress={onLongPress}>
      <View style={[styles.card, { width, height }, isSelected && styles.cardSelected]}>
        <Image source={{ uri: outfit.imageUri }} style={styles.image} resizeMode="cover" />
        {isSelectable && <SelectionCheckbox isSelected={!!isSelected} />}
      </View>
    </PressableFade>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface_tertiary,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.transparent,
    ...shadows.subtle,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default OutfitThumbnail;
