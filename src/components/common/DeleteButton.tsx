import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";

type Props = {
  onDelete: () => void;
  selectedCount: number;
};

const DeleteButton = ({ onDelete, selectedCount }: Props) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onDelete}>
        <MaterialIcons name="delete" size={24} color={colors.screen_background} />
        <Text style={styles.text}>
          {t("selection.deleteItems", { count: selectedCount })}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary_red,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  text: {
    color: colors.screen_background,
    fontSize: 16,
    fontFamily: typography.medium,
  },
});

export default DeleteButton;
