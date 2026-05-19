import { Image, StyleSheet, TouchableHighlight, View } from "react-native";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

export default function SearchedItem() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/no_album_cover.png")}
        style={styles.image}
      ></Image>
      <View style={styles.infoView}>
        <ThemedText type="title" style={styles.titleText}>
          Blinding Lights
        </ThemedText>
        <ThemedText type="smallText" style={styles.artistText}>
          The Weeknd
        </ThemedText>
        <Tag></Tag>
      </View>
      <TouchableHighlight style={styles.tagButton}>
        <ThemedText style={styles.tagButtonText} type="subtitle">
          Tag
        </ThemedText>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "auto",
    height: 60,
    margin: 7,
    display: "flex",
    flexDirection: "row",
  },
  image: {
    height: "100%",
    width: undefined,
    aspectRatio: 1,
    borderRadius: 5,
    marginRight: 5,
  },
  titleText: {
    fontSize: 16,
    marginTop: 3,
  },
  artistText: {
    marginBottom: 3,
  },
  infoView: {
    flex: 1,
  },
  tagButton: {
    width: 80,
    height: "auto",
    backgroundColor: "#D9D9D9",
    borderRadius: 5,
    margin: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tagButtonText: {
    color: "black",
    fontSize: 16,
  },
});
