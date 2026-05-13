import React, { useState } from "react";
import { StyleSheet, Animated, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius, createShadows, layout } from "../../styles/globalStyles";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const BUTTON_SIZE = 56;
const BUTTON_MARGIN = 16;
const TOTAL_BUTTON_HEIGHT = BUTTON_SIZE + BUTTON_MARGIN;

const AnimatedAddButton = ({
  onChoosePhoto,
  onTakePhoto,
}: {
  onChoosePhoto: () => void;
  onTakePhoto: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const { colors } = useTheme();
  const shadows = createShadows(colors);
  const styles = createStyles(colors, shadows);

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.timing(animation, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "135deg"],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const mainButtonColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.primary_dark],
  });

  const renderOptionButton = (
    icon: IconName,
    label: string,
    onPress: () => void,
    translateY: Animated.AnimatedInterpolation<number>
  ) => (
    <Animated.View
      style={[
        styles.optionButton,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.Text style={[styles.buttonLabel, { opacity }]}>{label}</Animated.Text>
      <Pressable
        style={[styles.circleButton, { backgroundColor: colors.surface_card }]}
        onPress={() => {
          onPress();
          toggleMenu();
        }}
      >
        <MaterialIcons name={icon} size={24} color={colors.primary} />
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      {isOpen && (
        <Pressable
          style={styles.dimmedBackground}
          onPress={toggleMenu}
        />
      )}

      {renderOptionButton(
        "photo-library",
        "From Photos",
        onChoosePhoto,
        animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -TOTAL_BUTTON_HEIGHT * 2],
        })
      )}

      {renderOptionButton(
        "camera-alt",
        "Take Photo",
        onTakePhoto,
        animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -TOTAL_BUTTON_HEIGHT],
        })
      )}

      <Animated.View
        style={[
          styles.addButton,
          {
            backgroundColor: mainButtonColor,
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        <Pressable onPress={toggleMenu} style={styles.mainButtonTouchable}>
          <MaterialIcons name="add" size={28} color={colors.text_inverse} />
        </Pressable>
      </Animated.View>
    </>
  );
};

const createStyles = (colors: ThemeColors, shadows: ReturnType<typeof createShadows>) => StyleSheet.create({
  addButton: {
    position: "absolute",
    bottom: layout.tabBarHeight + spacing.xxl + 4,
    right: spacing.xxl,
    borderRadius: BUTTON_SIZE / 2,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  mainButtonTouchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  optionButton: {
    position: "absolute",
    bottom: layout.tabBarHeight + spacing.xxl + 4,
    right: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  circleButton: {
    borderRadius: BUTTON_SIZE / 2,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },
  buttonLabel: {
    marginRight: spacing.sm,
    color: colors.text_primary,
    fontSize: 14,
    fontFamily: typography.medium,
    backgroundColor: colors.surface_card_80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  dimmedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay_heavy,
  },
});

export default AnimatedAddButton;
