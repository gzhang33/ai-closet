import React from "react";
import { ScrollView, View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { spacing } from "../../styles/globalStyles";
import FilterChip from "./FilterChip";

type TagData = {
  tag: string;
  count: number;
}[];

interface Props {
  tagData: TagData;
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const TagFilterSection = ({ tagData, selectedTags, onTagPress, containerStyle }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (tagData.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {tagData.map(({ tag, count }) => (
          <FilterChip
            key={tag}
            name={tag}
            isSelected={selectedTags.includes(tag)}
            onPress={() => onTagPress(tag)}
            count={count}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    maxHeight: 42,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border_light,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default TagFilterSection;
