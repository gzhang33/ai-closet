import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ClothingContext } from "../../contexts/ClothingContext";
import ClothingItemThumbnail from "../clothing/ClothingItemThumbnail";
import CategoryTab from "../common/CategoryTab";
import FilterChip from "../common/FilterChip";
import { categories } from "../../data/categories";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";
import { ClothingItem } from "../../types/ClothingItem";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectItem: (item: ClothingItem) => void;
};

const AddClothingItemOverlay = ({ visible, onClose, onSelectItem }: Props) => {
  const context = useContext(ClothingContext);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!context) {
    return null;
  }

  const { categoryData, tagData, filteredItems, activeFilters, setFilter } = context;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Items</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={22} color={colors.text_secondary} />
            </Pressable>
          </View>

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

          {tagData.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagsContainer}
              contentContainerStyle={styles.tagsContent}
            >
              {tagData.map(({ tag, count }) => (
                <FilterChip
                  key={tag}
                  name={tag}
                  isSelected={(activeFilters.tags || []).includes(tag)}
                  onPress={() => {
                    const currentTags = activeFilters.tags || [];
                    const newTags = currentTags.includes(tag)
                      ? currentTags.filter((t) => t !== tag)
                      : [...currentTags, tag];
                    setFilter("tags", newTags);
                  }}
                  count={count}
                />
              ))}
            </ScrollView>
          )}

          <FlatList
            data={filteredItems}
            renderItem={({ item }) => (
              <ClothingItemThumbnail
                item={item}
                onPress={() => {
                  onSelectItem(item);
                  onClose();
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay_heavy,
  },
  content: {
    flex: 1,
    backgroundColor: colors.surface_primary,
    marginTop: 160,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface_tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTabsContainer: {
    maxHeight: 48,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.xl,
  },
  tagsContainer: {
    maxHeight: 40,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border_light,
  },
  tagsContent: {
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  gridContent: {
    padding: spacing.sm,
  },
});

export default AddClothingItemOverlay;
