import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme, type ThemeColors } from "../../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../../styles/globalStyles";

type Props = {
  progress: number;
};

const TryOnProgress = ({ progress }: Props) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rendering...</Text>
        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.primary_subtle,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.primary_light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    letterSpacing: 0.2,
  },
  percentage: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  progressBackground: {
    height: 6,
    backgroundColor: colors.surface_card,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default TryOnProgress;
