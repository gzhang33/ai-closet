import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, FlatList, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

const PICKER_ITEM_HEIGHT = 52;

type Props = {
  selectedDate: string;
  onValueChange: (date: string) => void;
  disabled?: boolean;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const YearMonthPicker = ({ selectedDate, onValueChange, disabled = false }: Props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tempMonth, setTempMonth] = useState<number>(
    selectedDate ? parseInt(selectedDate.split("-")[1]) - 1 : new Date().getMonth()
  );
  const [tempYear, setTempYear] = useState<number>(
    selectedDate ? parseInt(selectedDate.split("-")[0]) : new Date().getFullYear()
  );
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  const handleConfirm = () => {
    const month = tempMonth + 1;
    const formattedMonth = month < 10 ? `0${month}` : month;
    onValueChange(`${tempYear}-${formattedMonth}`);
    setModalVisible(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Select Date";
    const [year, month] = dateString.split("-");
    const monthIndex = parseInt(month) - 1;
    return `${monthAbbreviations[monthIndex]} ${year}`;
  };

  const years: number[] = Array.from(
    { length: new Date().getFullYear() - 1999 },
    (_, index) => new Date().getFullYear() - index
  );

  const getInitialScrollIndex = (data: (string | number)[], selectedValue: string | number): number => {
    const index = data.indexOf(selectedValue);
    return Math.max(0, index);
  };

  const renderModal = () => (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerBar}>
            <PressableFade onPress={() => setModalVisible(false)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </PressableFade>
            <Text style={styles.headerTitle}>Purchase Date</Text>
            <PressableFade onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.headerButtonDone}>Done</Text>
            </PressableFade>
          </View>

          <View style={styles.pickerContent}>
            <View style={[styles.pickerContainer, styles.leftPicker]}>
              <FlatList
                data={months}
                keyExtractor={(item) => item}
                initialScrollIndex={getInitialScrollIndex(months, months[tempMonth])}
                getItemLayout={(_, index) => ({
                  length: PICKER_ITEM_HEIGHT,
                  offset: PICKER_ITEM_HEIGHT * index,
                  index,
                })}
                renderItem={({ item, index }) => (
                  <PressableFade
                    style={[styles.pickerItem, tempMonth === index && styles.pickerItemSelected]}
                    onPress={() => setTempMonth(index)}
                  >
                    <Text style={[styles.pickerItemText, tempMonth === index && styles.pickerItemTextSelected]}>
                      {item}
                    </Text>
                  </PressableFade>
                )}
              />
            </View>

            <View style={[styles.pickerContainer, styles.rightPicker]}>
              <FlatList
                data={years}
                keyExtractor={(item) => item.toString()}
                initialScrollIndex={getInitialScrollIndex(years, tempYear)}
                getItemLayout={(_, index) => ({
                  length: PICKER_ITEM_HEIGHT,
                  offset: PICKER_ITEM_HEIGHT * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <PressableFade
                    style={[styles.pickerItem, tempYear === item && styles.pickerItemSelected]}
                    onPress={() => setTempYear(item)}
                  >
                    <Text style={[styles.pickerItemText, tempYear === item && styles.pickerItemTextSelected]}>
                      {item.toString()}
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
            {formatDisplayDate(selectedDate)}
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
    height: PICKER_ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
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
});

export default YearMonthPicker;
