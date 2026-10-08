import { Image } from "expo-image";
import { Alert, StyleSheet, TouchableHighlight, View } from "react-native";
import { ThemedText } from "../components/default/themed-text";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";

export default function LoginScreen() {
  const { isSigningIn, signIn, canSignIn, status, musicService } =
    useSpotifyAuth();

  const handleSpotifyPress = async () => {
    if (!canSignIn) {
      return;
    }
    try {
      await signIn();
    } catch (error) {
      Alert.alert(
        "Spotify Login Failed",
        error instanceof Error
          ? error.message
          : "Unable to sign in with Spotify.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        JamTag
      </ThemedText>
      <View style={styles.content}>
        <ThemedText style={styles.subtitle}>
          Connect your Spotify account to start tagging
        </ThemedText>
        <TouchableHighlight
          disabled={!canSignIn}
          accessibilityState={{ disabled: !canSignIn, busy: isSigningIn }}
          onPress={handleSpotifyPress}
          style={[styles.spotifyButton, !canSignIn && styles.disabledButton]}
        >
          <View style={styles.buttonContent}>
            <ThemedText type="defaultSemiBold">Login with </ThemedText>
            <Image
              source={require("@/assets/images/Spotify_White_WText.svg")}
              style={styles.spotifyLogo}
              contentFit="contain"
            />
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  title: {
    position: "absolute",
    top: 150,
    fontSize: 50,
  },
  content: {
    width: "75%",
    height: 300,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: "UrbanistRegular",
    fontSize: 16,
  },
  spotifyText: {
    fontFamily: "UrbanistRegular",
    color: "white",
    fontSize: 20,
  },
  spotifyButton: {
    backgroundColor: "#1bbc53",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  spotifyLogo: {
    width: 90,
    height: 25,
  },
});
