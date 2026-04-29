import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

export default function NowPlayingCard() {
  return (
    <View style={styles.card}>
      <ThemedText type="smallText" style={styles.nowPlayingText}>
        Now Playing
      </ThemedText>
      <View style={styles.content}>
        <View style={styles.songInfo}>
          <ThemedText type="title">All Too Well Ten Minute</ThemedText>
          <ThemedText type="default">Taylor Swift</ThemedText>
          <View style={styles.tagRow}>
            <Tag></Tag>
            <Tag></Tag>
          </View>
          <TouchableHighlight style={styles.tagButton}>
            <View style={styles.tagButtonContent}>
              <Text style={styles.tagButtonText}>Tag This Song</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/testimage.png")}
            style={styles.albumImage}
          ></Image>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: "#1F1F1F",
    width: "100%",
    height: 150,
    borderColor: "#302F2F",
    borderWidth: 1,
    padding: 10,
  },
  nowPlayingText: {
    position: "absolute",
    paddingLeft: 10,
    paddingTop: 10,
  },
  content: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  songInfo: {
    width: "60%",
    height: "100%",
    alignItems: "flex-end",
    paddingTop: 15,
  },
  tagRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
    gap: 5,
  },
  tagButton: {
    flex: 1,
    backgroundColor: "#3FA46B",
    alignSelf: "stretch",
    borderRadius: 15,
    marginTop: 10,
  },
  tagButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tagButtonText: {
    color: "white",
    fontFamily: "UrbanistBold",
  },
  imageContainer: {
    // backgroundColor: "#00FF00",
    width: "40%",
    height: "100%",
    alignItems: "flex-end",
  },
  albumImage: {
    height: "100%",
    width: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
});
