import React from "react";
import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  imageUri: string;
  processedImageUri?: string;
  isLoading?: boolean;
  loadingText?: string;
  style?: any;
};

const LoadingImageView = ({ imageUri, processedImageUri, isLoading = false, loadingText, style }: Props) => {
  const displayImageUri = processedImageUri || imageUri;

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: displayImageUri }} style={styles.image} resizeMode="contain" />

      {isLoading && (
        <Animated.View entering={FadeIn} style={styles.processingOverlay}>
          <ActivityIndicator size="small" color={colors.primary_yellow} />
          {loadingText && (
            <Animated.Text entering={FadeIn.delay(300)} style={styles.loadingText}>
              {loadingText}
            </Animated.Text>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.thumbnail_background,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  processingOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: typography.medium,
    color: "#fff",
  },
});

export default LoadingImageView;
