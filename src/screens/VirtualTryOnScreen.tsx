import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows, layout } from "../styles/globalStyles";
import PressableFade from "../components/common/PressableFade";
import ScreenHeader from "../components/common/ScreenHeader";
import TryOnOptionSheet from "../components/virtualTryOn/TryOnOptionSheet";
import ContentSelectionBox from "../components/virtualTryOn/ContentSelectionBox";
import PhotoTipsSection from "../components/virtualTryOn/PhotoTipsSection";
import TryOnProgress from "../components/virtualTryOn/TryOnProgress";
import RecentlyTriedSection from "../components/virtualTryOn/RecentlyTriedSection";
import { virtualTryOn } from "../services/VirtualTryOn";
import { VirtualTryOnContext } from "../contexts/VirtualTryOnContext";
import { VirtualTryOnItem } from "../types/VirtualTryOn";
import { TryOnStackScreenProps } from "../types/navigation";
import DeleteModeHeader from "../components/common/DeleteModeHeader";
import DeleteButton from "../components/common/DeleteButton";
import { useSelectionMode } from "../hooks/useSelectionMode";

type Props = TryOnStackScreenProps<"VirtualTryOn">;

const VirtualTryOnScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);
  const [isOptionSheetVisible, setOptionSheetVisible] = useState(false);
  const [selectedOutfitUri, setSelectedOutfitUri] = useState<string>();
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImageUri, setResultImageUri] = useState<string>();

  const {
    isSelectionMode,
    selectedItems,
    handleLongPress: selectionLongPress,
    handleItemPress: selectionItemPress,
    handleCancelSelection,
    handleDelete,
  } = useSelectionMode();

  const tryOnContext = useContext(VirtualTryOnContext);
  if (!tryOnContext) {
    return null;
  }
  const { recentTryOns, addTryOn, deleteHistoryItems } = tryOnContext;

  useEffect(() => {
    if (isProcessing) {
      const startTime = Date.now();

      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const percentage = Math.min((elapsed / 30000) * 95, 95);

        if (currentTime >= startTime + 30000) {
          clearInterval(intervalId);
        } else {
          setProgress(percentage);
        }
      }, 100);

      return () => clearInterval(intervalId);
    }
  }, [isProcessing]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [3, 4],
      quality: 1,
    });

    return !result.canceled ? result.assets[0].uri : null;
  };

  const handleOptionSelect = async (optionId: string) => {
    setOptionSheetVisible(false);

    setTimeout(async () => {
      try {
        if (optionId === "discover") {
          const uri = await pickImage();
          if (uri) {
            setSelectedOutfitUri(uri);
            setResultImageUri(undefined);
          }
        }
      } catch (error) {
        console.error("Error selecting option:", error);
        Alert.alert("Error", "Failed to open image picker. Please try again.");
      }
    }, 300);
  };

  const handlePhotoSelect = async () => {
    const uri = await pickImage();
    if (uri) {
      setSelectedPhotoUri(uri);
      setResultImageUri(undefined);
    }
  };

  const handleTryOn = useCallback(async () => {
    if (!selectedOutfitUri || !selectedPhotoUri) {
      Alert.alert("Missing Content", "Please select both an outfit and a photo to continue.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await virtualTryOn({
        outfitImageUri: selectedOutfitUri,
        userPhotoUri: selectedPhotoUri,
      });

      setResultImageUri(response.resultImageUri);
      setProgress(100);

      await addTryOn({
        tryOnType: "discover",
        newClothingImageUri: selectedOutfitUri,
        userPhotoUri: selectedPhotoUri,
        resultImageUri: response.resultImageUri,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to process virtual try-on. Please try again.");
      console.error("Virtual try-on error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedOutfitUri, selectedPhotoUri, addTryOn]);

  const handleLongPress = useCallback((item: VirtualTryOnItem) => {
    selectionLongPress(item.id);
  }, [selectionLongPress]);

  const handleItemPress = useCallback(
    (item: VirtualTryOnItem) => {
      selectionItemPress(item.id, () => {
        setSelectedOutfitUri(item.newClothingImageUri);
        setSelectedPhotoUri(item.userPhotoUri);
        setResultImageUri(item.resultImageUri);
      });
    },
    [selectionItemPress]
  );

  const onDelete = useCallback(() => {
    handleDelete(
      async (ids) => {
        await deleteHistoryItems(ids);
      },
      "History"
    );
  }, [handleDelete, deleteHistoryItems]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {isSelectionMode ? (
        <DeleteModeHeader selectedCount={selectedItems.size} onCancel={handleCancelSelection} />
      ) : (
        <ScreenHeader title="Try-On" />
      )}

      <ScrollView style={[styles.content, isSelectionMode && styles.contentWithDelete]}>
        <Text style={styles.instructions}>
          Select an outfit and upload your photo to see how it looks on you
        </Text>

        <PhotoTipsSection />

        <View style={styles.selectionContainer}>
          <ContentSelectionBox
            title="Outfit"
            iconName="checkroom"
            onPress={() => setOptionSheetVisible(true)}
            selectedImageUri={selectedOutfitUri}
          />
          <ContentSelectionBox
            title="Your Photo"
            iconName="add-a-photo"
            onPress={handlePhotoSelect}
            selectedImageUri={selectedPhotoUri}
          />
        </View>

        {isProcessing ? (
          <TryOnProgress progress={progress} />
        ) : (
          !resultImageUri && (
            <PressableFade
              containerStyle={styles.tryOnButtonContainer}
              style={[styles.tryOnButton, (!selectedOutfitUri || !selectedPhotoUri) && styles.tryOnButtonDisabled]}
              onPress={handleTryOn}
              disabled={!selectedOutfitUri || !selectedPhotoUri}
            >
              <Text style={styles.tryOnButtonText}>Try It On</Text>
            </PressableFade>
          )
        )}

        {resultImageUri && (
          <View style={styles.resultContainer}>
            <Text style={styles.subtitle}>Your Result</Text>
            <View style={styles.resultImageWrapper}>
              <Image source={{ uri: resultImageUri }} style={styles.resultImage} resizeMode="contain" />
            </View>
            <PressableFade
              containerStyle={styles.regenerateButtonContainer}
              style={styles.regenerateButton}
              onPress={() => {
                setResultImageUri(undefined);
                handleTryOn();
              }}
            >
              <MaterialIcons name="refresh" size={18} color={colors.text_secondary} />
              <Text style={styles.regenerateButtonText}>Try Again</Text>
            </PressableFade>
          </View>
        )}

        {recentTryOns.length > 0 && (
          <RecentlyTriedSection
            items={recentTryOns}
            onItemPress={handleItemPress}
            onItemLongPress={handleLongPress}
            isSelectionMode={isSelectionMode}
            selectedItems={selectedItems}
          />
        )}
      </ScrollView>

      {isSelectionMode && <DeleteButton onDelete={onDelete} selectedCount={selectedItems.size} />}

      <TryOnOptionSheet
        isVisible={isOptionSheetVisible}
        onClose={() => setOptionSheetVisible(false)}
        onSelect={handleOptionSelect}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface_primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  instructions: {
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.text_secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  selectionContainer: {
    flexDirection: "row",
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xxl,
  },
  tryOnButtonContainer: {
    marginBottom: spacing.xxl,
  },
  tryOnButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg + 2,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.small,
  },
  tryOnButtonDisabled: {
    opacity: 0.4,
  },
  tryOnButtonText: {
    fontSize: 16,
    fontFamily: typography.semiBold,
    color: colors.text_inverse,
    letterSpacing: 0.5,
  },
  resultContainer: {
    marginBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  resultImageWrapper: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.surface_tertiary,
    ...shadows.subtle,
  },
  resultImage: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  regenerateButtonContainer: {
    width: "100%",
    marginTop: spacing.md,
  },
  regenerateButton: {
    flexDirection: "row",
    backgroundColor: colors.surface_tertiary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  regenerateButtonText: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_secondary,
    letterSpacing: 0.2,
  },
  contentWithDelete: {
    paddingBottom: layout.tabBarHeight + layout.deleteBarHeight,
  },
});

export default VirtualTryOnScreen;
