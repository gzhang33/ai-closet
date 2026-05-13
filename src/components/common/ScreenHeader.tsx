import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { createSharedStyles } from "../../styles/sharedStyles";

interface ScreenHeaderProps {
  title: string;
  onFilterPress?: () => void;
}

const ScreenHeader = ({ title, onFilterPress }: ScreenHeaderProps) => {
  const { colors } = useTheme();
  const sharedStyles = createSharedStyles(colors);

  return (
    <View style={sharedStyles.header}>
      <Text style={sharedStyles.screenTitle}>{title}</Text>
      {onFilterPress && (
        <Pressable style={sharedStyles.filterButton} onPress={onFilterPress}>
          <MaterialIcons name="tune" size={22} color={colors.text_secondary} />
        </Pressable>
      )}
    </View>
  );
};

export default ScreenHeader;
