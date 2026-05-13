import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

type Props = {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
};

const TagChips = ({ tags, onAddTag, onRemoveTag }: Props) => {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag("");
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tags.map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
            <PressableFade onPress={() => onRemoveTag(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={14} color={colors.text_tertiary} />
            </PressableFade>
          </View>
        ))}
        {isAdding ? (
          <View style={styles.addChip}>
            <TextInput
              style={styles.input}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              placeholder="New tag..."
              autoFocus
              placeholderTextColor={colors.text_tertiary}
            />
            <PressableFade onPress={handleAddTag}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary} />
            </PressableFade>
          </View>
        ) : (
          <PressableFade style={styles.addButton} onPress={() => setIsAdding(true)}>
            <MaterialIcons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </PressableFade>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {},
  scrollContent: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
  },
  chip: {
    height: 32,
    flexDirection: "row",
    backgroundColor: colors.primary_subtle,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: "center",
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  chipText: {
    color: colors.primary_dark,
    fontSize: 13,
    fontFamily: typography.medium,
    letterSpacing: 0.2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.medium,
    letterSpacing: 0.2,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary_light,
    backgroundColor: colors.primary_subtle,
    gap: spacing.xs,
  },
  input: {
    minWidth: 60,
    fontSize: 13,
    fontFamily: typography.regular,
    color: colors.text_primary,
    padding: 0,
    margin: 0,
  },
});

export default TagChips;
