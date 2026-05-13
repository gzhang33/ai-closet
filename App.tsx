import "react-native-get-random-values";
import { useFonts } from "expo-font";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_300Light,
} from "@expo-google-fonts/outfit";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from "@expo-google-fonts/playfair-display";
import AppNavigator from "./src/navigation";
import { ClothingProvider } from "./src/contexts/ClothingContext";
import { VirtualTryOnProvider } from "./src/contexts/VirtualTryOnContext";
import { OutfitProvider } from "./src/contexts/OutfitContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": Outfit_400Regular,
    "Outfit-Medium": Outfit_500Medium,
    "Outfit-SemiBold": Outfit_600SemiBold,
    "Outfit-Bold": Outfit_700Bold,
    "Outfit-Light": Outfit_300Light,
    "PlayfairDisplay-Bold": PlayfairDisplay_700Bold,
    "PlayfairDisplay-Italic": PlayfairDisplay_400Regular_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <ClothingProvider>
        <OutfitProvider>
          <VirtualTryOnProvider>
            <AppNavigator />
          </VirtualTryOnProvider>
        </OutfitProvider>
      </ClothingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
