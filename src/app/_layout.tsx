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
import { useSpotifyAuth } from "@/src/hooks/auth/useSpotifyAuth";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { setupDB } from "../db/db";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AuthStack() {
  const { status } = useSpotifyAuth();

  // Wait for saved credentials before choosing which screens are accessible.
  if (status === "restoring") return null;

  return (
    <Stack>
      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            title: "JamTag",
            headerTitleStyle: { fontFamily: "UrbanistBold" },
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

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
      <KeyboardProvider>
        <SpotifyAuthProvider>
          <BottomSheetModalProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <AuthStack />
              <StatusBar style="auto" />
            </ThemeProvider>
          </BottomSheetModalProvider>
        </SpotifyAuthProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
