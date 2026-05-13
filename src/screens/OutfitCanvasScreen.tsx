import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import ViewShot, { CaptureOptions } from "react-native-view-shot";
import { OutfitStackScreenProps } from "../types/navigation";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../styles/globalStyles";
import AddClothingItemOverlay from "../components/outfit/AddClothingItemOverlay";
import OutfitCanvas from "../components/outfit/OutfitCanvas";
import { ClothingContext } from "../contexts/ClothingContext";
import { OutfitContext } from "../contexts/OutfitContext";
import { ClothingItem } from "../types/ClothingItem";
import { Outfit, OutfitItem } from "../types/Outfit";
import PressableFade from "../components/common/PressableFade";
import { v4 as uuidv4 } from "uuid";

const ITEM_SIZE = 150;

type Props = OutfitStackScreenProps<"OutfitCanvas">;

type ViewShotRef = {
  capture: (options?: CaptureOptions) => Promise<string>;
} & ViewShot;

type CanvasRef = {
  deselectAll: () => void;
};

const OutfitCanvasScreen = ({ navigation, route }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isEditing = !!route.params?.id;
  const [isAddItemsVisible, setIsAddItemsVisible] = useState(false);
  const [canvasItems, setCanvasItems] = useState<OutfitItem[]>([]);
  const [canvasLayout, setCanvasLayout] = useState({ width: 0, height: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const viewShotRef = useRef<ViewShotRef>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const clothingContext = useContext(ClothingContext);
  const outfitContext = useContext(OutfitContext);

  if (!clothingContext || !outfitContext) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (isEditing && route.params?.id) {
      const outfit = outfitContext.getOutfit(route.params.id);
      if (outfit) {
        setCanvasItems(outfit.clothingItems);
      }
    }
  }, [isEditing, route.params?.id]);

  const clothingItemsMap = clothingContext.clothingItems.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {} as Record<string, ClothingItem>);

  const handleSelectItem = (item: ClothingItem) => {
    const newItem: OutfitItem = {
      id: item.id,
      transform: {
        x: canvasLayout.width / 2 - ITEM_SIZE / 2,
        y: canvasLayout.height / 2 - ITEM_SIZE / 2,
        scale: 1,
        rotation: 0,
      },
      zIndex: canvasItems.length + 1,
    };
    setCanvasItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (index: number, transform: OutfitItem["transform"]) => {
    setCanvasItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], transform };
      return newItems;
    });
  };

  const handleUpdateZIndex = (index: number, zIndex: number) => {
    setCanvasItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], zIndex };
      return newItems;
    });
  };

  const handleDeleteItem = (index: number) => {
    setCanvasItems((prev) => prev.filter((_, i) => i !== index));
  };

  const captureCanvas = async (): Promise<string> => {
    if (!viewShotRef.current) {
      throw new Error("Canvas reference not found");
    }

    try {
      setIsCapturing(true);
      canvasRef.current?.deselectAll();

      await new Promise((resolve) => requestAnimationFrame(resolve));

      const uri = await viewShotRef.current.capture({
        format: "png",
        quality: 1,
        result: "base64",
      });

      return uri;
    } catch (error) {
      console.error("Error capturing canvas:", error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSave = async () => {
    if (canvasItems.length === 0) {
      Alert.alert("Error", "Please add at least one item to the outfit");
      return;
    }

    try {
      setIsSaving(true);
      const outfitImageUri = await captureCanvas();

      let outfit: Outfit;
      const now = new Date().toISOString();

      if (isEditing && route.params?.id) {
        const existingOutfit = outfitContext.getOutfit(route.params.id);
        if (!existingOutfit) {
          throw new Error("Outfit not found");
        }

        outfit = {
          ...existingOutfit,
          imageUri: outfitImageUri,
          clothingItems: canvasItems,
          updatedAt: now,
        };
        outfitContext.updateOutfit(outfit);
      } else {
        outfit = {
          id: uuidv4(),
          imageUri: outfitImageUri,
          createdAt: now,
          updatedAt: now,
          clothingItems: canvasItems,
          tags: [],
          season: [],
          occasion: [],
        };
        outfitContext.addOutfit(outfit);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving outfit:", error);
      Alert.alert("Error", "Failed to save outfit");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
      onLayout={(e) => setCanvasLayout(e.nativeEvent.layout)}
    >
      <View style={styles.header}>
        <PressableFade
          containerStyle={styles.headerButtonContainer}
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.text_primary} />
        </PressableFade>
        <Text style={styles.title}>Canvas</Text>
        <PressableFade
          containerStyle={styles.headerButtonContainer}
          style={styles.headerButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <MaterialIcons name="save" size={22} color={isSaving ? colors.text_tertiary : colors.primary} />
        </PressableFade>
      </View>

      <ViewShot
        ref={viewShotRef}
        style={styles.canvasArea}
        options={{
          format: "png",
          quality: 1,
        }}
      >
        <View
          style={[styles.canvasWrapper, { backgroundColor: isCapturing ? colors.transparent : colors.surface_tertiary }]}
        >
          <OutfitCanvas
            ref={canvasRef}
            items={canvasItems}
            clothingItems={clothingItemsMap}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onUpdateZIndex={handleUpdateZIndex}
          />
        </View>
      </ViewShot>

      <View style={styles.bottomButtons}>
        <PressableFade
          containerStyle={styles.buttonContainer}
          style={[styles.button, styles.buttonSecondary, isSaving && styles.buttonDisabled]}
          onPress={() => setIsAddItemsVisible(true)}
          disabled={isSaving}
        >
          <MaterialIcons name="add" size={20} color={colors.text_primary} />
          <Text style={styles.buttonTextSecondary}>Add Items</Text>
        </PressableFade>
        <PressableFade
          containerStyle={styles.buttonContainer}
          style={[styles.button, styles.buttonPrimary, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonTextPrimary}>Save Outfit</Text>
        </PressableFade>
      </View>

      <AddClothingItemOverlay
        visible={isAddItemsVisible}
        onClose={() => setIsAddItemsVisible(false)}
        onSelectItem={handleSelectItem}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface_primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: typography.regular,
    fontSize: 15,
    color: colors.text_tertiary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border_light,
  },
  headerButtonContainer: {
    padding: spacing.sm,
  },
  headerButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface_secondary,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    letterSpacing: 0.3,
  },
  canvasArea: {
    flex: 1,
    margin: spacing.xl,
  },
  canvasWrapper: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  bottomButtons: {
    flexDirection: "row",
    padding: spacing.xl,
    gap: spacing.md,
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
    flexDirection: "row",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface_tertiary,
    borderWidth: 1,
    borderColor: colors.border_medium,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    color: colors.text_inverse,
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    letterSpacing: 0.3,
  },
});

export default OutfitCanvasScreen;
