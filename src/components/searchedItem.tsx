import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";
import { MusicTrack } from "../services/music/types";
import { useBottomSheet } from "./bottomSheetProvider";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";
import { useSongTags } from "../hooks/useSongTags";
import { getVisibleTagCount } from "../utils/getVisibleTagCount";

type SearchedItemProps = {
  id: string;
  track?: MusicTrack;
};

export default function SearchedItem({
  id,
  track: searchTrack,
}: SearchedItemProps) {
  const [loadedTrack, setTrack] = useState<MusicTrack | null>(null);
  const [loading, setLoading] = useState(!searchTrack);
  const { isAuthenticated, musicService } = useSpotifyAuth();
  const { openSheet } = useBottomSheet();

  const track = searchTrack ?? loadedTrack;

  useEffect(() => {
    if (searchTrack) return;
    async function loadTrack() {
      if (!isAuthenticated || !musicService) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const returned_track: MusicTrack | null = await musicService.getTrack(id);
      setTrack(returned_track);
      setLoading(false);
    }
    loadTrack();
  }, [id, isAuthenticated, musicService, searchTrack]);

  const [tagRowWidth, setTagRowWidth] = useState(0);
  const tags = useSongTags(searchTrack || !loading ? track?.providerTrackId : "");
  const visibleTagCount = getVisibleTagCount(tags, tagRowWidth, 4);

  return (
    <TouchableOpacity
      onPress={(event) => {
        if (track) {
          openSheet(track);
        }
      }}
      style={styles.container}
    >
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
          {!searchTrack && loading
            ? "Loading..."
            : track
              ? track.title
              : "Not found."}
        </ThemedText>
        <View style={styles.artistRow}>
          <ThemedText
            type="smallText"
            style={styles.artistText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {!searchTrack && loading
              ? "..."
              : track
                ? track.artist
                : "Not found."}
          </ThemedText>
          {track?.isExplicit && <Tag type="explicit" value="E"></Tag>}
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
    </TouchableOpacity>
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
