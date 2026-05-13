import React, { useContext, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { OutfitContext } from "../../contexts/OutfitContext";
import OutfitThumbnail from "../outfit/OutfitThumbnail";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing } from "../../styles/globalStyles";

type Props = {
  clothingItemId: string;
  onOutfitPress: (outfitId: string) => void;
};

const RelevantOutfits = ({ clothingItemId, onOutfitPress }: Props) => {
  const outfitContext = useContext(OutfitContext);
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const thumbnailWidth = (width - 32 - 16) / 2.5;
  const thumbnailHeight = (thumbnailWidth * 4) / 3;

  const relevantOutfits = useMemo(() => {
    if (!outfitContext) return [];
    return outfitContext.outfits.filter((outfit) => outfit.clothingItems.some((item) => item.id === clothingItemId));
  }, [outfitContext, clothingItemId]);

  if (relevantOutfits.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Styled With</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {relevantOutfits.map((outfit) => (
          <View key={outfit.id} style={styles.thumbnailContainer}>
            <OutfitThumbnail
              outfit={outfit}
              width={thumbnailWidth}
              height={thumbnailHeight}
              onPress={() => onOutfitPress(outfit.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  thumbnailContainer: {
    marginRight: spacing.sm,
  },
});

export default RelevantOutfits;
