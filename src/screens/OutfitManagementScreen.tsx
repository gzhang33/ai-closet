import React, { useCallback, useContext } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { OutfitContext } from "../contexts/OutfitContext";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius, layout } from "../styles/globalStyles";
import AddButton from "../components/common/AddButton";
import OutfitThumbnail from "../components/outfit/OutfitThumbnail";
import { OutfitStackScreenProps } from "../types/navigation";
import TagFilterSection from "../components/common/TagFilterSection";
import DeleteModeHeader from "../components/common/DeleteModeHeader";
import DeleteButton from "../components/common/DeleteButton";
import ScreenHeader from "../components/common/ScreenHeader";
import { Outfit } from "../types/Outfit";
import { useSelectionMode } from "../hooks/useSelectionMode";

type Props = OutfitStackScreenProps<"OutfitManagement">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const GRID_PADDING = 20;
const GRID_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;
const ITEM_HEIGHT = (ITEM_WIDTH * 4) / 3;

const OutfitManagementScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    isSelectionMode,
    selectedItems,
    handleLongPress,
    handleItemPress,
    handleCancelSelection,
    handleDelete,
  } = useSelectionMode();

  const context = useContext(OutfitContext);

  if (!context) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { tagData, filteredOutfits, activeFilters, setFilter, deleteOutfit } = context;

  const onItemPress = useCallback(
    (outfitId: string) => {
      handleItemPress(outfitId, () => navigation.navigate("OutfitDetail", { id: outfitId }));
    },
    [handleItemPress, navigation]
  );

  const onDelete = useCallback(() => {
    handleDelete(
      async (ids) => {
        ids.forEach((id) => deleteOutfit(id));
      },
      "Outfits"
    );
  }, [handleDelete, deleteOutfit]);

  const handleTagPress = (tag: string) => {
    const currentTags = activeFilters.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
    setFilter("tags", newTags);
  };

  const renderItem = ({ item, index }: { item: Outfit; index: number }) => {
    const isFirstInRow = index % 2 === 0;
    const style = isFirstInRow
      ? { marginRight: GRID_SPACING / 2, marginBottom: GRID_SPACING }
      : { marginLeft: GRID_SPACING / 2, marginBottom: GRID_SPACING };

    return (
      <OutfitThumbnail
        outfit={item}
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        style={style}
        onPress={() => onItemPress(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        isSelectable={isSelectionMode}
        isSelected={selectedItems.has(item.id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {isSelectionMode ? (
        <DeleteModeHeader selectedCount={selectedItems.size} onCancel={handleCancelSelection} />
      ) : (
        <ScreenHeader title="My Outfits" />
      )}

      <TagFilterSection tagData={tagData} selectedTags={activeFilters.tags || []} onTagPress={handleTagPress} />

      <FlatList
        data={filteredOutfits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={[styles.gridContent, isSelectionMode && styles.gridContentWithDelete]}
      />

      {isSelectionMode ? (
        <DeleteButton onDelete={onDelete} selectedCount={selectedItems.size} />
      ) : (
        <AddButton onPress={() => navigation.navigate("OutfitCanvas", { id: undefined })} />
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
  gridContent: {
    padding: GRID_PADDING,
    paddingBottom: GRID_PADDING + layout.tabBarHeight,
  },
  gridContentWithDelete: {
    paddingBottom: layout.tabBarHeight + layout.deleteBarHeight,
  },
});

export default OutfitManagementScreen;
