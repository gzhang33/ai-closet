import React, { useCallback, useContext } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ClothingContext } from "../contexts/ClothingContext";
import { ClothingItem } from "../types/ClothingItem";
import { ClosetStackScreenProps } from "../types/navigation";
import ClothingItemThumbnail from "../components/clothing/ClothingItemThumbnail";
import AnimatedAddButton from "../components/common/AnimatedAddButton";
import TagFilterSection from "../components/common/TagFilterSection";
import DeleteModeHeader from "../components/common/DeleteModeHeader";
import DeleteButton from "../components/common/DeleteButton";
import CategoryTab from "../components/common/CategoryTab";
import ScreenHeader from "../components/common/ScreenHeader";
import { categories } from "../data/categories";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius, layout } from "../styles/globalStyles";
import { useSelectionMode } from "../hooks/useSelectionMode";

type Props = ClosetStackScreenProps<"ClothingManagement">;

const ClothingManagementScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const context = useContext(ClothingContext);

  const {
    isSelectionMode,
    selectedItems,
    handleLongPress,
    handleItemPress,
    handleCancelSelection,
    handleDelete,
  } = useSelectionMode();

  if (!context) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    categoryData,
    tagData,
    filteredItems,
    activeFilters,
    setFilter,
    addClothingItemFromImage,
    deleteClothingItem,
  } = context;

  const onItemPress = useCallback(
    (itemId: string) => {
      handleItemPress(itemId, () => navigation.navigate("ClothingDetail", { id: itemId }));
    },
    [handleItemPress, navigation]
  );

  const onDelete = useCallback(() => {
    handleDelete(
      async (ids) => {
        ids.forEach((id) => deleteClothingItem(id));
      },
      "Items"
    );
  }, [handleDelete, deleteClothingItem]);

  const handleAddClothingItem = async (imageUri: string) => {
    try {
      const newItemId = await addClothingItemFromImage(imageUri);
      navigation.navigate("ClothingDetail", { id: newItemId });
    } catch (error) {
      console.error("Error adding clothing item:", error);
      Alert.alert("Error", "Failed to add clothing item. Please try again.");
    }
  };

  const handleChoosePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
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
      Alert.alert("Permission Required", "Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      handleAddClothingItem(result.assets[0].uri);
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
      onPress={() => onItemPress(item.id)}
      onLongPress={() => handleLongPress(item.id)}
      isSelectable={isSelectionMode}
      isSelected={selectedItems.has(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {isSelectionMode ? (
        <DeleteModeHeader selectedCount={selectedItems.size} onCancel={handleCancelSelection} />
      ) : (
        <ScreenHeader title="My Closet" />
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabsContainer}
        contentContainerStyle={styles.categoryTabsContent}
      >
        <CategoryTab
          name="All"
          isSelected={activeFilters.category === "All"}
          onPress={() => setFilter("category", "All")}
          count={categoryData.All}
        />
        {Object.keys(categories).map((category) => (
          <CategoryTab
            key={category}
            name={category}
            isSelected={activeFilters.category === category}
            onPress={() => setFilter("category", category)}
            count={categoryData[category]}
          />
        ))}
      </ScrollView>

      <TagFilterSection tagData={tagData} selectedTags={activeFilters.tags || []} onTagPress={handleTagPress} />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={[styles.gridContent, isSelectionMode && styles.gridContentWithDelete]}
      />

      {isSelectionMode ? (
        <DeleteButton onDelete={onDelete} selectedCount={selectedItems.size} />
      ) : (
        <AnimatedAddButton onChoosePhoto={handleChoosePhoto} onTakePhoto={handleTakePhoto} />
      )}
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
  categoryTabsContainer: {
    maxHeight: 50,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  gridContent: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: layout.tabBarHeight + spacing.lg,
  },
  gridContentWithDelete: {
    paddingBottom: layout.tabBarHeight + layout.deleteBarHeight,
  },
});

export default ClothingManagementScreen;
