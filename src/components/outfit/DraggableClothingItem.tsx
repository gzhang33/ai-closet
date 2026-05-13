import React from "react";
import { StyleSheet, Image, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from "react-native-reanimated";
import { Entypo } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { ClothingItem } from "../../types/ClothingItem";
import { OutfitItem } from "../../types/Outfit";

type Props = {
  item: ClothingItem;
  transform: OutfitItem["transform"];
  canvasLayout: { width: number; height: number };
  onUpdate: (transform: OutfitItem["transform"]) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  style?: any;
};

const CONTROL_BUTTON_SIZE = 28;
const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const DEFAULT_ITEM_SIZE = 260;

const DraggableClothingItem = ({
  item,
  transform,
  canvasLayout,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  style,
}: Props) => {
  const translateX = useSharedValue(transform.x);
  const translateY = useSharedValue(transform.y);
  const scale = useSharedValue(transform.scale);
  const rotate = useSharedValue(transform.rotation);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const savedValues = useSharedValue({
    scale: transform.scale,
    rotation: transform.rotation,
    translationX: transform.x,
    translationY: transform.y,
  });

  const updateTransform = () => {
    onUpdate({
      x: translateX.value,
      y: translateY.value,
      scale: scale.value,
      rotation: rotate.value,
    });
  };

  const dragGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      savedValues.value = {
        ...savedValues.value,
        translationX: translateX.value,
        translationY: translateY.value,
      };
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      const newX = savedValues.value.translationX + e.translationX;
      const newY = savedValues.value.translationY + e.translationY;

      const scaledSize = DEFAULT_ITEM_SIZE * scale.value;
      const halfItemSize = scaledSize / 2;
      const minX = -halfItemSize;
      const maxX = canvasLayout.width - halfItemSize;
      const minY = -halfItemSize;
      const maxY = canvasLayout.height - halfItemSize;

      translateX.value = Math.max(minX, Math.min(maxX, newX));
      translateY.value = Math.max(minY, Math.min(maxY, newY));
    })
    .onEnd(() => {
      runOnJS(updateTransform)();
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      runOnJS(onSelect)();
    })
    .maxDuration(250);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedValues.value = {
        ...savedValues.value,
        scale: scale.value,
      };
    })
    .onUpdate((e) => {
      const newScale = savedValues.value.scale * e.scale;
      if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
        scale.value = newScale;

        const scaledSize = DEFAULT_ITEM_SIZE * newScale;
        const halfItemSize = scaledSize / 2;
        const minX = -halfItemSize;
        const maxX = canvasLayout.width - halfItemSize;
        const minY = -halfItemSize;
        const maxY = canvasLayout.height - halfItemSize;

        translateX.value = Math.max(minX, Math.min(maxX, translateX.value));
        translateY.value = Math.max(minY, Math.min(maxY, translateY.value));
      }
    })
    .onEnd(() => {
      runOnJS(updateTransform)();
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      savedValues.value = {
        ...savedValues.value,
        rotation: rotate.value,
      };
    })
    .onUpdate((e) => {
      rotate.value = savedValues.value.rotation + e.rotation;
    })
    .onEnd(() => {
      runOnJS(updateTransform)();
    });

  const pinchAndRotate = Gesture.Simultaneous(pinchGesture, rotationGesture);
  const dragAndTap = Gesture.Exclusive(dragGesture, tapGesture);
  const composed = Gesture.Race(pinchAndRotate, dragAndTap);

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, rStyle, style]}>
        <View style={[styles.imageContainer, isSelected && styles.selected]}>
          <Image
            source={{ uri: item.backgroundRemovedImageUri || item.imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {isSelected && (
          <GestureDetector gesture={Gesture.Tap().onStart(() => runOnJS(onDelete)())}>
            <View style={styles.deleteButton}>
              <Entypo name="cross" size={16} color={colors.text_inverse} />
            </View>
          </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    position: "absolute",
    width: DEFAULT_ITEM_SIZE,
    height: DEFAULT_ITEM_SIZE,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    top: -CONTROL_BUTTON_SIZE / 2,
    right: -CONTROL_BUTTON_SIZE / 2,
    backgroundColor: colors.error,
  },
});

export default DraggableClothingItem;
