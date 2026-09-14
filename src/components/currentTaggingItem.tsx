import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { MusicTrack } from "../services/music/types";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";
import { useSongTags } from "../hooks/useSongTags";
import { getVisibleTagCount } from "../utils/getVisibleTagCount";

type SearchedItemProps = {
  providedTrack: MusicTrack;
};

export default function CurrentTaggingItem({
  providedTrack,
}: SearchedItemProps) {
  const track = providedTrack;

  const [tagRowWidth, setTagRowWidth] = useState(0);
  const tags = useSongTags(track.providerTrackId);
  const visibleTagCount = getVisibleTagCount(tags, tagRowWidth, 4);

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
        <View style={styles.artistRow}>
          <ThemedText
            type="smallText"
            style={styles.artistText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {track.artist}
          </ThemedText>
          {track.isExplicit && <Tag type="explicit" value="E"></Tag>}
        </View>
        <View
          style={styles.tagRow}
          onLayout={(event) => setTagRowWidth(event.nativeEvent.layout.width)}
        >
          {tags.slice(0, visibleTagCount).map((tag) => (
            <Tag key={tag} value={tag} />
          ))}
          {tagRowWidth > 0 && visibleTagCount < tags.length && (
            <ThemedText type="smallText" numberOfLines={1} style={{ flexShrink: 0 }}>
              +{tags.length - visibleTagCount}
            </ThemedText>
          )}
        </View>
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
    flexShrink: 1,
    marginBottom: 3,
  },
  artistRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  infoView: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  tagRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    gap: 4,
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
