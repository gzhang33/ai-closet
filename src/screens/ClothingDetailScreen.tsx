import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ClothingContext } from "../contexts/ClothingContext";
import { ClosetStackScreenProps, RootStackScreenProps } from "../types/navigation";
import { ClothingItem } from "../types/ClothingItem";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../contexts/ThemeContext";
import LoadingImageView from "../components/common/LoadingImageView";
import TagChips from "../components/common/TagChips";
import Header from "../components/common/Header";
import CategoryPicker from "../components/common/CategoryPicker";
import MultiSelectToggle from "../components/common/MultiSelectToggle";
import YearMonthPicker from "../components/common/YearMonthPicker";
import RelevantOutfits from "../components/clothing/RelevantOutfits";
import SaveButton from "../components/common/SaveButton";
import { colors as colorOptions, seasons, occasions } from "../data/options";
import { typography, spacing, borderRadius } from "../styles/globalStyles";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";

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
  imageSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  section: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.semiBold,
    fontSize: 18,
    color: colors.text_primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg - 2,
    paddingLeft: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border_light,
  },
  detailLabel: {
    fontSize: 15,
    fontFamily: typography.medium,
    color: colors.text_primary,
    flex: 1,
    letterSpacing: 0.1,
  },
  valueContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: spacing.xl,
    minHeight: 24,
  },
  valueContainerFocused: {
    backgroundColor: colors.primary_subtle,
    marginVertical: -spacing.xs,
    paddingVertical: spacing.xs,
    marginRight: spacing.lg,
    paddingRight: -spacing.xs,
    borderRadius: borderRadius.sm,
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.text_secondary,
    textAlign: "right",
    marginRight: spacing.sm,
  },
  detailValueDisabled: {
    opacity: 0.5,
  },
  multiSelectContainer: {
    flex: 2,
    alignItems: "flex-end",
  },
});

type DetailStyles = ReturnType<typeof createStyles>;

const DetailField = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder = "",
  disabled = false,
  colors,
  styles,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  disabled?: boolean;
  colors: ThemeColors;
  styles: DetailStyles;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Pressable
        style={[styles.valueContainer, isFocused && styles.valueContainerFocused]}
        onPress={() => inputRef.current?.focus()}
        disabled={disabled}
      >
        <TextInput
          ref={inputRef}
          style={[styles.detailValue, disabled && styles.detailValueDisabled]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.text_tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
        />
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text_tertiary} />
      </Pressable>
    </View>
  );
};

const MultiSelectField = ({
  label,
  selectedValues,
  options,
  onValueChange,
  disabled = false,
  styles,
}: {
  label: string;
  selectedValues: string[];
  options: string[];
  onValueChange: (values: string[]) => void;
  disabled?: boolean;
  styles: DetailStyles;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.multiSelectContainer}>
      <MultiSelectToggle
        options={options}
        selectedValues={selectedValues}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  </View>
);

type Props = ClosetStackScreenProps<"ClothingDetail"> | RootStackScreenProps<"ClothingDetailModal">;

const ClothingDetailScreen = ({ route, navigation }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = route.params;
  const context = useContext(ClothingContext);

  const isModal = route.name === "ClothingDetailModal";

  if (!context) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { getClothingItem, updateClothingItem, deleteClothingItem } = context;

  const contextItem = getClothingItem(id);

  const [localItem, setLocalItem] = useState<ClothingItem | undefined>(contextItem);
  const [isDirty, setIsDirty] = useState(false);

  const isProcessing =
    localItem?.processingStatus.backgroundRemoval === "processing" ||
    localItem?.processingStatus.categorization === "processing";

  const getLoadingText = (item: ClothingItem): string | undefined => {
    if (item.processingStatus.backgroundRemoval === "processing") {
      return "Removing background...";
    }
    if (item.processingStatus.categorization === "processing") {
      return "Analyzing item...";
    }
    return undefined;
  };

  useEffect(() => {
    if (contextItem && localItem) {
      const prevStatus = localItem.processingStatus;
      const newStatus = contextItem.processingStatus;

      if (prevStatus.categorization !== "completed" && newStatus.categorization === "completed") {
        setLocalItem(contextItem);
        setIsDirty(false);
      }

      if (prevStatus.backgroundRemoval !== "completed" && newStatus.backgroundRemoval === "completed") {
        setLocalItem(contextItem);
      }
    }
  }, [contextItem]);

  useEffect(() => {
    if (contextItem) {
      setLocalItem(contextItem);
    }
  }, [contextItem]);

  if (!localItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Item not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          try {
            deleteClothingItem(id);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert("Error", "Failed to delete. Please try again.");
          }
        },
      },
    ]);
  };

  const handleSave = () => {
    if (localItem) {
      try {
        updateClothingItem(localItem);
        setIsDirty(false);
        Alert.alert("Saved", "Item updated successfully");
      } catch (error) {
        console.error("Error saving item:", error);
        Alert.alert("Error", "Failed to save changes. Please try again.");
      }
    }
  };

  const handleFieldChange = (field: keyof ClothingItem, value: any) => {
    if (isProcessing) return;

    setLocalItem((prevItem) => {
      if (!prevItem) return prevItem;
      return { ...prevItem, [field]: value };
    });
    setIsDirty(true);
  };

  const handleOutfitPress = (outfitId: string) => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate("OutfitDetailModal", { id: outfitId });
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.imageSection}>
            <LoadingImageView
              imageUri={localItem.imageUri}
              processedImageUri={localItem.backgroundRemovedImageUri}
              isLoading={isProcessing}
              loadingText={getLoadingText(localItem)}
            />
          </View>

          <View style={styles.section}>
            <TagChips
              tags={localItem.tags}
              onAddTag={(tag) => {
                handleFieldChange("tags", [...localItem.tags, tag]);
              }}
              onRemoveTag={(tag) => {
                handleFieldChange(
                  "tags",
                  localItem.tags.filter((t) => t !== tag)
                );
              }}
            />
          </View>

          <RelevantOutfits clothingItemId={id} onOutfitPress={handleOutfitPress} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <CategoryPicker
                selectedCategory={localItem.category}
                selectedSubcategory={localItem.subcategory}
                onValueChange={(category, subcategory) => {
                  handleFieldChange("category", category);
                  handleFieldChange("subcategory", subcategory);
                }}
                disabled={isProcessing}
              />
            </View>

            <DetailField
              label="Color"
              value={localItem.color.join(", ")}
              onChangeText={(text) =>
                handleFieldChange(
                  "color",
                  text.split(",").map((s) => s.trim())
                )
              }
              placeholder="Enter color(s)"
              disabled={isProcessing}
              colors={colors}
              styles={styles}
            />

            <MultiSelectField
              label="Season"
              selectedValues={localItem.season}
              options={seasons}
              onValueChange={(selectedSeasons) => handleFieldChange("season", selectedSeasons)}
              disabled={isProcessing}
              styles={styles}
            />

            <MultiSelectField
              label="Occasion"
              selectedValues={localItem.occasion}
              options={occasions}
              onValueChange={(selectedOccasions) => handleFieldChange("occasion", selectedOccasions)}
              disabled={isProcessing}
              styles={styles}
            />

            <DetailField
              label="Brand"
              value={localItem.brand}
              onChangeText={(text) => handleFieldChange("brand", text)}
              placeholder="Enter brand"
              disabled={isProcessing}
              colors={colors}
              styles={styles}
            />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purchased</Text>
              <YearMonthPicker
                selectedDate={localItem.purchaseDate}
                onValueChange={(date) => handleFieldChange("purchaseDate", date)}
                disabled={isProcessing}
              />
            </View>

            <DetailField
              label="Price"
              value={localItem.price ? localItem.price.toString() : ""}
              onChangeText={(text) => {
                const numericValue = parseFloat(text);
                handleFieldChange("price", isNaN(numericValue) ? 0 : numericValue);
              }}
              keyboardType="numeric"
              placeholder="Enter price"
              disabled={isProcessing}
              colors={colors}
              styles={styles}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isDirty && !isProcessing && (
        <SaveButton onPress={handleSave} />
      )}
    </SafeAreaView>
  );
};

export default ClothingDetailScreen;
