import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { MusicTrack } from "../services/music/types";
import { ThemedText } from "./default/themed-text";

type SearchedItemProps = {
  providedTrack: MusicTrack;
};

export default function CurrentTaggingItem({
  providedTrack,
}: SearchedItemProps) {
  const [track, setTrack] = useState<MusicTrack>(providedTrack);

  return (
    <View style={styles.container}>
      <Image
        source={
          track?.artworkUrl
            ? { uri: track.artworkUrl }
            : require("@/assets/images/no_album_cover.png")
        }
        style={styles.image}
      ></Image>
      <View style={styles.infoView}>
        <ThemedText
          type="title"
          style={styles.titleText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {track.title}
        </ThemedText>
        <ThemedText
          type="smallText"
          style={styles.artistText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {track.artist}
        </ThemedText>
      </View>
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
    justifyContent: "center",
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
