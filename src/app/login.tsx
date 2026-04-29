import { StyleSheet, View } from "react-native";
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
    // backgroundColor: "red",
    alignItems: "center",
  },
  subtitle: {
    fontFamily: "UrbanistRegular",
    fontSize: 16,
  },
});
