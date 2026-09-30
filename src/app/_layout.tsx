import React from "react";
import { Stack } from "expo-router";
import { StoreProvider } from "../store";
import { useFonts } from "expo-font";
import { Platform } from "react-native";
export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    PaylakRegular: require("../../assets/fonts/DejaVuSans.ttf"),
    PaylakBold: require("../../assets/fonts/DejaVuSans-Bold.ttf"),
  });
  if (Platform.OS === "web" && !fontsLoaded && !fontError) return null;
  return (
    <StoreProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </StoreProvider>
  );
}
