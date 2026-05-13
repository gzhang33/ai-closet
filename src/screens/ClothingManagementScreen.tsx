import React, { useCallback, useContext, useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { ClothingContext } from "../contexts/ClothingContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ClothingItem } from "../types/ClothingItem";
import { ClosetStackScreenProps } from "../types/navigation";
import ClothingItemThumbnail from "../components/clothing/ClothingItemThumbnail";
import AnimatedAddButton from "../components/common/AnimatedAddButton";
import TagFilterSection from "../components/common/TagFilterSection";
import DeleteModeHeader from "../components/common/DeleteModeHeader";
import DeleteButton from "../components/common/DeleteButton";
import { categories } from "../data/categories";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import { translateCategory } from "../i18n/categoryTranslations";

type Props = ClosetStackScreenProps<"ClothingManagement">;

interface CategoryTabProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  count: number;
}

// CategoryTab Subcomponent
const CategoryTab = ({ name, isSelected, onPress, count }: CategoryTabProps) => (
  <Pressable style={[styles.categoryTab, isSelected && styles.categoryTabSelected]} onPress={onPress}>
    <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>{name}</Text>
    <Text style={[styles.categoryCount, isSelected && styles.categoryCountSelected]}>{count}</Text>
  </Pressable>
);

// Main Component
const ClothingManagementScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const context = useContext(ClothingContext);

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [batchProcessingIds, setBatchProcessingIds] = useState<Set<string>>(new Set());

  if (!context) {
    return <Text>{t("common.loading")}</Text>;
  }

  const {
    clothingItems,
    categoryData,
    tagData,
    filteredItems,
    activeFilters,
    setFilter,
    addClothingItemFromImage,
    deleteClothingItem,
  } = context;

  // Track batch processing completion
  const batchProgress = useMemo(() => {
    if (batchProcessingIds.size === 0) return { completed: 0, total: 0 };
    const completed = Array.from(batchProcessingIds).filter((id) => {
      const item = clothingItems.find((i) => i.id === id);
      return (
        item &&
        item.processingStatus.backgroundRemoval !== "processing" &&
        item.processingStatus.categorization !== "processing"
      );
    }).length;
    return { completed, total: batchProcessingIds.size };
  }, [clothingItems, batchProcessingIds]);

  useEffect(() => {
    if (batchProgress.total > 0 && batchProgress.completed === batchProgress.total) {
      setBatchProcessingIds(new Set());
    }
  }, [batchProgress]);

  // Selection handlers
  const handleLongPress = useCallback((itemId: string) => {
    setIsSelectionMode(true);
    setSelectedItems(new Set([itemId]));
  }, []);

  const handleItemPress = useCallback(
    (itemId: string) => {
      if (isSelectionMode) {
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
            // If no items are selected, exit selection mode
            if (newSet.size === 0) {
              setIsSelectionMode(false);
            }
          } else {
            newSet.add(itemId);
          }
          return newSet;
        });
      } else {
        navigation.navigate("ClothingDetail", { id: itemId });
      }
    },
    [isSelectionMode, navigation]
  );

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  }, []);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t("closet.deleteItems"),
      t("closet.deleteConfirm", { count: selectedItems.size }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            selectedItems.forEach((id) => {
              deleteClothingItem(id);
            });
            setIsSelectionMode(false);
            setSelectedItems(new Set());
          },
        },
      ]
    );
  }, [selectedItems, deleteClothingItem]);

  const handleAddClothingItem = async (imageUri: string) => {
    try {
      // Add the item immediately and get its ID
      const newItemId = await addClothingItemFromImage(imageUri);

      // Navigate to the detail screen right away
      navigation.navigate("ClothingDetail", { id: newItemId });
    } catch (error) {
      console.error("Error adding clothing item:", error);
      Alert.alert(t("common.error"), t("closet.addError"));
    }
  };

  const handleChoosePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t("closet.permissionRequired"), t("closet.galleryPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      handleAddClothingItem(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t("closet.permissionRequired"), t("closet.cameraPermission"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      handleAddClothingItem(result.assets[0].uri);
    }
  };

  const handleBatchUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t("closet.permissionRequired"), t("closet.galleryPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets.length > 0) {
      for (const asset of result.assets) {
        addClothingItemFromImage(asset.uri)
          .then((id) => {
            setBatchProcessingIds((prev) => new Set(prev).add(id));
          })
          .catch((error) => {
            console.error("Error adding batch item:", error);
          });
      }
    }
  };

  const handleTagPress = (tag: string) => {
    const currentTags = activeFilters.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
    setFilter("tags", newTags);
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <ClothingItemThumbnail
      item={item}
      onPress={() => handleItemPress(item.id)}
      onLongPress={() => handleLongPress(item.id)}
      isSelectable={isSelectionMode}
      isSelected={selectedItems.has(item.id)}
    />
  );

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      {/* Header */}
      {isSelectionMode ? (
        <DeleteModeHeader selectedCount={selectedItems.size} onCancel={handleCancelSelection} />
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>{t("closet.title")}</Text>
          <Pressable>
            <MaterialIcons name="filter-list" size={24} color={colors.icon_stroke} />
          </Pressable>
        </View>
      )}

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabsContainer}
        contentContainerStyle={styles.categoryTabsContent}
      >
        <CategoryTab
          name={t("closet.all")}
          isSelected={activeFilters.category === "All"}
          onPress={() => setFilter("category", "All")}
          count={categoryData.All}
        />
        {Object.keys(categories).map((category) => (
          <CategoryTab
            key={category}
            name={translateCategory(category, language)}
            isSelected={activeFilters.category === category}
            onPress={() => setFilter("category", category)}
            count={categoryData[category]}
          />
        ))}
      </ScrollView>

      {/* Tag Filter Section */}
      <TagFilterSection tagData={tagData} selectedTags={activeFilters.tags || []} onTagPress={handleTagPress} />

      {/* Batch Progress Banner */}
      {batchProgress.total > 0 && batchProgress.completed < batchProgress.total && (
        <View style={styles.batchBanner}>
          <Text style={styles.batchBannerText}>
            {t("closet.batchProgress", {
              completed: batchProgress.completed,
              total: batchProgress.total,
            })}
          </Text>
        </View>
      )}

      {/* Clothing Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={[styles.gridContent, isSelectionMode && styles.gridContentWithDelete]}
      />

      {/* Add Button or Delete Button */}
      {isSelectionMode ? (
        <DeleteButton onDelete={handleDelete} selectedCount={selectedItems.size} />
      ) : (
        <AnimatedAddButton onChoosePhoto={handleChoosePhoto} onTakePhoto={handleTakePhoto} onBatchUpload={handleBatchUpload} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text_primary,
  },
  categoryTabsContainer: {
    maxHeight: 48,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.thumbnail_background,
  },
  categoryTabSelected: {
    backgroundColor: colors.primary_yellow,
  },
  categoryTabText: {
    fontFamily: typography.medium,
    fontSize: 14,
    color: colors.text_gray,
    marginRight: 4,
  },
  categoryTabTextSelected: {
    color: colors.text_primary,
  },
  categoryCount: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_gray,
  },
  categoryCountSelected: {
    color: colors.text_primary,
  },
  gridContent: {
    paddingTop: 6,
    paddingHorizontal: 10,
  },
  gridContentWithDelete: {
    paddingBottom: 80,
  },
  batchBanner: {
    backgroundColor: colors.light_yellow,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  batchBannerText: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text_primary,
    textAlign: "center",
  },
});

export default ClothingManagementScreen;
