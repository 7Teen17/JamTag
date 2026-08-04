import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { SpotifyAuthProvider } from "@/src/hooks/auth/SpotifyAuthProvider";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { setupDB } from "../db/db";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [databaseReady, setDatabaseReady] = useState(false);

  const [loaded] = useFonts({
    UrbanistRegular: require("@/assets/fonts/Urbanist-Regular.ttf"),
    UrbanistLight: require("@/assets/fonts/Urbanist-Light.ttf"),
    UrbanistBold: require("@/assets/fonts/Urbanist-Bold.ttf"),
  });

  useEffect(() => {
    setupDB();
    setDatabaseReady(true);
  });

  useEffect(() => {
    if (loaded && databaseReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, databaseReady]);

  if (!loaded || !databaseReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SpotifyAuthProvider>
        <BottomSheetModalProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: true,
                  title: "JamTag",
                  headerTitleStyle: { fontFamily: "UrbanistBold" },
                }}
              />
              <Stack.Screen
                name="editTags"
                options={{ presentation: "modal", title: "Edit Tags" }}
              />
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </SpotifyAuthProvider>
    </GestureHandlerRootView>
  );
}
