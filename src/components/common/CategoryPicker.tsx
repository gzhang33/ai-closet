import React, { useState, useEffect } from "react";
import { View, Text, Modal, StyleSheet, FlatList, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { categories } from "../../data/categories";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

type Props = {
  selectedCategory: string;
  selectedSubcategory: string;
  onValueChange: (category: string, subcategory: string) => void;
  disabled?: boolean;
};

type CategoryKey = keyof typeof categories;

const categoryIcons: { [key in CategoryKey]: React.ComponentProps<typeof MaterialCommunityIcons>["name"] } = {
  Tops: "tshirt-crew",
  Bottoms: "roller-skate-off",
  Dresses: "tshirt-crew",
  Footwear: "shoe-formal",
  Bags: "bag-personal",
  Accessories: "hat-fedora",
  Jewelry: "diamond-stone",
};

const CategoryPicker = ({ selectedCategory, selectedSubcategory, onValueChange, disabled = false }: Props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tempCategory, setTempCategory] = useState<CategoryKey>((selectedCategory as CategoryKey) || "");
  const [tempSubcategory, setTempSubcategory] = useState(selectedSubcategory || "");
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  useEffect(() => {
    if (isModalVisible) {
      setTempCategory((selectedCategory as CategoryKey) || "");
      setTempSubcategory(selectedSubcategory || "");
    }
  }, [isModalVisible]);

  const handleCategorySelect = (category: CategoryKey) => {
    setTempCategory(category);
    setTempSubcategory(categories[category][0]);
  };

  const handleConfirm = () => {
    onValueChange(tempCategory, tempSubcategory);
    setModalVisible(false);
  };

  const renderModal = () => (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerBar}>
            <PressableFade onPress={() => setModalVisible(false)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </PressableFade>
            <Text style={styles.headerTitle}>Category</Text>
            <PressableFade onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.headerButtonDone}>Done</Text>
            </PressableFade>
          </View>

          <View style={styles.pickerContent}>
            <View style={[styles.pickerContainer, styles.leftPicker]}>
              <FlatList
                data={Object.keys(categories)}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <PressableFade
                    style={[styles.pickerItem, tempCategory === item && styles.pickerItemSelected]}
                    onPress={() => handleCategorySelect(item as CategoryKey)}
                  >
                    <MaterialCommunityIcons
                      name={categoryIcons[item as CategoryKey]}
                      size={22}
                      color={tempCategory === item ? colors.primary : colors.text_tertiary}
                      style={styles.icon}
                    />
                    <Text style={[styles.pickerItemText, tempCategory === item && styles.pickerItemTextSelected]}>
                      {item}
                    </Text>
                  </PressableFade>
                )}
              />
            </View>

            <View style={[styles.pickerContainer, styles.rightPicker]}>
              <FlatList
                data={categories[tempCategory]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <PressableFade
                    style={[styles.pickerItem, tempSubcategory === item && styles.pickerItemSelected]}
                    onPress={() => setTempSubcategory(item)}
                  >
                    <Text style={[styles.pickerItemText, tempSubcategory === item && styles.pickerItemTextSelected]}>
                      {item}
                    </Text>
                  </PressableFade>
                )}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <PressableFade
        style={[styles.pressableContainer, disabled && styles.pressableContainerDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.valueContainer}>
          <Text style={[styles.value, disabled && styles.valueDisabled]} numberOfLines={1}>
            {selectedCategory ? `${selectedCategory} - ${selectedSubcategory}` : "Select Category"}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={disabled ? colors.text_tertiary : colors.text_secondary}
          />
        </View>
      </PressableFade>
      {renderModal()}
    </View>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  container: {
    flex: 1,
  },
  pressableContainer: {
    flex: 1,
  },
  pressableContainerDisabled: {
    opacity: 0.5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.lg,
  },
  value: {
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.text_secondary,
    marginRight: spacing.sm,
    textAlign: "right",
    flex: 1,
  },
  valueDisabled: {
    color: colors.text_tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay_heavy,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.surface_primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    height: "50%",
    overflow: "hidden",
    ...shadows.large,
  },
  headerBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border_light,
    backgroundColor: colors.surface_primary,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    letterSpacing: 0.3,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerButtonText: {
    fontSize: 15,
    fontFamily: typography.medium,
    color: colors.text_tertiary,
  },
  headerButtonDone: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
  pickerContent: {
    flexDirection: "row",
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
  },
  leftPicker: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border_light,
  },
  rightPicker: {
    backgroundColor: colors.surface_secondary,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary_subtle,
  },
  pickerItemText: {
    fontSize: 15,
    fontFamily: typography.regular,
    color: colors.text_secondary,
  },
  pickerItemTextSelected: {
    fontFamily: typography.semiBold,
    color: colors.text_primary,
  },
  icon: {
    marginRight: spacing.md,
  },
});

export default CategoryPicker;
