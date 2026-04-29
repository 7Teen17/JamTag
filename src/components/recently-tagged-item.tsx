import { Image, StyleSheet, View } from "react-native";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

export default function RecentlyTaggedItem() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/testimage.png")}
          style={styles.image}
        ></Image>
      </View>
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>Blinding Lights</ThemedText>
        <ThemedText type="smallText">The Weeknd</ThemedText>
        <View style={styles.tagRow}>
          <Tag></Tag>
          <Tag></Tag>
          <ThemedText type="smallText">+17</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 125,
    padding: 5,
  },
  imageContainer: {
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
  textContainer: {
    paddingLeft: 5,
  },
  title: {
    paddingTop: 5,
  },
  tagRow: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingTop: 3,
  },
});
