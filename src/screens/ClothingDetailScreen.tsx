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
import { useTranslation } from "react-i18next";
import { ClothingContext } from "../contexts/ClothingContext";
import { ClosetStackScreenProps, RootStackScreenProps } from "../types/navigation";
import { ClothingItem } from "../types/ClothingItem";
import { colors } from "../styles/colors";
import LoadingImageView from "../components/common/LoadingImageView";
import TagChips from "../components/common/TagChips";
import Header from "../components/common/Header";
import CategoryPicker from "../components/common/CategoryPicker";
import MultiSelectToggle from "../components/common/MultiSelectToggle";
import YearMonthPicker from "../components/common/YearMonthPicker";
import RelevantOutfits from "../components/clothing/RelevantOutfits";
import { colors as colorOptions, seasons, occasions } from "../data/options";
import { brands as brandSuggestions } from "../data/suggestions";
import { typography } from "../styles/globalStyles";

// Style Constants
const SPACING = {
  VERTICAL: 16,
  HORIZONTAL: 16,
  SECTION: 12,
  SMALL: 8,
  TINY: 4,
};

const FONT_SIZE = {
  SECTION_TITLE: 18,
  REGULAR: 16,
};

const CONTAINER = {
  BOTTOM_BUTTON: 20,
  MIN_INPUT_HEIGHT: 24,
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
  },
  SCROLL_BOTTOM_PADDING: 100,
  ICON_SIZE: 30,
};

const FLEX = {
  LABEL: 1,
  VALUE: 2,
};

// Types
type Props = ClosetStackScreenProps<"ClothingDetail"> | RootStackScreenProps<"ClothingDetailModal">;

// DetailField component for text input fields
const DetailField = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  disabled?: boolean;
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
          placeholderTextColor={colors.text_gray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
        />
        <MaterialCommunityIcons name="chevron-right" size={CONTAINER.ICON_SIZE} color={colors.text_gray} />
      </Pressable>
    </View>
  );
};

// MultiSelectField component for seasons and occasions
const MultiSelectField = ({
  label,
  selectedValues,
  options,
  onValueChange,
  disabled = false,
}: {
  label: string;
  selectedValues: string[];
  options: string[];
  onValueChange: (values: string[]) => void;
  disabled?: boolean;
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

const ClothingDetailScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { id } = route.params;
  const context = useContext(ClothingContext);

  // Determine if we're in modal mode by checking the route name
  const isModal = route.name === "ClothingDetailModal";

  if (!context) {
    return <Text>{t("common.loading")}</Text>;
  }

  const { getClothingItem, updateClothingItem, deleteClothingItem, cancelCategorization } = context;

  // Get the initial item from context
  const contextItem = getClothingItem(id);

  // Manage local state for the form
  const [localItem, setLocalItem] = useState<ClothingItem | undefined>(contextItem);
  const localItemRef = useRef(localItem);
  localItemRef.current = localItem;
  const [isDirty, setIsDirty] = useState(false);

  // Get the processing status
  const isProcessing =
    localItem?.processingStatus.backgroundRemoval === "processing" ||
    localItem?.processingStatus.categorization === "processing";

  // Function to get loading text based on processing status
  const getLoadingText = (item: ClothingItem): string | undefined => {
    if (item.processingStatus.backgroundRemoval === "processing") {
      return t("detail.removingBackground");
    }
    if (item.processingStatus.categorization === "processing") {
      return t("detail.analyzingDetails");
    }
    return undefined;
  };

  // Sync processing-related fields from context while preserving local edits
  useEffect(() => {
    if (!contextItem) return;

    setLocalItem((prev) => {
      if (!prev) return contextItem;

      const aiFields = ["category", "subcategory", "color", "season", "occasion"] as const;
      const prevStatus = prev.processingStatus;
      const newStatus = contextItem.processingStatus;
      const edited = new Set(prev.manuallyEditedFields);

      const merged = { ...prev };
      merged.processingStatus = contextItem.processingStatus;
      merged.backgroundRemovedImageUri = contextItem.backgroundRemovedImageUri || prev.backgroundRemovedImageUri;

      // When categorization completes, merge AI values for unedited fields
      if (prevStatus.categorization !== "completed" && newStatus.categorization === "completed") {
        for (const field of aiFields) {
          if (!edited.has(field)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (merged as any)[field] = (contextItem as any)[field];
          }
        }
      }

      return merged;
    });
  }, [contextItem]);

  if (!localItem) {
    return (
      <View style={styles.container}>
        <Text>{t("detail.notFound")}</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(t("detail.deleteItem"), t("detail.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteClothingItem(id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSave = () => {
    if (localItem) {
      updateClothingItem(localItem);
      setIsDirty(false);
      Alert.alert(t("common.success"), t("detail.saveSuccess"));
    }
  };

  const handleFieldChange = (field: keyof ClothingItem, value: any) => {
    const aiFields = ["category", "subcategory", "color", "season", "occasion"] as const;

    setLocalItem((prevItem) => {
      if (!prevItem) return prevItem;
      const newEditedFields = aiFields.includes(field as typeof aiFields[number])
        ? [...new Set([...prevItem.manuallyEditedFields, field])]
        : prevItem.manuallyEditedFields;
      return { ...prevItem, [field]: value, manuallyEditedFields: newEditedFields };
    });
    setIsDirty(true);

    // Check if all AI fields are manually filled - cancel categorization
    if (aiFields.includes(field as typeof aiFields[number])) {
      setTimeout(() => {
        const current = localItemRef.current;
        if (!current) return;
        const edited = new Set([...current.manuallyEditedFields, field]);
        const allFilled = aiFields.every(
          (f) => edited.has(f) && current[f as keyof ClothingItem] !== "" && current[f as keyof ClothingItem] !== undefined
        );
        if (allFilled) {
          cancelCategorization(id);
        }
      }, 0);
    }
  };

  // Handle outfit press in relevant outfits section to navigate to outfit detail
  const handleOutfitPress = (outfitId: string) => {
    // Get the root navigation and navigate to the modal
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate("OutfitDetailModal", { id: outfitId });
  };

  // Remove SafeAreaView for the top edge in modal mode
  const safeAreaEdges: Edge[] = isModal ? ["left", "right"] : ["top", "left", "right"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header
        onBack={() => {
          if (isDirty) {
            Alert.alert(t("detail.unsavedChanges"), t("detail.unsavedConfirm"), [
              {
                text: t("common.discard"),
                style: "destructive",
                onPress: () => navigation.goBack(),
              },
              {
                text: t("common.save"),
                onPress: () => {
                  handleSave();
                  navigation.goBack();
                },
              },
            ]);
          } else {
            navigation.goBack();
          }
        }}
        onDelete={handleDelete}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <LoadingImageView
            imageUri={localItem.imageUri}
            processedImageUri={localItem.backgroundRemovedImageUri}
            isLoading={isProcessing}
            loadingText={getLoadingText(localItem)}
          />

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

          {/* Relevant Outfits Section */}
          <RelevantOutfits clothingItemId={id} onOutfitPress={handleOutfitPress} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("detail.sectionTitle")}</Text>

            {/* Category */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("detail.category")}</Text>
              <CategoryPicker
                selectedCategory={localItem.category}
                selectedSubcategory={localItem.subcategory}
                onValueChange={(category, subcategory) => {
                  handleFieldChange("category", category);
                  handleFieldChange("subcategory", subcategory);
                }}
              />
            </View>

            {/* Color */}
            <DetailField
              label={t("detail.color")}
              value={localItem.color.join(", ")}
              onChangeText={(text) =>
                handleFieldChange(
                  "color",
                  text.split(",").map((s) => s.trim())
                )
              }
              placeholder={t("detail.enterColor")}
            />

            {/* Season */}
            <MultiSelectField
              label={t("detail.season")}
              selectedValues={localItem.season}
              options={seasons}
              onValueChange={(selectedSeasons) => handleFieldChange("season", selectedSeasons)}
            />

            {/* Occasion */}
            <MultiSelectField
              label={t("detail.occasion")}
              selectedValues={localItem.occasion}
              options={occasions}
              onValueChange={(selectedOccasions) => handleFieldChange("occasion", selectedOccasions)}
            />

            {/* Brand */}
            <DetailField
              label={t("detail.brand")}
              value={localItem.brand}
              onChangeText={(text) => handleFieldChange("brand", text)}
              placeholder={t("detail.enterBrand")}
            />

            {/* Purchase Date */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("detail.purchaseDate")}</Text>
              <YearMonthPicker
                selectedDate={localItem.purchaseDate}
                onValueChange={(date) => handleFieldChange("purchaseDate", date)}
              />
            </View>

            {/* Price */}
            <DetailField
              label={t("detail.price")}
              value={localItem.price ? localItem.price.toString() : ""}
              onChangeText={(text) => {
                const numericValue = parseFloat(text);
                handleFieldChange("price", isNaN(numericValue) ? 0 : numericValue);
              }}
              keyboardType="numeric"
              placeholder={t("detail.enterPrice")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isDirty && (
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t("common.save")}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  scrollContent: {
    paddingBottom: CONTAINER.SCROLL_BOTTOM_PADDING,
  },
  section: {
    paddingVertical: SPACING.VERTICAL,
  },
  sectionTitle: {
    fontFamily: typography.bold,
    fontSize: FONT_SIZE.SECTION_TITLE,
    color: colors.text_primary,
    paddingHorizontal: SPACING.HORIZONTAL,
    marginBottom: SPACING.SECTION,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.VERTICAL,
    paddingLeft: SPACING.HORIZONTAL,
  },
  detailLabel: {
    fontSize: FONT_SIZE.REGULAR,
    fontFamily: typography.medium,
    color: colors.text_primary,
    flex: FLEX.LABEL,
  },
  valueContainer: {
    flex: FLEX.VALUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: SPACING.HORIZONTAL,
    minHeight: CONTAINER.MIN_INPUT_HEIGHT,
  },
  valueContainerFocused: {
    backgroundColor: colors.thumbnail_background,
    marginVertical: -SPACING.SMALL,
    paddingVertical: SPACING.SMALL,
    marginRight: SPACING.HORIZONTAL,
    paddingRight: -SPACING.SMALL,
    borderRadius: CONTAINER.BORDER_RADIUS.SMALL,
  },
  detailValue: {
    flex: 1,
    fontSize: FONT_SIZE.REGULAR,
    fontFamily: typography.regular,
    color: colors.text_gray,
    textAlign: "right",
    marginRight: SPACING.SMALL,
  },
  detailValueDisabled: {
    opacity: 0.5,
  },
  multiSelectContainer: {
    flex: FLEX.VALUE,
    alignItems: "flex-end",
  },
  saveButton: {
    position: "absolute",
    bottom: CONTAINER.BOTTOM_BUTTON,
    left: CONTAINER.BOTTOM_BUTTON,
    right: CONTAINER.BOTTOM_BUTTON,
    backgroundColor: colors.primary_yellow,
    padding: SPACING.HORIZONTAL,
    borderRadius: CONTAINER.BORDER_RADIUS.MEDIUM,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: FONT_SIZE.REGULAR,
    fontFamily: typography.bold,
    color: colors.text_primary,
  },
});

export default ClothingDetailScreen;
