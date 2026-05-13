import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet, View } from "react-native";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import ClothingManagementScreen from "../screens/ClothingManagementScreen";
import ClothingDetailScreen from "../screens/ClothingDetailScreen";
import OutfitManagementScreen from "../screens/OutfitManagementScreen";
import OutfitCanvasScreen from "../screens/OutfitCanvasScreen";
import OutfitDetailScreen from "../screens/OutfitDetailScreen";
import VirtualTryOnScreen from "../screens/VirtualTryOnScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useTheme } from "../contexts/ThemeContext";
import { typography, spacing, createShadows } from "../styles/globalStyles";
import {
  RootStackParamList,
  MainTabParamList,
  ClosetStackParamList,
  OutfitStackParamList,
  TryOnStackParamList,
} from "../types/navigation";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ClosetStack = createNativeStackNavigator<ClosetStackParamList>();
const OutfitStack = createNativeStackNavigator<OutfitStackParamList>();
const TryOnStack = createNativeStackNavigator<TryOnStackParamList>();

const ClosetStackNavigator = () => (
  <ClosetStack.Navigator screenOptions={{ headerShown: false }}>
    <ClosetStack.Screen name="ClothingManagement" component={ClothingManagementScreen} />
    <ClosetStack.Screen name="ClothingDetail" component={ClothingDetailScreen} />
  </ClosetStack.Navigator>
);

const OutfitStackNavigator = () => (
  <OutfitStack.Navigator screenOptions={{ headerShown: false }}>
    <OutfitStack.Screen name="OutfitManagement" component={OutfitManagementScreen} />
    <OutfitStack.Screen name="OutfitCanvas" component={OutfitCanvasScreen} />
    <OutfitStack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
  </OutfitStack.Navigator>
);

const TryOnStackNavigator = () => (
  <TryOnStack.Navigator screenOptions={{ headerShown: false }}>
    <TryOnStack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
  </TryOnStack.Navigator>
);

const MainTabNavigator = () => {
  const { colors } = useTheme();
  const shadows = createShadows(colors);

  const tabBarStyle = {
    position: "absolute" as const,
    height: Platform.OS === "ios" ? 88 : 64,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    paddingTop: spacing.sm,
    borderTopWidth: 0,
    backgroundColor: colors.surface_card,
    borderTopColor: colors.transparent,
    ...shadows.medium,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [tabBarStyle],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text_tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen
        name="Closet"
        component={ClosetStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary_subtle }]}>
              <MaterialCommunityIcons name="wardrobe" size={focused ? 26 : 24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Outfits"
        component={OutfitStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary_subtle }]}>
              <MaterialIcons name="checkroom" size={focused ? 26 : 24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="TryOn"
        component={TryOnStackNavigator}
        options={{
          tabBarLabel: "Try-On",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary_subtle }]}>
              <FontAwesome6 name="wand-magic-sparkles" size={focused ? 22 : 20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary_subtle }]}>
              <MaterialIcons name="person" size={focused ? 26 : 24} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
        <RootStack.Group screenOptions={{ presentation: "modal" }}>
          <RootStack.Screen name="ClothingDetailModal" component={ClothingDetailScreen} />
          <RootStack.Screen name="OutfitDetailModal" component={OutfitDetailScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontFamily: typography.medium,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tabBarIcon: {
    marginTop: 0,
  },
  iconContainer: {
    width: 40,
    height: 28,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: 14,
  },
});

export default AppNavigator;
