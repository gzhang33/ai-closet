import React, { useContext, useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OutfitContext } from "../contexts/OutfitContext";
import {
  OutfitStackScreenProps,
  RootStackScreenProps,
  RootStackParamList,
  OutfitStackParamList,
} from "../types/navigation";
import { Outfit } from "../types/Outfit";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows } from "../styles/globalStyles";
import TagChips from "../components/common/TagChips";
import Header from "../components/common/Header";
import MultiSelectToggle from "../components/common/MultiSelectToggle";
import SaveButton from "../components/common/SaveButton";
import { seasons, occasions } from "../data/options";
import { MaterialIcons } from "@expo/vector-icons";
import ClothingItemThumbnail from "../components/clothing/ClothingItemThumbnail";
import { ClothingContext } from "../contexts/ClothingContext";
import PressableFade from "../components/common/PressableFade";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";

type Props = OutfitStackScreenProps<"OutfitDetail"> | RootStackScreenProps<"OutfitDetailModal">;

const OutfitDetailScreen = ({ route, navigation }: Props) => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);
  const isModal = route.name === "OutfitDetailModal";

  const { id } = route.params;
  const outfitContext = useContext(OutfitContext);
  const clothingContext = useContext(ClothingContext);

  if (!outfitContext || !clothingContext) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { getOutfit, updateOutfit, deleteOutfit } = outfitContext;
  const { getClothingItem } = clothingContext;

  const contextOutfit = getOutfit(id);

  const [localOutfit, setLocalOutfit] = useState<Outfit | undefined>(contextOutfit);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (contextOutfit) {
      setLocalOutfit(contextOutfit);
    }
  }, [contextOutfit]);

  if (!localOutfit) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Outfit not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Outfit", "Are you sure you want to delete this outfit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          try {
            deleteOutfit(id);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting outfit:", error);
            Alert.alert("Error", "Failed to delete. Please try again.");
          }
        },
      },
    ]);
  };

  const handleSave = () => {
    if (localOutfit) {
      try {
        updateOutfit(localOutfit);
        setIsDirty(false);
        Alert.alert("Saved", "Outfit updated successfully");
      } catch (error) {
        console.error("Error saving outfit:", error);
        Alert.alert("Error", "Failed to save changes. Please try again.");
      }
    }
  };

  const handleFieldChange = (field: keyof Outfit, value: any) => {
    setLocalOutfit((prevOutfit) => {
      if (!prevOutfit) return prevOutfit;
      return { ...prevOutfit, [field]: value };
    });
    setIsDirty(true);
  };

  const handleEditOutfit = () => {
    if (!isModal) {
      (navigation as NativeStackNavigationProp<OutfitStackParamList>).navigate("OutfitCanvas", {
        id,
      });
    }
  };

  const handleClothingItemPress = (itemId: string) => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate("ClothingDetailModal", { id: itemId });
  };

  const safeAreaEdges: Edge[] = isModal ? ["left", "right"] : ["top", "left", "right"];

  const handleBack = useUnsavedChangesGuard({
    isDirty,
    onSave: handleSave,
    onDiscard: () => navigation.goBack(),
  });

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={handleBack} onDelete={handleDelete} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: localOutfit.imageUri }} style={styles.image} resizeMode="contain" />
          {!isModal && (
            <PressableFade
              containerStyle={styles.editButtonContainer}
              style={styles.editButton}
              onPress={handleEditOutfit}
            >
              <View style={styles.editButtonContent}>
                <MaterialIcons name="edit" size={18} color={colors.text_inverse} />
                <Text style={styles.editButtonText}>Edit</Text>
              </View>
            </PressableFade>
          )}
        </View>

        <View style={[styles.section, { paddingTop: spacing.lg }]}>
          <TagChips
            tags={localOutfit.tags}
            onAddTag={(tag) => {
              handleFieldChange("tags", [...localOutfit.tags, tag]);
            }}
            onRemoveTag={(tag) => {
              handleFieldChange(
                "tags",
                localOutfit.tags.filter((t) => t !== tag)
              );
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Included Items</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsScroll}>
            {localOutfit.clothingItems.map((item) => {
              const clothingItem = getClothingItem(item.id);
              if (!clothingItem) return null;
              return (
                <View key={item.id} style={styles.itemThumbnail}>
                  <ClothingItemThumbnail item={clothingItem} onPress={() => handleClothingItemPress(item.id)} />
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Season</Text>
            <MultiSelectToggle
              options={seasons}
              selectedValues={localOutfit.season}
              onValueChange={(selectedSeasons) => handleFieldChange("season", selectedSeasons)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Occasion</Text>
            <MultiSelectToggle
              options={occasions}
              selectedValues={localOutfit.occasion}
              onValueChange={(selectedOccasions) => handleFieldChange("occasion", selectedOccasions)}
            />
          </View>
        </View>
      </ScrollView>

      {isDirty && (
        <SaveButton onPress={handleSave} />
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
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
  notFound: {
    fontFamily: typography.regular,
    fontSize: 15,
    color: colors.text_tertiary,
    textAlign: "center",
    marginTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface_tertiary,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  editButtonContainer: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    ...shadows.small,
  },
  editButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: 13,
    fontFamily: typography.semiBold,
    color: colors.text_inverse,
    letterSpacing: 0.2,
  },
  section: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  field: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  fieldLabel: {
    fontSize: 15,
    fontFamily: typography.medium,
    color: colors.text_primary,
    marginBottom: spacing.sm,
    letterSpacing: 0.1,
  },
  itemsScroll: {
    paddingHorizontal: spacing.lg,
  },
  itemThumbnail: {
    width: 120,
  },
});

export default OutfitDetailScreen;
