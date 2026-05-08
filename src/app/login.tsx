import { Image } from "expo-image";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { ThemedText } from "../components/default/themed-text";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        TagLab
      </ThemedText>
      <View style={styles.content}>
        <ThemedText style={styles.subtitle}>
          Connect a music service to start tagging
        </ThemedText>
        <TouchableHighlight
          style={styles.spotifyButton}
          underlayColor="#1db954"
        >
          <View style={styles.buttonContent}>
            <Image
              source={require("@/assets/images/Spotify_White_WText.svg")}
              style={styles.spotifyLogo}
              contentFit="contain"
            />
          </View>
        </TouchableHighlight>

        <TouchableHighlight style={styles.appleButton} underlayColor="#FFFFFF">
          <View style={styles.buttonContent}>
            <Image
              source={require("@/assets/images/newapplemusic.png")}
              style={styles.appleLogo}
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
    backgroundColor: "#1ED760",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  spotifyLogo: {
    width: 200,
    height: 25,
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  appleLogo: {
    width: 200,
    height: 25,
  },
});
