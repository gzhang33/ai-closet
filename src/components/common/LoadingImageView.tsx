import React from "react";
import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, borderRadius } from "../../styles/globalStyles";

type Props = {
  imageUri: string;
  processedImageUri?: string;
  isLoading?: boolean;
  loadingText?: string;
  style?: any;
};

const LoadingImageView = ({ imageUri, processedImageUri, isLoading = false, loadingText, style }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const displayImageUri = processedImageUri || imageUri;

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: displayImageUri }} style={styles.image} resizeMode={isLoading ? "cover" : "contain"} />

      {isLoading && (
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
          <BlurView intensity={50} tint="light" style={styles.blurContainer}>
            <View style={styles.loaderCircle}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
            {loadingText && (
              <Animated.Text entering={FadeIn.delay(300)} style={styles.loadingText}>
                {loadingText}
              </Animated.Text>
            )}
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surface_tertiary,
    overflow: "hidden",
    borderRadius: borderRadius.xl,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface_card_80,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_secondary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default LoadingImageView;
