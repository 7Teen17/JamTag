import { StyleSheet, View } from "react-native";
import { ThemedText } from "./default/themed-text";

export default function Tag() {
  return (
    <View style={styles.container}>
      <ThemedText type="tag" style={styles.text}>
        Cool
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  text: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});
